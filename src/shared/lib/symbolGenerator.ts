import { Symbol, SymbolType } from '../types/game';
import { SYMBOL_WEIGHTS, WILD_SYMBOL_WEIGHTS, GAME_CONFIG } from '../config/payouts';

let symbolIdCounter = 0;

export function generateSymbol(reelIndex: number, isBonusGame: boolean = false): Symbol {
  const weights = GAME_CONFIG.WILD_REELS.includes(reelIndex) 
    ? WILD_SYMBOL_WEIGHTS 
    : SYMBOL_WEIGHTS;

  let symbolType: SymbolType;

  if (isBonusGame && GAME_CONFIG.WILD_REELS.includes(reelIndex)) {
    // В бонусной игре гарантированно выпадает Wild на центральных барабанах
    // Но не на каждой позиции, только где-то случайно
    const shouldForceWild = Math.random() < 0.3; // 30% шанс для каждой позиции
    if (shouldForceWild) {
      symbolType = SymbolType.WILD;
    } else {
      symbolType = getRandomSymbol(weights);
    }
  } else {
    symbolType = getRandomSymbol(weights);
  }

  return {
    type: symbolType,
    id: `symbol-${symbolIdCounter++}`,
  };
}

function getRandomSymbol(weights: Record<string, number>): SymbolType {
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [symbolType, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return symbolType as SymbolType;
    }
  }

  return SymbolType.SYMBOL_1;
}

export function generateReel(reelIndex: number, isBonusGame: boolean = false): Symbol[] {
  const symbols: Symbol[] = [];
  for (let i = 0; i < GAME_CONFIG.ROWS; i++) {
    symbols.push(generateSymbol(reelIndex, isBonusGame));
  }
  return symbols;
}

export function generateAllReels(isBonusGame: boolean = false, guaranteedWild: boolean = false): Symbol[][] {
  const reels: Symbol[][] = [];
  
  for (let i = 0; i < GAME_CONFIG.REELS; i++) {
    reels.push(generateReel(i, isBonusGame));
  }

  // В бонусной игре гарантируем хотя бы один Wild
  if (isBonusGame && guaranteedWild) {
    const hasWild = reels.some(reel => 
      reel.some(symbol => symbol.type === SymbolType.WILD)
    );

    if (!hasWild) {
      // Добавляем Wild на случайный центральный барабан
      const wildReelIndex = GAME_CONFIG.WILD_REELS[
        Math.floor(Math.random() * GAME_CONFIG.WILD_REELS.length)
      ];
      const wildRowIndex = Math.floor(Math.random() * GAME_CONFIG.ROWS);
      reels[wildReelIndex][wildRowIndex] = {
        type: SymbolType.WILD,
        id: `symbol-${symbolIdCounter++}`,
      };
    }
  }

  return reels;
}

export function generateBonusBuyReels(): Symbol[][] {
  const reels = generateAllReels(false, false);
  
  // Гарантируем 3-5 бонусных символов
  const bonusCount = 3 + Math.floor(Math.random() * 3); // 3, 4 или 5
  const positions: [number, number][] = [];
  
  while (positions.length < bonusCount) {
    const reelIndex = Math.floor(Math.random() * GAME_CONFIG.REELS);
    const rowIndex = Math.floor(Math.random() * GAME_CONFIG.ROWS);
    
    // Проверяем, что позиция еще не занята
    if (!positions.some(([r, row]) => r === reelIndex && row === rowIndex)) {
      positions.push([reelIndex, rowIndex]);
      reels[reelIndex][rowIndex] = {
        type: SymbolType.BONUS,
        id: `symbol-${symbolIdCounter++}`,
      };
    }
  }
  
  return reels;
}

