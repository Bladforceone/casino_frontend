import { Symbol, SymbolType, WinningLine } from '../types/game';
import { PAYLINES } from '../config/lines';
import { PAYOUTS, GAME_CONFIG } from '../config/payouts';

export function calculateWins(reels: Symbol[][], bet: number): {
  winningLines: WinningLine[];
  totalWin: number;
  bonusSymbolsCount: number;
} {
  const winningLines: WinningLine[] = [];
  let totalWin = 0;

  // Проверяем каждую линию
  for (const line of PAYLINES) {
    const lineSymbols = line.pattern.map((row, reelIndex) => reels[reelIndex][row]);
    const win = checkLine(lineSymbols, line.id, bet, line.pattern);
    
    if (win) {
      winningLines.push(win);
      totalWin += win.winAmount;
    }
  }

  // Проверяем бонусные символы (в любом месте)
  const bonusSymbolsCount = countSymbolsOnReels(reels, SymbolType.BONUS);
  if (bonusSymbolsCount >= 2) {
    const bonusKey = `x${bonusSymbolsCount}` as 'x2' | 'x3' | 'x4' | 'x5';
    const multiplier = PAYOUTS[SymbolType.BONUS][bonusKey] || 0;
    
    if (multiplier > 0) {
      const bonusWin = bet * multiplier;
      totalWin += bonusWin;
      
      // Находим позиции бонусных символов
      const bonusPositions: number[][] = [];
      reels.forEach((reel, reelIndex) => {
        reel.forEach((symbol, rowIndex) => {
          if (symbol.type === SymbolType.BONUS) {
            bonusPositions.push([reelIndex, rowIndex]);
          }
        });
      });

      winningLines.push({
        lineIndex: -1, // Специальный индекс для бонусов
        symbols: SymbolType.BONUS,
        count: bonusSymbolsCount,
        multiplier,
        winAmount: bonusWin,
        positions: bonusPositions,
      });
    }
  }

  return { winningLines, totalWin, bonusSymbolsCount };
}

function checkLine(
  lineSymbols: Symbol[],
  lineIndex: number,
  bet: number,
  pattern: number[]
): WinningLine | null {
  // Расширяем Wild символы вертикально
  const expandedSymbols = expandWilds(lineSymbols);
  
  let count = 1;
  let symbolType = expandedSymbols[0].type;
  
  // Пропускаем Wild и Bonus для подсчета комбинаций на линиях
  if (symbolType === SymbolType.WILD || symbolType === SymbolType.BONUS) {
    return null;
  }

  // Считаем одинаковые символы слева направо
  for (let i = 1; i < expandedSymbols.length; i++) {
    const currentSymbol = expandedSymbols[i].type;
    
    // Wild заменяет любой символ кроме Bonus
    if (currentSymbol === symbolType || currentSymbol === SymbolType.WILD) {
      count++;
    } else {
      break;
    }
  }

  // Минимум 3 символа для выигрыша
  if (count >= 3) {
    const payoutKey = `x${count}` as 'x3' | 'x4' | 'x5';
    const multiplier = PAYOUTS[symbolType]?.[payoutKey];
    
    if (multiplier) {
      const winAmount = bet * multiplier;
      const positions = pattern.slice(0, count).map((row, reelIndex) => [reelIndex, row]);
      
      return {
        lineIndex,
        symbols: symbolType,
        count,
        multiplier,
        winAmount,
        positions,
      };
    }
  }

  return null;
}

function expandWilds(symbols: Symbol[]): Symbol[] {
  // Wild расширяется вертикально на барабанах 2, 3, 4 (индексы 1, 2, 3)
  return symbols.map((symbol, index) => {
    if (symbol.type === SymbolType.WILD && GAME_CONFIG.WILD_REELS.includes(index)) {
      return symbol;
    }
    return symbol;
  });
}

function countSymbolsOnReels(reels: Symbol[][], symbolType: SymbolType): number {
  let count = 0;
  reels.forEach(reel => {
    reel.forEach(symbol => {
      if (symbol.type === symbolType) {
        count++;
      }
    });
  });
  return count;
}

export function shouldTriggerBonusGame(bonusSymbolsCount: number): boolean {
  return bonusSymbolsCount >= 3;
}

export function getFreeSpinsCount(bonusSymbolsCount: number): number {
  if (bonusSymbolsCount >= 5) return 20;
  if (bonusSymbolsCount >= 4) return 15;
  if (bonusSymbolsCount >= 3) return 10;
  return 0;
}

