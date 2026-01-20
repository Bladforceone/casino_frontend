import { create } from 'zustand';

// Упрощенный тип User (так как бекенд не поддерживает авторизацию)
export interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  checkAuth: () => void;
}

// Функция для получения пользователя из localStorage
const getUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem('casino_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// Функция для сохранения пользователя в localStorage
const saveUserToStorage = (user: User | null) => {
  if (user) {
    localStorage.setItem('casino_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('casino_user');
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getUserFromStorage(),
  isAuthenticated: !!getUserFromStorage(),
  isLoading: false,

  // Упрощенная авторизация без бекенда
  login: async (email: string, _password: string) => {
    set({ isLoading: true });
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user: User = {
        id: Date.now().toString(),
        email,
      };
      
      saveUserToStorage(user);
      
      set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Упрощенная регистрация без бекенда
  register: async (email: string, _password: string) => {
    set({ isLoading: true });
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user: User = {
        id: Date.now().toString(),
        email,
      };
      
      saveUserToStorage(user);
      
      set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    saveUserToStorage(null);
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User | null) => {
    saveUserToStorage(user);
    set({ user, isAuthenticated: user !== null });
  },

  checkAuth: () => {
    const user = getUserFromStorage();
    set({ 
      user,
      isAuthenticated: !!user 
    });
  },
}));

