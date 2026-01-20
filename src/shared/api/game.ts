import { apiClient } from './client';
import { SpinRequest, SpinResult, ErrorResponse, BuyBonusRequest, SimpleResponse } from './types';
import { AxiosError } from 'axios';
import { Symbol, SymbolType, WinningLine } from '@shared/types/game';
import { PAYLINES } from '@shared/config/lines';

export class GameAPI {
  /**
   * Выполнить спин (вращение барабанов)
   */
  static async spin(bet: number): Promise<{
    reels: Symbol[][];
    winAmount: number;
    balance: number;
    winningLines: WinningLine[];
    scatterCount: number;
    scatterPayout: number;
    awardedFreeSpins: number;
    freeSpinCount: number;
    inFreeSpin: boolean;
  }> {
    try {
      const data: SpinRequest = { bet };
      // Исправлен маршрут: /spin вместо /game/line/spin
      const response = await apiClient.getClient().post<SpinResult>('/spin', data);
      
      // Конвертируем результат API в формат приложения
      const reels = this.convertBoardToReels(response.data.board);
      const winAmount = response.data.total_payout;
      const balance = response.data.balance;
      const winningLines = this.convertWinningLinesFromAPI(response.data.line_wins);
      
      // Отладочное логирование
      console.log('🎰 Spin result from API:', {
        board: response.data.board,
        lineWins: response.data.line_wins,
        winningLines: winningLines,
        totalPayout: winAmount,
      });

      // Добавляем scatter выигрыш как специальную линию, если есть
      if (response.data.scatter_count >= 3 && response.data.scatter_payout > 0) {
        // Находим все позиции scatter символов на барабанах
        const scatterPositions: number[][] = [];
        response.data.board.forEach((reel: string[], reelIndex: number) => {
          reel.forEach((symbol: string, rowIndex: number) => {
            if (symbol === 'B') { // 'B' = Bonus/Scatter
              scatterPositions.push([reelIndex, rowIndex]);
            }
          });
        });

        // Добавляем scatter как специальную "линию" с индексом -1
        winningLines.push({
          lineIndex: -1, // Специальный индекс для scatter
          symbols: SymbolType.BONUS,
          count: response.data.scatter_count,
          multiplier: 0,
          winAmount: response.data.scatter_payout,
          positions: scatterPositions,
        });
      }

      return {
        reels,
        winAmount,
        balance,
        winningLines,
        scatterCount: response.data.scatter_count,
        scatterPayout: response.data.scatter_payout,
        awardedFreeSpins: response.data.awarded_free_spins,
        freeSpinCount: response.data.free_spin_count,
        inFreeSpin: response.data.in_free_spin,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Купить бонус (фриспины)
   */
  static async buyBonus(amount: number): Promise<void> {
    try {
      const data: BuyBonusRequest = { amount };
      // Маршрут: /buy-bonus
      await apiClient.getClient().post<SimpleResponse>('/buy-bonus', data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Маппинг символов бекенда в символы фронтенда
   */
  private static mapBackendSymbol(backendSymbol: string): SymbolType {
    const symbolMap: Record<string, SymbolType> = {
      'S1': SymbolType.SYMBOL_1,
      'S2': SymbolType.SYMBOL_2,
      'S3': SymbolType.SYMBOL_3,
      'S4': SymbolType.SYMBOL_4,
      'S5': SymbolType.SYMBOL_5,
      'S6': SymbolType.SYMBOL_6,
      'S7': SymbolType.SYMBOL_7,
      'S8': SymbolType.SYMBOL_8,
      'B': SymbolType.BONUS,
      'W': SymbolType.WILD,
    };
    
    return symbolMap[backendSymbol] || SymbolType.SYMBOL_1; // Fallback
  }

  /**
   * Конвертировать board (5x3) в формат reels (5 барабанов по 3 символа)
   * board[reel][position] -> reels[reel][position]
   */
  private static convertBoardToReels(board: string[][]): Symbol[][] {
    return board.map((reel, reelIndex) =>
      reel.map((symbolStr, posIndex) => {
        const mappedType = this.mapBackendSymbol(symbolStr);
        return {
          type: mappedType,
          id: `${mappedType}-${reelIndex}-${posIndex}-${Date.now()}`,
        };
      })
    );
  }

  /**
   * Конвертировать выигрышные линии из формата API в формат приложения
   */
  private static convertWinningLinesFromAPI(apiLines: any[]): WinningLine[] {
    if (!apiLines || apiLines.length === 0) return [];

    return apiLines.map((line) => {
      // Находим паттерн линии по её индексу
      // API возвращает line.line как число от 1 до 20
      const linePattern = PAYLINES.find(l => l.id === line.line);
      
      // Генерируем позиции на основе паттерна и количества символов
      const positions: number[][] = [];
      if (linePattern && line.count > 0) {
        // Берем только первые N позиций (где N = line.count)
        // Но убеждаемся, что не выходим за пределы паттерна
        const maxCount = Math.min(line.count, linePattern.pattern.length);
        for (let reelIndex = 0; reelIndex < maxCount; reelIndex++) {
          const rowIndex = linePattern.pattern[reelIndex];
          // Проверяем валидность индексов
          if (rowIndex >= 0 && rowIndex <= 2 && reelIndex >= 0 && reelIndex < 5) {
            positions.push([reelIndex, rowIndex]);
          }
        }
      }
      
      // Отладочная информация для третьей линии
      if (line.line === 3) {
        console.log('🎯 Line 3 conversion:', {
          apiLine: line,
          linePattern: linePattern,
          positions: positions,
          count: line.count
        });
      }

      return {
        lineIndex: line.line, // API возвращает 1-20
        symbols: this.mapBackendSymbol(line.symbol),
        count: line.count,
        multiplier: 0, // Бекенд не возвращает multiplier, можно рассчитать как payout/bet
        winAmount: line.payout,
        positions: positions,
      };
    });
  }

  /**
   * Обработка ошибок
   */
  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ErrorResponse;
      return new Error(errorData?.error || error.message || 'Произошла ошибка');
    }
    return new Error('Неизвестная ошибка');
  }
}

