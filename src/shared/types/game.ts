export enum SymbolType {
  SYMBOL_1 = 'symbol_1', // Самый дешевый
  SYMBOL_2 = 'symbol_2',
  SYMBOL_3 = 'symbol_3',
  SYMBOL_4 = 'symbol_4',
  SYMBOL_5 = 'symbol_5',
  SYMBOL_6 = 'symbol_6',
  SYMBOL_7 = 'symbol_7',
  SYMBOL_8 = 'symbol_8', // Самый дорогой
  BONUS = 'bonus',
  WILD = 'wild',
}

export interface Symbol {
  type: SymbolType;
  id: string;
}

export interface Reel {
  symbols: Symbol[];
  position: number;
}

export interface GameState {
  reels: Reel[];
  balance: number;
  bet: number;
  isSpinning: boolean;
  isBonusGame: boolean;
  freeSpinsLeft: number;
  lastWin: number;
  totalWin: number;
  winningLines: WinningLine[];
}

export interface WinningLine {
  lineIndex: number;
  symbols: SymbolType;
  count: number;
  multiplier: number;
  winAmount: number;
  positions: number[][];
}

export interface PayoutConfig {
  [key: string]: {
    x2?: number;
    x3: number;
    x4: number;
    x5: number;
  };
}

export interface LinePattern {
  id: number;
  pattern: number[]; // Индексы рядов для каждого барабана [0-2]
}

