import React, { useEffect, useRef, useState } from 'react';
import { useCascadeGameStore } from '@entities/cascade/model/store';
import { CascadeSymbolType } from '@shared/types/cascade';
import { CascadeCell } from './CascadeCell';
import './CascadeBoard.css';

const BOARD_SIZE = 7;
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isValidBoard = (b: number[][] | undefined | null): b is number[][] => {
  return !!b && b.length === BOARD_SIZE && b.every(row => row && row.length === BOARD_SIZE);
};

const boardsEqual = (a: number[][] | null | undefined, b: number[][] | null | undefined) => {
  if (!isValidBoard(a) || !isValidBoard(b)) return false;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
};

export const CascadeBoard: React.FC = () => {
  const { board, isSpinning, isResolving, cascades, currentCascadeIndex, isTurbo, updateBoardAfterCascade } = useCascadeGameStore();
  const [displayBoard, setDisplayBoard] = useState<number[][]>(board);
  const [explodingCells, setExplodingCells] = useState<Set<string>>(new Set());
  const [fallingSymbols, setFallingSymbols] = useState<Map<string, { from: number; to: number }>>(new Map());
  const [cellMultipliers, setCellMultipliers] = useState<Map<string, number>>(new Map()); // Множители для ячеек каскада

  // Анимация спина SugarRush: exit вниз по колонкам -> enter сверху по колонкам
  const [spinExitingCells, setSpinExitingCells] = useState<Map<string, number>>(new Map()); // cellKey -> delayMs
  const [spinFallingSymbols, setSpinFallingSymbols] = useState<Map<string, { from: number; to: number; delayMs?: number }>>(new Map());

  const displayBoardRef = useRef(displayBoard);
  useEffect(() => {
    displayBoardRef.current = displayBoard;
  }, [displayBoard]);

  const spinStartBoardRef = useRef<number[][] | null>(null);
  const incomingBoardRef = useRef<number[][] | null>(null);
  const spinRunIdRef = useRef(0);

  // Функция для расчета длительности анимаций в зависимости от турбо режима
  const getAnimationDuration = (normalDuration: number) => {
    return isTurbo ? normalDuration * 0.1 : normalDuration; // В турбо режиме анимации в 10 раз быстрее
  };

  // Сбрасываем множители при начале нового спина
  useEffect(() => {
    if (isSpinning && !isResolving) {
      // Сбрасываем все множители при начале нового спина
      setCellMultipliers(new Map());
    }
  }, [isSpinning, isResolving]);

  // Фиксируем "стартовую" доску спина (до прихода результата) и ловим "входящую" доску из бекенда
  useEffect(() => {
    if (isSpinning && !isResolving) {
      spinStartBoardRef.current = isValidBoard(board) ? board.map(row => [...row]) : null;
      incomingBoardRef.current = null;
    }
  }, [isSpinning, isResolving]);

  useEffect(() => {
    if (!isSpinning || isResolving) return;
    if (!isValidBoard(board)) return;
    const start = spinStartBoardRef.current;
    if (start && boardsEqual(board, start)) return;
    incomingBoardRef.current = board.map(row => [...row]);
  }, [board, isSpinning, isResolving]);

  // Новый сценарий спина для SugarRush:
  // 1) старые символы падают вниз из столбцов слева направо
  // 2) по приходу board с бэка - новые символы падают сверху, тоже слева направо
  useEffect(() => {
    if (!isSpinning || isResolving) return;

    let cancelled = false;
    const runId = ++spinRunIdRef.current;

    const run = async () => {
      // чистим "каскадные" анимации, чтобы спин был визуально чистым
      setExplodingCells(new Set());
      setFallingSymbols(new Map());
      setSpinExitingCells(new Map());
      setSpinFallingSymbols(new Map());

      // Ускорение спин-анимации в 3 раза
      const exitDuration = getAnimationDuration(60);
      const enterDuration = getAnimationDuration(87);
      const colGap = getAnimationDuration(23);
      const rowStagger = getAnimationDuration(4);

      // Phase A: exit вниз по колонкам
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (cancelled || spinRunIdRef.current !== runId) return;

        const current = displayBoardRef.current;
        if (!isValidBoard(current)) continue;

        const colExits = new Map<string, number>();
        let hasAny = false;
        for (let row = 0; row < BOARD_SIZE; row++) {
          if (current[row][col] !== -1) {
            hasAny = true;
            colExits.set(`${row}-${col}`, row * rowStagger);
          }
        }
        if (!hasAny) continue;

        setSpinExitingCells(prev => {
          const next = new Map(prev);
          colExits.forEach((delay, key) => next.set(key, delay));
          return next;
        });

        await sleep(exitDuration + rowStagger * (BOARD_SIZE - 1));
        if (cancelled || spinRunIdRef.current !== runId) return;

        // очищаем колонку в displayBoard
        setDisplayBoard(prev => {
          if (!isValidBoard(prev)) return prev;
          const next = prev.map(r => [...r]);
          for (let row = 0; row < BOARD_SIZE; row++) next[row][col] = -1;
          return next;
        });

        // убираем exiting-флаги этой колонки
        setSpinExitingCells(prev => {
          const next = new Map(prev);
          colExits.forEach((_, key) => next.delete(key));
          return next;
        });

        await sleep(colGap);
      }

      // Phase B: ждём доску от бэка (initial board)
      while (!cancelled && spinRunIdRef.current === runId) {
        if (incomingBoardRef.current) break;
        await sleep(16);
      }
      if (cancelled || spinRunIdRef.current !== runId) return;

      const incoming = incomingBoardRef.current;
      if (!isValidBoard(incoming)) return;

      // Phase C: enter сверху по колонкам
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (cancelled || spinRunIdRef.current !== runId) return;

        // ставим значения колонки
        setDisplayBoard(prev => {
          if (!isValidBoard(prev)) return prev;
          const next = prev.map(r => [...r]);
          for (let row = 0; row < BOARD_SIZE; row++) next[row][col] = incoming[row][col];
          return next;
        });

        // запускаем падение сверху (from = -1) на все непустые ячейки колонки
        const colFalls = new Map<string, { from: number; to: number; delayMs?: number }>();
        for (let row = 0; row < BOARD_SIZE; row++) {
          if (incoming[row][col] !== -1) {
            colFalls.set(`${row}-${col}`, { from: -1, to: row, delayMs: row * rowStagger });
          }
        }

        if (colFalls.size > 0) {
          setSpinFallingSymbols(prev => {
            const next = new Map(prev);
            colFalls.forEach((v, key) => next.set(key, v));
            return next;
          });

          await sleep(enterDuration + rowStagger * (BOARD_SIZE - 1));

          if (cancelled || spinRunIdRef.current !== runId) return;

          setSpinFallingSymbols(prev => {
            const next = new Map(prev);
            colFalls.forEach((_, key) => next.delete(key));
            return next;
          });
        }

        await sleep(colGap);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isSpinning, isResolving, isTurbo]);

  // Синхронизируем displayBoard с board при изменении доски
  // Только когда нет активных анимаций (не спин, не каскад)
  // Это обновляет доску после завершения всех каскадов (когда board становится финальной доской)
  useEffect(() => {
    if (!isSpinning && !isResolving && currentCascadeIndex < 0) {
      // Проверяем валидность доски перед синхронизацией
      const isBoardOk = board && board.length === 7 && board.every(row => row && row.length === 7);
      if (isBoardOk) {
        // После завершения каскадов board содержит финальную доску
        setDisplayBoard(board.map(row => [...row]));
        setExplodingCells(new Set());
        setFallingSymbols(new Map());
        setSpinExitingCells(new Map());
        setSpinFallingSymbols(new Map());
        // Очищаем множители только после завершения всех каскадов
        setCellMultipliers(new Map());
      } else {
        console.warn('Invalid board during sync, skipping update:', board);
      }
    }
  }, [board, isSpinning, isResolving, currentCascadeIndex]);

  // Синхронизируем displayBoard когда начинается каскад (currentCascadeIndex становится 0)
  // Сразу показываем начальную доску с кластерами для анимации каскада
  useEffect(() => {
    if (isResolving && currentCascadeIndex === 0) {
      console.log('Starting cascade animation, board:', board);
      // Сразу показываем начальную доску с кластерами
      const isValidBoard = board && board.length === 7 && board.every(row => row && row.length === 7);
      if (isValidBoard) {
        setDisplayBoard(board.map(row => [...row]));
        setExplodingCells(new Set());
        setFallingSymbols(new Map());
      }
    }
  }, [isResolving, currentCascadeIndex, board]);

  // Функция для построения доски после каскада на основе данных бекенда
  // Использует только данные из cascade: кластеры для удаления и new_symbols для добавления
  const buildBoardAfterCascade = (currentBoard: number[][], cascade: any): number[][] => {
    const BOARD_SIZE = 7;
    const newBoard = currentBoard.map(row => [...row]);
    
    console.log('buildBoardAfterCascade: Input board:', currentBoard);
    console.log('buildBoardAfterCascade: Clusters to remove:', cascade.clusters);
    console.log('buildBoardAfterCascade: New symbols to add:', cascade.new_symbols);
    
    // Шаг 1: Удаляем кластеры (используем данные бекенда)
    cascade.clusters.forEach((cluster: any) => {
      cluster.cells.forEach((cell: any) => {
        if (cell.row >= 0 && cell.row < BOARD_SIZE && cell.col >= 0 && cell.col < BOARD_SIZE) {
          newBoard[cell.row][cell.col] = -1; // Пусто
        }
      });
    });
    
    console.log('buildBoardAfterCascade: After cluster removal:', newBoard);
    
    // Шаг 2: Применяем гравитацию (детерминированная операция - символы падают вниз)
    // Это должно точно соответствовать логике collapse на бэкэнде
    for (let col = 0; col < BOARD_SIZE; col++) {
      const column: number[] = [];
      // Собираем все непустые символы в столбце (сверху вниз)
      for (let row = 0; row < BOARD_SIZE; row++) {
        if (newBoard[row][col] !== -1) {
          column.push(newBoard[row][col]);
        }
      }
      // Очищаем столбец
      for (let row = 0; row < BOARD_SIZE; row++) {
        newBoard[row][col] = -1;
      }
      // Заполняем снизу вверх (как в бэкэнде - board[rows-len(stack)+i][c] = sym)
      const startRow = BOARD_SIZE - column.length;
      for (let i = 0; i < column.length; i++) {
        newBoard[startRow + i][col] = column[i];
      }
    }
    
    console.log('buildBoardAfterCascade: After gravity:', newBoard);
    
    // Шаг 3: Добавляем новые символы из бекенда (используем только cascade.new_symbols)
    cascade.new_symbols.forEach((newSymbol: any) => {
      if (newSymbol.symbol !== -1 && 
          newSymbol.position && 
          newSymbol.position.row >= 0 && 
          newSymbol.position.row < BOARD_SIZE && 
          newSymbol.position.col >= 0 && 
          newSymbol.position.col < BOARD_SIZE) {
        newBoard[newSymbol.position.row][newSymbol.position.col] = newSymbol.symbol;
      }
    });
    
    console.log('buildBoardAfterCascade: Final board:', newBoard);
    
    return newBoard;
  };

  // Обрабатываем каскады
  useEffect(() => {
    if (isResolving && cascades.length > 0 && currentCascadeIndex >= 0) {
      const cascade = cascades[currentCascadeIndex];
      
      // Функция для расчета длительности анимаций каскадов в зависимости от турбо режима
      const getCascadeDuration = (normalDuration: number) => {
        return isTurbo ? normalDuration * 0.1 : normalDuration; // В турбо режиме анимации в 10 раз быстрее
      };

      // Небольшая задержка для стабилизации доски перед началом анимации каскада
      const initialDelay = getCascadeDuration(300); // 300ms для стабилизации доски (или 30ms в турбо)
      
      const initialTimer = setTimeout(() => {
        // ВАЖНО: Получаем актуальную доску из store для каждого каскада
        // Используем getState() чтобы избежать устаревших данных из замыкания
        // Это гарантирует, что каждый каскад использует доску после предыдущего каскада
        const currentState = useCascadeGameStore.getState();
        const currentBoard = currentState.board;
        
        const isValidBoard = currentBoard && currentBoard.length === 7 && currentBoard.every(row => row && row.length === 7);
        
        if (!isValidBoard) {
          console.error('Invalid board in cascade animation:', currentBoard);
          return;
        }
        
        // Сохраняем текущую доску для этого каскада (с кластерами из бэкэнда)
        // Это будет использоваться для построения финальной доски после каскада
        const currentBoardForCascade = currentBoard.map(row => [...row]);
        
        // Убеждаемся, что displayBoard показывает актуальную доску с кластерами из бэкэнда
        setDisplayBoard(currentBoardForCascade);
        console.log(`Cascade ${currentCascadeIndex}: Using board from backend:`, currentBoardForCascade);
        
        // Помечаем ячейки для подсветки и сохраняем множители из бекенда
        const newHighlighted = new Set<string>();
        const multipliersMap = new Map<string, number>();
        
        cascade.clusters.forEach((cluster: any) => {
          // Отладочный вывод для проверки всех ячеек кластера
          console.log(`Cluster symbol ${cluster.symbol}, count: ${cluster.count}, multiplier: ${cluster.multiplier}, cells:`, cluster.cells);
          cluster.cells.forEach((cell: any) => {
            // Проверяем валидность позиции ячейки
            if (cell.row >= 0 && cell.row < 7 && cell.col >= 0 && cell.col < 7) {
              const cellKey = `${cell.row}-${cell.col}`;
              const symbolInCell = currentBoardForCascade[cell.row][cell.col];
              
              // ВАЖНО: Проверяем, что символ в ячейке соответствует символу кластера из бэкэнда
              if (symbolInCell !== cluster.symbol) {
                console.error(`MISMATCH! Cell [${cell.row},${cell.col}] has symbol ${symbolInCell}, but cluster expects ${cluster.symbol}`);
                console.error('Current board:', currentBoardForCascade);
                console.error('Cluster:', cluster);
              }
              
              newHighlighted.add(cellKey);
              // Сохраняем множитель для этой ячейки из бекенда
              multipliersMap.set(cellKey, cluster.multiplier);
              console.log(`Cell [${cell.row},${cell.col}]: symbol=${symbolInCell}, cluster.symbol=${cluster.symbol}, multiplier=${cluster.multiplier}x`);
            } else {
              console.warn(`Invalid cell position: row=${cell.row}, col=${cell.col}`);
            }
          });
        });
        console.log(`Total highlighted cells: ${newHighlighted.size}`);
        // Накапливаем множители в течение одного спина (если ячейка участвует в нескольких каскадах)
        // Используем максимальное значение множителя для ячейки
        setCellMultipliers(prevMultipliers => {
          const updatedMultipliers = new Map(prevMultipliers);
          multipliersMap.forEach((multiplier, cellKey) => {
            const existingMultiplier = updatedMultipliers.get(cellKey);
            if (existingMultiplier !== undefined) {
              // Если ячейка уже имеет множитель, используем максимальное значение
              // Это соответствует логике бекенда, где множитель увеличивается с каждым каскадом
              updatedMultipliers.set(cellKey, Math.max(existingMultiplier, multiplier));
            } else {
              // Если ячейка не имеет множителя, устанавливаем новый
              updatedMultipliers.set(cellKey, multiplier);
            }
          });
          return updatedMultipliers;
        });
        // Устанавливаем множители и подсветку одновременно для правильной анимации
        setExplodingCells(newHighlighted); // Подсветка ячеек каскада

        // Шаг 1: Подсветка кластеров (1500ms - показываем комбинацию, или 150ms в турбо)
        const highlightTimer = setTimeout(() => {
        // После подсветки удаляем ячейки кластеров и ОЧИЩАЕМ подсветку
        setExplodingCells(new Set()); // Очищаем подсветку ПЕРЕД удалением
        
        // Создаем доску после удаления кластеров
        // Используем сохраненную доску для этого каскада (currentBoardForCascade) с бэкэнда
        const boardAfterRemoval = currentBoardForCascade.map(row => [...row]);
        cascade.clusters.forEach((cluster: any) => {
          cluster.cells.forEach((cell: any) => {
            if (cell.row >= 0 && cell.row < 7 && cell.col >= 0 && cell.col < 7) {
              boardAfterRemoval[cell.row][cell.col] = -1; // Пусто
            }
          });
        });
        
        // Вычисляем, какие символы куда должны упасть после гравитации
        // Это детерминированная операция - символы просто падают вниз
        const BOARD_SIZE = 7;
        const boardAfterGravity: number[][] = boardAfterRemoval.map(row => [...row]);
        const fallingMap = new Map<string, { from: number; to: number }>();
        
        // Для каждого столбца вычисляем гравитацию (как в бэкэнде - collapse)
        for (let col = 0; col < BOARD_SIZE; col++) {
          const column: number[] = [];
          const originalPositions: number[] = [];
          
          // Собираем все непустые символы в столбце СВЕРХУ ВНИЗ (как в бэкэнде!)
          for (let row = 0; row < BOARD_SIZE; row++) {
            if (boardAfterRemoval[row][col] !== -1) {
              column.push(boardAfterRemoval[row][col]);
              originalPositions.push(row);
            }
          }
          
          // Вычисляем новые позиции после гравитации (заполняем снизу вверх)
          const startRow = BOARD_SIZE - column.length;
          for (let i = 0; i < column.length; i++) {
            const newRow = startRow + i;
            const oldRow = originalPositions[i];
            
            boardAfterGravity[newRow][col] = column[i];
            
            // Если символ должен упасть вниз
            if (oldRow !== newRow) {
              const key = `${newRow}-${col}`;
              fallingMap.set(key, { from: oldRow, to: newRow });
            }
          }
          
          // Пустые ячейки сверху уже установлены в -1 при создании boardAfterGravity
        }
        
        // Шаг 2: Показываем доску после удаления (символы еще в исходных позициях)
        // Убеждаемся, что доска валидна перед установкой
        const validBoardAfterRemoval = boardAfterRemoval.map(row => [...row]);
        setDisplayBoard(validBoardAfterRemoval);
        
        // Шаг 3: Показываем анимацию падения существующих символов
        setFallingSymbols(fallingMap);
        
        // Шаг 4: После начала анимации обновляем доску с гравитацией (символы в новых позициях)
        // Небольшая задержка, чтобы анимация успела начаться
        const updateBoardTimer = setTimeout(() => {
          // Убеждаемся, что доска после гравитации валидна
          const validBoardAfterGravity = boardAfterGravity.map(row => [...row]);
          setDisplayBoard(validBoardAfterGravity);
        }, getCascadeDuration(50));
        
        // Шаг 5: После анимации падения очищаем fallingSymbols
        const gravityTimer = setTimeout(() => {
          setFallingSymbols(new Map());
          clearTimeout(updateBoardTimer);
          
          // Шаг 6: Анимация появления новых символов сверху
          // ВАЖНО: Используем только новые символы из cascade.new_symbols с бекенда
          const newSymbolsTimer = setTimeout(() => {
            // Строим финальную доску после каскада на основе данных бекенда
            // Используем сохраненную доску с кластерами для этого каскада
            const finalBoardAfterCascade = buildBoardAfterCascade(currentBoardForCascade, cascade);
            
            // Показываем доску после гравитации (без новых символов пока)
            // Новые символы будут добавлены с анимацией падения
            setDisplayBoard(boardAfterGravity.map(row => [...row]));
            
            // Затем показываем анимацию падения новых символов (только из бекенда)
            const newFalling = new Map<string, { from: number; to: number }>();
            cascade.new_symbols.forEach((newSymbol: any) => {
              if (newSymbol.symbol !== -1 && 
                  newSymbol.position && 
                  newSymbol.position.row >= 0 && 
                  newSymbol.position.row < 7 && 
                  newSymbol.position.col >= 0 && 
                  newSymbol.position.col < 7) {
                const key = `${newSymbol.position.row}-${newSymbol.position.col}`;
                // Новые символы падают сверху (row = -1 означает сверху)
                newFalling.set(key, { from: -1, to: newSymbol.position.row });
              }
            });
            setFallingSymbols(newFalling);
            
            // Обновляем доску с новыми символами из бекенда (для отображения)
            setDisplayBoard(finalBoardAfterCascade);
            
            // Шаг 7: После анимации очищаем fallingSymbols и обновляем доску в store для следующего каскада
            const finalTimer = setTimeout(() => {
              setFallingSymbols(new Map());
              setExplodingCells(new Set());
              
              console.log(`Cascade ${currentCascadeIndex}: Final board after cascade:`, finalBoardAfterCascade);
              
              // Обновляем доску в store для следующего каскада (используем только данные бекенда)
              updateBoardAfterCascade(finalBoardAfterCascade);
              
              // ВАЖНО: Продвигаем каскад после обновления доски
              // Используем requestAnimationFrame + setTimeout для гарантированной синхронизации
              requestAnimationFrame(() => {
                setTimeout(() => {
                  const state = useCascadeGameStore.getState();
                  console.log(`Board in store after update:`, state.board);
                  
                  if (state.currentCascadeIndex < state.cascades.length - 1) {
                    console.log(`Moving to cascade ${state.currentCascadeIndex + 1}`);
                    state.nextCascadeStep();
                  } else {
                    console.log('All cascades complete, finishing animation');
                    state.finishCascadeAnimation();
                  }
                }, 100);
              });
            }, getCascadeDuration(800));

            return () => clearTimeout(finalTimer);
          }, getCascadeDuration(100)); // Небольшая задержка перед появлением новых символов

          return () => clearTimeout(newSymbolsTimer);
        }, getCascadeDuration(800)); // Время на анимацию падения

          return () => clearTimeout(gravityTimer);
        }, getCascadeDuration(1500)); // Время подсветки

        return () => clearTimeout(highlightTimer);
      }, initialDelay);

      return () => clearTimeout(initialTimer);
    }
  // ВАЖНО: Не добавляем board в зависимости, чтобы избежать перезапуска при обновлении доски
  // Вместо этого используем getState() внутри для получения актуальной доски
  }, [currentCascadeIndex, cascades, isResolving, isTurbo, updateBoardAfterCascade]);

  const getSymbolEmoji = (symbol: number): string => {
    switch (symbol) {
      case CascadeSymbolType.EMPTY:
        return '';
      case CascadeSymbolType.SYMBOL_0:
        return '🍒';
      case CascadeSymbolType.SYMBOL_1:
        return '🍋';
      case CascadeSymbolType.SYMBOL_2:
        return '🍊';
      case CascadeSymbolType.SYMBOL_3:
        return '🍇';
      case CascadeSymbolType.SYMBOL_4:
        return '🍉';
      case CascadeSymbolType.SYMBOL_5:
        return '💎';
      case CascadeSymbolType.SYMBOL_6:
        return '⭐';
      case CascadeSymbolType.SCATTER:
        return '🎁';
      default:
        return '❓';
    }
  };

  return (
    <div className="cascade-board">
      <div className="cascade-grid-container">
        <div className="cascade-grid">
          {displayBoard.map((row, rowIndex) =>
            row.map((symbol, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;
              const isHighlighted = explodingCells.has(cellKey);
              const cascadeFalling = fallingSymbols.get(cellKey);
              const spinFalling = spinFallingSymbols.get(cellKey);
              const falling = spinFalling ?? cascadeFalling;
              const isSpinExiting = spinExitingCells.has(cellKey);
              const spinExitDelayMs = spinExitingCells.get(cellKey);
              const fallingDelayMs = spinFalling?.delayMs;
              const isSpinFalling = spinFalling !== undefined;
              const multiplier = cellMultipliers.get(cellKey); // Получаем множитель для ячейки
              
              return (
                <CascadeCell
                  key={cellKey}
                  symbol={symbol}
                  emoji={getSymbolEmoji(symbol)}
                  row={rowIndex}
                  col={colIndex}
                  isHighlighted={isHighlighted}
                  isFalling={falling !== undefined}
                  fallingFrom={falling?.from}
                  fallingTo={falling?.to}
                  fallingDelayMs={fallingDelayMs}
                  isSpinExiting={isSpinExiting}
                  spinExitDelayMs={spinExitDelayMs}
                  isSpinFalling={isSpinFalling}
                  isSpinning={false}
                  isTurbo={isTurbo}
                  multiplier={multiplier} // Передаем множитель для отображения
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};


