import { apiClient } from './client';
import { DepositRequest, DataResponse, ErrorResponse, SimpleResponse } from './types';
import { AxiosError } from 'axios';

export class UserAPI {
  /**
   * Получить данные пользователя (баланс и фриспины)
   */
  static async getUserData(): Promise<{ balance: number; freeSpinCount: number }> {
    try {
      // Исправлен маршрут: /check-data вместо /user/balance
      const response = await apiClient.getClient().get<DataResponse>('/check-data');
      return {
        balance: response.data.balance,
        freeSpinCount: response.data.free_spin_count,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Получить текущий баланс пользователя
   */
  static async getBalance(): Promise<number> {
    try {
      const data = await this.getUserData();
      return data.balance;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Пополнить баланс
   */
  static async deposit(amount: number): Promise<void> {
    try {
      const data: DepositRequest = { amount };
      // Исправлен маршрут: /deposit вместо /user/deposit
      await apiClient.getClient().post<SimpleResponse>('/deposit', data);
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

