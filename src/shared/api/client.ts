import axios, { AxiosInstance, AxiosError } from 'axios';

// URL бекенда - можно настроить через переменные окружения
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Загружаем токен из localStorage при инициализации
    this.token = localStorage.getItem('auth_token');
    if (this.token) {
      this.setAuthToken(this.token);
    }

    // Интерсептор для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Если получили 401, очищаем токен
          this.clearAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  // Установить токен авторизации
  setAuthToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  }

  // Очистить токен авторизации
  clearAuthToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  }

  // Получить текущий токен
  getToken(): string | null {
    return this.token;
  }

  // Проверить, авторизован ли пользователь
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  // Получить axios клиент
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Экспортируем единственный экземпляр
export const apiClient = new ApiClient();

