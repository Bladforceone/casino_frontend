// ПРИМЕЧАНИЕ: Авторизация не реализована на бекенде
// Этот файл оставлен для будущей реализации авторизации
// В текущей версии используется упрощенная авторизация через localStorage
// См. features/auth/model/store.ts

/*
import { apiClient } from './client';
import {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  User,
  ErrorResponse,
} from './types';
import { AxiosError } from 'axios';

export class AuthAPI {
  // Регистрация нового пользователя
  static async register(data: RegisterRequest): Promise<User> {
    try {
      const response = await apiClient.getClient().post<User>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Вход в систему
  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.getClient().post<LoginResponse>('/auth/login', data);
      
      // Сохраняем токен после успешного входа
      if (response.data.token) {
        apiClient.setAuthToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Выход из системы
  static logout(): void {
    apiClient.clearAuthToken();
  }

  // Проверить, авторизован ли пользователь
  static isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  // Обработка ошибок
  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ErrorResponse;
      return new Error(errorData?.error || error.message || 'Произошла ошибка');
    }
    return new Error('Неизвестная ошибка');
  }
}
*/

