import React from 'react';
import { CascadeSymbolType } from '@shared/types/cascade';
import './CascadeCell.css';

interface CascadeCellProps {
  symbol: number;
  emoji: string;
  row: number;
  col: number;
  isHighlighted?: boolean;
  isFalling?: boolean;
  fallingFrom?: number;
  fallingTo?: number;
  fallingDelayMs?: number;
  isSpinExiting?: boolean;
  spinExitDelayMs?: number;
  isSpinFalling?: boolean;
  isSpinning?: boolean;
  finalSymbol?: number;
  isTurbo?: boolean;
  multiplier?: number; // Множитель ячейки из бекенда (x2, x4, x8, и т.д.)
}

export const CascadeCell: React.FC<CascadeCellProps> = ({
  symbol,
  emoji,
  row,
  col,
  isHighlighted,
  isFalling,
  fallingFrom,
  fallingTo,
  fallingDelayMs,
  isSpinExiting,
  spinExitDelayMs,
  isSpinFalling,
  isSpinning,
  finalSymbol,
  isTurbo = false,
  multiplier,
}) => {
  const isEmpty = symbol === -1;
  
  // Функция для получения эмодзи символа
  function getSymbolEmoji(sym: number): string {
    switch (sym) {
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
  }
  
  const finalEmoji = finalSymbol !== undefined ? getSymbolEmoji(finalSymbol) : emoji;
  
  // Создаем реель с символами для вращения
  // Используем только финальный символ с бекенда, повторяя его для эффекта вращения
  // Фронтенд не должен генерировать символы самостоятельно
  const reelItems = [];
  // Повторяем финальный символ несколько раз для плавной анимации вращения
  for (let i = 0; i < 12; i++) {
    reelItems.push(finalEmoji);
  }

  // Вычисляем расстояние падения для CSS переменной
  // В grid каждая ячейка имеет высоту 100% (относительно grid), поэтому
  // падение на N ячеек = N * 100% + gap между ячейками
  const fallDistance = fallingFrom !== undefined && fallingTo !== undefined && fallingFrom !== -1
    ? `${(fallingTo - fallingFrom) * (100 + 4)}%` // 100% на ячейку + ~4% на gap
    : undefined;

  const animationDelay =
    (isSpinExiting && spinExitDelayMs !== undefined)
      ? `${spinExitDelayMs}ms`
      : (fallingDelayMs !== undefined ? `${fallingDelayMs}ms` : undefined);

  return (
    <div
      className={`cascade-cell ${isEmpty ? 'empty' : ''} ${isHighlighted ? 'highlighted' : ''} ${isFalling ? 'falling' : ''} ${isSpinFalling ? 'spin-falling' : ''} ${isSpinExiting ? 'spin-exiting' : ''} ${isSpinning ? 'spinning' : ''} ${isTurbo && (isSpinning || isSpinFalling || isSpinExiting) ? 'turbo' : ''}`}
      style={{
        gridRow: row + 1,
        gridColumn: col + 1,
        ...(fallDistance && { '--fall-distance': fallDistance } as React.CSSProperties),
        ...(animationDelay && { animationDelay } as React.CSSProperties),
      }}
      data-falling-from={fallingFrom !== undefined ? fallingFrom.toString() : undefined}
      data-falling-to={fallingTo !== undefined ? fallingTo.toString() : undefined}
    >
      {!isEmpty && (
        <div className={`cascade-symbol ${isSpinning ? 'symbol-reel' : ''}`}>
          {isSpinning ? (
            <div className="symbol-reel-container">
              {reelItems.map((item, index) => (
                <div key={index} className="symbol-reel-item">{item}</div>
              ))}
            </div>
          ) : (
            emoji
          )}
        </div>
      )}
      {/* Множители отображаются независимо от того, пуста ли ячейка, если они были установлены */}
      {multiplier !== undefined && multiplier > 1 && (
        <div 
          key={`multiplier-${row}-${col}-${multiplier}`}
          className="cascade-multiplier"
          style={{
            animationDelay: `${(row * 7 + col) * 0.05}s` // Последовательное появление множителей
          }}
        >
          x{multiplier}
        </div>
      )}
    </div>
  );
};

