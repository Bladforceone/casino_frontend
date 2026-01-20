// Cascade Game Types

export enum CascadeSymbolType {
  EMPTY = -1,
  SYMBOL_0 = 0,
  SYMBOL_1 = 1,
  SYMBOL_2 = 2,
  SYMBOL_3 = 3,
  SYMBOL_4 = 4,
  SYMBOL_5 = 5,
  SYMBOL_6 = 6,
  SCATTER = 7,
}

export interface CascadeCell {
  symbol: number; // -1 = пусто, 0-6 = обычные, 7 = скаттер
  row: number;
  col: number;
  id: string;
  isExploding?: boolean;
  isFalling?: boolean;
}

export interface CascadeGameState {
  board: number[][]; // 7x7 доска
  balance: number;
  bet: number;
  isSpinning: boolean;
  isResolving: boolean; // Идет разрешение каскадов
  isBonusGame: boolean;
  freeSpinsLeft: number;
  lastWin: number;
  totalWin: number;
  currentCascadeIndex: number; // Текущий шаг каскада для анимации
  cascades: any[]; // Все шаги каскада
  scatterCount: number;
  awardedFreeSpins: number;
  inFreeSpin: boolean;
}

export interface CascadeCluster {
  symbol: number;
  cells: { row: number; col: number }[];
  count: number;
  payout: number;
  multiplier: number;
}

