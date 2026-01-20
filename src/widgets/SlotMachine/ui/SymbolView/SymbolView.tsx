import React from 'react';
import { SymbolType } from '@shared/types/game';
import './SymbolView.css';

interface SymbolViewProps {
  type: SymbolType;
  isWinning?: boolean;
}

const SYMBOL_COLORS: Record<SymbolType, string> = {
  [SymbolType.SYMBOL_1]: '#FF6B6B',
  [SymbolType.SYMBOL_2]: '#4ECDC4',
  [SymbolType.SYMBOL_3]: '#45B7D1',
  [SymbolType.SYMBOL_4]: '#FFA07A',
  [SymbolType.SYMBOL_5]: '#98D8C8',
  [SymbolType.SYMBOL_6]: '#F7B731',
  [SymbolType.SYMBOL_7]: '#5F27CD',
  [SymbolType.SYMBOL_8]: '#FF6348',
  [SymbolType.BONUS]: '#FFD700',
  [SymbolType.WILD]: '#00D2FF',
};

const SYMBOL_LABELS: Record<SymbolType, string> = {
  [SymbolType.SYMBOL_1]: '🍒',
  [SymbolType.SYMBOL_2]: '🍋',
  [SymbolType.SYMBOL_3]: '🍊',
  [SymbolType.SYMBOL_4]: '🍇',
  [SymbolType.SYMBOL_5]: '🍉',
  [SymbolType.SYMBOL_6]: '💎',
  [SymbolType.SYMBOL_7]: '⭐',
  [SymbolType.SYMBOL_8]: '👑',
  [SymbolType.BONUS]: '🎁',
  [SymbolType.WILD]: 'W',
};

export const SymbolView: React.FC<SymbolViewProps> = ({ type, isWinning = false }) => {
  const backgroundColor = SYMBOL_COLORS[type];
  const label = SYMBOL_LABELS[type];

  return (
    <div
      className={`symbol ${isWinning ? 'symbol-winning' : ''}`}
      style={{ backgroundColor }}
    >
      <span className="symbol-label">{label}</span>
    </div>
  );
};

