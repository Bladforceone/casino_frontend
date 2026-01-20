import { create } from 'zustand';
import { CascadeGameState } from '@shared/types/cascade';
import { CascadeAPI } from '@shared/api/cascade';

interface CascadeGameStore extends CascadeGameState {
  // Actions
  spin: () => Promise<void>;
  setBet: (bet: number) => void;
  buyBonus: () => Promise<void>;
  reset: () => void;
  deposit: (amount: number) => Promise<void>;
  syncBalance: () => Promise<void>;
  useOnlineMode: boolean;
  setOnlineMode: (online: boolean) => void;
  isTurbo: boolean;
  setTurbo: (turbo: boolean) => void;
  // Cascade-specific
  initialBoard: number[][]; // Начальная доска до каскадов
  finalBoard: number[][]; // Финальная доска после всех каскадов (используется только для валидации)
  lastShownFreeSpins: number; // Последнее количество фриспинов, о котором уже показали уведомление
  startCascadeAnimation: (cascades: any[], initialBoard: number[][], finalBoard: number[][]) => void;
  nextCascadeStep: () => void;
  finishCascadeAnimation: () => void;
  updateBoardAfterCascade: (newBoard: number[][]) => void;
  validateFinalBoard: () => boolean; // Проверка соответствия доски финальной доске
}

const BOARD_SIZE = 7;
const DEFAULT_BALANCE = 10000;
const DEFAULT_BET = 20;
const MIN_BET = 2;
const MAX_BET = 1000;

const generateEmptyBoard = (): number[][] => {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(-1));
};

// Фронтенд не должен генерировать символы самостоятельно
// Используем пустую доску для начального состояния
// Все символы должны приходить с бекенда
const initialState: CascadeGameState = {
  board: generateEmptyBoard(), // Пустая доска - символы придут с бекенда
  balance: DEFAULT_BALANCE,
  bet: DEFAULT_BET,
  isSpinning: false,
  isResolving: false,
  isBonusGame: false,
  freeSpinsLeft: 0,
  lastWin: 0,
  totalWin: 0,
  currentCascadeIndex: -1,
  cascades: [],
  scatterCount: 0,
  awardedFreeSpins: 0,
  inFreeSpin: false,
};

const initialStoreState = {
  ...initialState,
  initialBoard: generateEmptyBoard(),
  finalBoard: generateEmptyBoard(), // Финальная доска для валидации
  lastShownFreeSpins: 0,
};

export const useCascadeGameStore = create<CascadeGameStore>((set, get) => ({
  ...initialStoreState,
  useOnlineMode: false,
  isTurbo: false,

  setTurbo: (turbo: boolean) => {
    set({ isTurbo: turbo });
  },

  setOnlineMode: (online: boolean) => {
    set({ useOnlineMode: online });
  },

  syncBalance: async () => {
    const state = get();
    if (!state.useOnlineMode) return;

    try {
      const data = await CascadeAPI.checkData();
      set({
        balance: data.balance,
        freeSpinsLeft: data.free_spins_left,
        isBonusGame: data.free_spins_left > 0,
      });
    } catch (error) {
      console.error('Failed to sync balance:', error);
    }
  },

  deposit: async (amount: number) => {
    const state = get();

    if (state.useOnlineMode) {
      try {
        await CascadeAPI.deposit(amount);
        const data = await CascadeAPI.checkData();
        set({
          balance: data.balance,
          freeSpinsLeft: data.free_spins_left,
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Ошибка при пополнении баланса');
        throw error;
      }
    } else {
      set({ balance: state.balance + amount });
    }
  },

  spin: async () => {
    const state = get();

    if (state.isSpinning || state.isResolving) return;

    // Проверяем баланс
    if (!state.isBonusGame && state.balance < state.bet) {
      alert('Недостаточно средств!');
      return;
    }

    set({
      isSpinning: true,
      isResolving: false,
      lastWin: 0,
      currentCascadeIndex: -1,
      cascades: [],
      scatterCount: 0,
      awardedFreeSpins: 0,
      lastShownFreeSpins: 0, // Сбрасываем при новом спине
    });

    const spinDuration = state.isTurbo ? 100 : 1000;

    if (state.useOnlineMode) {
      try {
        const result = await CascadeAPI.spin(state.bet);

        // Имитируем вращение
        setTimeout(() => {
          const currentState = get();
          
          // Используем начальную доску из ответа бекенда (если есть)
          // Иначе реконструируем из финальной доски и каскадов
          let initialBoard: number[][];
          
          if (result.initial_board && result.initial_board.length > 0) {
            // Используем начальную доску из ответа бекенда
            initialBoard = result.initial_board.map(row => [...row]);
            console.log('Using initial_board from backend:', initialBoard);
          } else {
            // Fallback: реконструируем начальную доску из финальной и каскадов
            console.warn('initial_board not provided, reconstructing from final board and cascades');
            initialBoard = result.board.map(row => [...row]);
            
            // Если есть каскады, реконструируем начальную доску
            if (result.cascades && result.cascades.length > 0) {
              // Идем в обратном порядке по каскадам и восстанавливаем доску
              for (let i = result.cascades.length - 1; i >= 0; i--) {
                const cascade = result.cascades[i];
                
                // Сначала удаляем новые символы, которые были добавлены в этом каскаде
                cascade.new_symbols.forEach((newSymbol: any) => {
                  if (newSymbol.symbol !== -1) {
                    initialBoard[newSymbol.position.row][newSymbol.position.col] = -1;
                  }
                });
                
                // Затем применяем обратную гравитацию - символы поднимаются вверх
                const BOARD_SIZE = 7;
                for (let col = 0; col < BOARD_SIZE; col++) {
                  const column: number[] = [];
                  // Собираем все непустые символы в столбце (снизу вверх)
                  for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                    if (initialBoard[row][col] !== -1) {
                      column.push(initialBoard[row][col]);
                    }
                  }
                  // Заполняем столбец снизу вверх
                  for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                    const index = BOARD_SIZE - 1 - row;
                    initialBoard[row][col] = index < column.length ? column[index] : -1;
                  }
                }
                
                // Восстанавливаем взорванные кластеры
                cascade.clusters.forEach((cluster: any) => {
                  cluster.cells.forEach((cell: any) => {
                    initialBoard[cell.row][cell.col] = cluster.symbol;
                  });
                });
              }
            }
          }
          
          console.log('Setting initial board from backend:', initialBoard);
          console.log('Initial board at [1,6]:', initialBoard[1]?.[6]);
          console.log('Final board at [1,6]:', result.board[1]?.[6]);
          
          set({
            balance: result.balance,
            lastWin: result.total_payout,
            totalWin: currentState.totalWin + result.total_payout,
            scatterCount: result.scatter_count,
            awardedFreeSpins: result.awarded_free_spins,
            freeSpinsLeft: result.free_spins_left,
            isBonusGame: result.free_spins_left > 0,
            inFreeSpin: result.in_free_spin,
            board: initialBoard, // Устанавливаем начальную доску
            finalBoard: result.board.map(row => [...row]), // Сохраняем финальную доску для валидации
          });
          
          // Останавливаем спин после завершения анимации падения
          // В турбо режиме анимация спина быстрее (200ms базовое + 7*20ms задержки + 30ms = ~370ms)
          // В обычном режиме: 2000ms + 7*200ms + 300ms = ~3700ms
          const spinAnimationDuration = currentState.isTurbo ? 370 : 3700;
          setTimeout(() => {
            set({ isSpinning: false });
          }, spinAnimationDuration);

          // Если есть каскады, запускаем анимацию
          if (result.cascades && result.cascades.length > 0) {
            // Задержка перед началом каскада (после завершения анимации спина)
            // Добавляем дополнительную задержку, чтобы доска успела отобразиться
            const cascadeStartDelay = spinAnimationDuration + (currentState.isTurbo ? 500 : 1000);
            setTimeout(() => {
              console.log('Starting cascade animation with initialBoard:', initialBoard);
              console.log('FinalBoard for validation:', result.board);
              // Финальная доска будет сформирована на фронтенде путем применения каскадов
              // Финальная доска используется только для валидации после завершения всех каскадов
              get().startCascadeAnimation(result.cascades, initialBoard, result.board.map(row => [...row]));
            }, cascadeStartDelay);
          } else {
            // Если нет каскадов, доска уже финальная (начальная = финальная)
            const currentState = get();
            set({ 
              board: result.board.map(row => [...row]), // Устанавливаем финальную доску
              lastShownFreeSpins: result.awarded_free_spins > 0 ? result.awarded_free_spins : currentState.lastShownFreeSpins,
            });
            // Уведомления о фриспинах убраны по запросу пользователя
          }
        }, spinDuration);
      } catch (error) {
        set({ isSpinning: false, isResolving: false });
        alert(error instanceof Error ? error.message : 'Ошибка при спине');
      }
    } else {
      // Оффлайн режим - генерируем случайную доску
      if (!state.isBonusGame) {
        set({ balance: state.balance - state.bet });
      }

      // Генерируем случайную доску для демо
      const newBoard = generateRandomBoard();
      
      setTimeout(() => {
        set({
          board: newBoard,
          isSpinning: false,
          lastWin: 0,
        });
      }, spinDuration);
    }
  },

  setBet: (bet: number) => {
    const state = get();
    if (state.isSpinning || state.isResolving) return;

    const clampedBet = Math.max(MIN_BET, Math.min(MAX_BET, bet));
    // Убеждаемся, что ставка четная
    const evenBet = Math.floor(clampedBet / 2) * 2;
    
    set({ bet: evenBet });
  },

  buyBonus: async () => {
    const state = get();

    if (state.isSpinning || state.isResolving || state.isBonusGame) return;

    const bonusCost = state.bet * 100;

    if (state.balance < bonusCost) {
      alert('Недостаточно средств для покупки бонуса!');
      return;
    }

    set({
      isSpinning: true,
      isResolving: false,
      lastWin: 0,
    });

    if (state.useOnlineMode) {
      try {
        await CascadeAPI.buyBonus(bonusCost);
        const data = await CascadeAPI.checkData();
        set({
          balance: data.balance,
          freeSpinsLeft: data.free_spins_left,
          isBonusGame: data.free_spins_left > 0,
          isSpinning: false,
        });
      } catch (error) {
        set({ isSpinning: false });
        alert(error instanceof Error ? error.message : 'Ошибка при покупке бонуса');
      }
    } else {
      // Оффлайн режим
      set({
        balance: state.balance - bonusCost,
        freeSpinsLeft: 10,
        isBonusGame: true,
        isSpinning: false,
      });
    }
  },

  startCascadeAnimation: (cascades: any[], initialBoard: number[][], finalBoard: number[][]) => {
    // Устанавливаем начальную доску (с кластерами для первого каскада)
    // Финальная доска будет сформирована путем последовательного применения каскадов
    // Финальная доска используется только для валидации после завершения всех каскадов
    set({
      cascades,
      currentCascadeIndex: 0,
      isResolving: true,
      initialBoard: initialBoard.map(row => [...row]),
      finalBoard: finalBoard.map(row => [...row]), // Сохраняем финальную доску для валидации
      board: initialBoard.map(row => [...row]), // Устанавливаем начальную доску (с кластерами)
    });
  },

  nextCascadeStep: () => {
    const state = get();
    if (state.currentCascadeIndex < state.cascades.length - 1) {
      set({ currentCascadeIndex: state.currentCascadeIndex + 1 });
    } else {
      get().finishCascadeAnimation();
    }
  },

  updateBoardAfterCascade: (newBoard: number[][]) => {
    set({ board: newBoard.map(row => [...row]) });
  },

  validateFinalBoard: () => {
    const state = get();
    if (!state.finalBoard || !state.board) {
      console.warn('Cannot validate: finalBoard or board is missing');
      return false;
    }
    
    // Проверяем соответствие доски финальной доске
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (state.board[row][col] !== state.finalBoard[row][col]) {
          console.error(`Board mismatch at [${row}][${col}]: expected ${state.finalBoard[row][col]}, got ${state.board[row][col]}`);
          return false;
        }
      }
    }
    
    console.log('Board validation passed: board matches finalBoard');
    return true;
  },

  finishCascadeAnimation: () => {
    const state = get();
    const newAwardedFreeSpins = state.awardedFreeSpins;
    
    // После завершения всех каскадов проверяем соответствие доски финальной доске
    const isValid = get().validateFinalBoard();
    if (!isValid) {
      console.error('Board validation failed! Board does not match finalBoard from backend.');
      // Если доска не соответствует финальной, устанавливаем финальную доску из бекенда
      if (state.finalBoard && state.finalBoard.length > 0) {
        console.warn('Fixing board: setting finalBoard from backend');
        set({ board: state.finalBoard.map(row => [...row]) });
      }
    }
    
    // Убеждаемся, что доска установлена в финальную после всех каскадов
    // Если валидация прошла успешно, board уже содержит финальную доску
    // Если нет - устанавливаем финальную доску из бекенда
    set({
      isResolving: false,
      currentCascadeIndex: -1,
      cascades: [],
      board: state.finalBoard && state.finalBoard.length > 0 
        ? state.finalBoard.map(row => [...row]) // Устанавливаем финальную доску из бекенда
        : state.board, // Fallback на текущую доску, если финальная не установлена
    });

    // Обновляем lastShownFreeSpins (уведомления о фриспинах убраны по запросу пользователя)
    if (newAwardedFreeSpins > 0) {
      set({ lastShownFreeSpins: newAwardedFreeSpins });
    }
  },

  reset: () => {
    set(initialStoreState);
  },
}));

// Вспомогательная функция для генерации случайной доски (оффлайн режим)
function generateRandomBoard(): number[][] {
  const board: number[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Генерируем случайный символ 0-6, с небольшой вероятностью скаттера
      const rand = Math.random();
      if (rand < 0.02) {
        board[row][col] = 7; // Scatter
      } else {
        board[row][col] = Math.floor(Math.random() * 7); // 0-6
      }
    }
  }
  return board;
}

