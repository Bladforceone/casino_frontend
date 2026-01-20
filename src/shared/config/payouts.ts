import { PayoutConfig, SymbolType } from '../types/game';

// Таблица выплат из скриншота (в процентах от ставки)
export const PAYOUTS: PayoutConfig = {
  [SymbolType.SYMBOL_1]: {
    x3: 0.25,
    x4: 1.5,
    x5: 4.5,
  },
  [SymbolType.SYMBOL_2]: {
    x3: 0.25,
    x4: 1.5,
    x5: 4.5,
  },
  [SymbolType.SYMBOL_3]: {
    x3: 0.25,
    x4: 1.5,
    x5: 4.5,
  },
  [SymbolType.SYMBOL_4]: {
    x3: 0.25,
    x4: 1.5,
    x5: 4.5,
  },
  [SymbolType.SYMBOL_5]: {
    x3: 0.75,
    x4: 2.5,
    x5: 10,
  },
  [SymbolType.SYMBOL_6]: {
    x3: 1.25,
    x4: 5,
    x5: 25,
  },
  [SymbolType.SYMBOL_7]: {
    x3: 1.25,
    x4: 5,
    x5: 25,
  },
  [SymbolType.SYMBOL_8]: {
    x3: 2.5,
    x4: 12.5,
    x5: 125,
  },
  [SymbolType.BONUS]: {
    x2: 0.5,
    x3: 1,
    x4: 5,
    x5: 25,
  },
};

// Конфигурация бонусной игры
export const BONUS_CONFIG = {
  COST_MULTIPLIER: 100, // Стоимость покупки бонуса = ставка * 100
  FREE_SPINS: {
    3: 10,  // 3 бонусных символа = 10 фриспинов
    4: 15,  // 4 бонусных символа = 15 фриспинов
    5: 20,  // 5 бонусных символов = 20 фриспинов
  },
};

// Веса символов для генерации (частота выпадения)
export const SYMBOL_WEIGHTS = {
  [SymbolType.SYMBOL_1]: 15,
  [SymbolType.SYMBOL_2]: 15,
  [SymbolType.SYMBOL_3]: 12,
  [SymbolType.SYMBOL_4]: 12,
  [SymbolType.SYMBOL_5]: 10,
  [SymbolType.SYMBOL_6]: 8,
  [SymbolType.SYMBOL_7]: 8,
  [SymbolType.SYMBOL_8]: 5,
  [SymbolType.BONUS]: 3,
  [SymbolType.WILD]: 0, // Wild не генерируется обычным способом
};

// Веса для барабанов 2, 3, 4 где может быть Wild
export const WILD_SYMBOL_WEIGHTS = {
  ...SYMBOL_WEIGHTS,
  [SymbolType.WILD]: 5, // Добавляем шанс выпадения Wild на центральных барабанах
};

// Конфигурация игры
export const GAME_CONFIG = {
  REELS: 5,
  ROWS: 3,
  LINES: 20,
  DEFAULT_BALANCE: 1000,
  DEFAULT_BET: 10,
  MIN_BET: 1,
  MAX_BET: 100,
  SPIN_DURATION: 2500, // мс - время до полной остановки всех барабанов
  WILD_REELS: [1, 2, 3], // Индексы барабанов где может выпасть Wild (0-based)
};

