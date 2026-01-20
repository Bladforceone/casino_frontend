import React from 'react';
import { SymbolType } from '@shared/types/game';
import { PAYOUTS } from '@shared/config/payouts';
import './PaytableModal.css';

interface PaytableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaytableModal: React.FC<PaytableModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const symbols = [
    { type: SymbolType.SYMBOL_8, label: '👑', name: 'Король' },
    { type: SymbolType.SYMBOL_7, label: '⭐', name: 'Звезда' },
    { type: SymbolType.SYMBOL_6, label: '💎', name: 'Алмаз' },
    { type: SymbolType.SYMBOL_5, label: '🍉', name: 'Арбуз' },
    { type: SymbolType.SYMBOL_4, label: '🍇', name: 'Виноград' },
    { type: SymbolType.SYMBOL_3, label: '🍊', name: 'Апельсин' },
    { type: SymbolType.SYMBOL_2, label: '🍋', name: 'Лимон' },
    { type: SymbolType.SYMBOL_1, label: '🍒', name: 'Вишня' },
    { type: SymbolType.BONUS, label: '🎁', name: 'Бонус' },
    { type: SymbolType.WILD, label: 'W', name: 'Wild' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2 className="modal-title">📊 Таблица выплат</h2>
        
        <div className="paytable">
          {symbols.map(({ type, label, name }) => {
            const payout = PAYOUTS[type];
            if (!payout) return null;

            return (
              <div key={type} className="paytable-row">
                <div className="paytable-symbol">
                  <span className="paytable-icon">{label}</span>
                  <span className="paytable-name">{name}</span>
                </div>
                <div className="paytable-values">
                  {payout.x2 && <span>x2: {payout.x2}x</span>}
                  <span>x3: {payout.x3}x</span>
                  <span>x4: {payout.x4}x</span>
                  <span>x5: {payout.x5}x</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rules">
          <h3>📜 Правила:</h3>
          <ul>
            <li>Минимум 3 одинаковых символа для выигрыша</li>
            <li>Комбинации считаются слева направо</li>
            <li>Wild (W) заменяет любой символ кроме бонусного</li>
            <li>Wild выпадает на барабанах 2, 3, 4 и расширяется вертикально</li>
            <li>3+ бонусных символа запускают бесплатные спины</li>
            <li>В бонусной игре гарантирован Wild в каждом спине</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

