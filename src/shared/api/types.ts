// API Request types
export interface DepositRequest {
  amount: number;
}

export interface SpinRequest {
  bet: number;
}

export interface BuyBonusRequest {
  amount: number;
}

// API Response types - соответствуют структуре бекенда
export interface SpinResult {
  board: string[][]; // 5x3 массив символов
  line_wins: LineWinAPI[]; // Выигрышные линии
  scatter_count: number; // Количество скаттеров
  scatter_payout: number; // Выплата по скаттерам
  awarded_free_spins: number; // Начислено фриспинов
  total_payout: number; // Общая выплата
  balance: number; // Баланс после спина
  free_spin_count: number; // Остаток фриспинов
  in_free_spin: boolean; // Это фриспин?
}

export interface LineWinAPI {
  line: number; // Номер линии 1-20
  symbol: string; // ID символа
  count: number; // Количество символов 3-5
  payout: number; // Выплата
}

export interface DataResponse {
  balance: number; // Баланс пользователя
  free_spin_count: number; // Остаток фриспинов
}

// Простой ответ для deposit и buy_bonus
export interface SimpleResponse {
  result: string;
}

// Error response
export interface ErrorResponse {
  error: string;
}

