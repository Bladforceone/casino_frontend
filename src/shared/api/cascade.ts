import { apiClient } from './client';
import { AxiosError } from 'axios';

// Cascade API Types
export interface CascadeSpinRequest {
  bet: number; // Размер ставки (положительное чётное число)
}

export interface CascadeSpinResponse {
  initial_board: number[][]; // Начальная доска до всех каскадов: -1 = пусто, 0-6 = обычные, 7 = скаттер
  board: number[][]; // 7x7 доска: -1 = пусто, 0-6 = обычные, 7 = скаттер
  cascades: CascadeStep[]; // Все шаги каскада (для анимации)
  total_payout: number; // Общая выплата за спин
  balance: number; // Баланс после спина
  scatter_count: number; // Количество скаттеров на финальной доске
  awarded_free_spins: number; // Начислено фриспинов в этом спине
  free_spins_left: number; // Остаток фриспинов после спина
  in_free_spin: boolean; // Это был фриспин?
}

export interface CascadeStep {
  cascade_index: number; // 0 = первый, 1 = второй и т.д.
  clusters: ClusterInfo[]; // Какие кластеры взорвались на этом шаге
  new_symbols: NewSymbol[]; // Новые символы, упавшие сверху
}

export interface ClusterInfo {
  symbol: number; // ID символа (0–6)
  cells: Position[]; // Координаты ячеек в кластере
  count: number; // Размер кластера (≥5)
  payout: number; // Выплата за кластер (в деньгах)
  multiplier: number; // Средний множитель (x2, x4, ..., x128)
}

export interface Position {
  row: number;
  col: number;
}

export interface NewSymbol {
  position: Position;
  symbol: number; // -1 = пусто, 0–6 = обычный, 7 = скаттер
}

export interface BuyCascadeBonusRequest {
  amount: number; // Сумма покупки (обычно = bet × 100)
}

export interface CascadeDataResponse {
  balance: number;
  free_spins_left: number;
}

export interface ErrorResponse {
  error: string;
}

export class CascadeAPI {
  /**
   * Выполнить спин (каскадная игра)
   */
  static async spin(bet: number): Promise<CascadeSpinResponse> {
    try {
      const data: CascadeSpinRequest = { bet };
      const response = await apiClient.getClient().post<CascadeSpinResponse>('/cascade/spin', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Купить бонус (фриспины)
   */
  static async buyBonus(amount: number): Promise<void> {
    try {
      const data: BuyCascadeBonusRequest = { amount };
      await apiClient.getClient().post('/cascade/buy-bonus', data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Депозит
   */
  static async deposit(amount: number): Promise<void> {
    try {
      const data: BuyCascadeBonusRequest = { amount };
      await apiClient.getClient().post('/cascade/deposit', data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Получить данные пользователя (баланс, фриспины)
   */
  static async checkData(): Promise<CascadeDataResponse> {
    try {
      const response = await apiClient.getClient().get<CascadeDataResponse>('/cascade/check-data');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
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

