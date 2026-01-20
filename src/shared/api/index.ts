// Экспорт всех API модулей
export { UserAPI } from './user';
export { GameAPI } from './game';
export { CascadeAPI } from './cascade';
export { apiClient } from './client';

// Экспорт типов
export type {
  DepositRequest,
  SpinRequest,
  BuyBonusRequest,
  SpinResult,
  LineWinAPI,
  DataResponse,
  SimpleResponse,
  ErrorResponse,
} from './types';

// Экспорт cascade типов
export type {
  CascadeSpinRequest,
  CascadeSpinResponse,
  CascadeStep,
  ClusterInfo,
  Position,
  NewSymbol,
  BuyCascadeBonusRequest,
  CascadeDataResponse,
} from './cascade';

