import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@features/auth';
import { useGameStore } from '@entities/game';
import { AuthModal } from '@features/auth';
import './UserPanel.css';

export const UserPanel: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [showDepositForm, setShowDepositForm] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { useOnlineMode, setOnlineMode, syncBalance, deposit } = useGameStore();

  useEffect(() => {
    if (isAuthenticated) {
      setOnlineMode(true);
      syncBalance();
    }
  }, [isAuthenticated, setOnlineMode, syncBalance]);

  const handleLogout = () => {
    logout();
    setOnlineMode(false);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    try {
      await deposit(amount);
      setShowDepositForm(false);
      setDepositAmount('100');
    } catch (error) {
      console.error('Deposit error:', error);
    }
  };

  return (
    <>
      <div className="user-panel">
        <div className="mode-indicator">
          <span className={`mode-badge ${useOnlineMode ? 'online' : 'offline'}`}>
            {useOnlineMode ? '🌐 Онлайн' : '📴 Оффлайн'}
          </span>
        </div>

        {isAuthenticated && user ? (
          <div className="user-info">
            <div className="user-email">{user.email}</div>
            <div className="user-actions">
              {useOnlineMode && (
                <button
                  className="btn-deposit"
                  onClick={() => setShowDepositForm(!showDepositForm)}
                >
                  💰 Пополнить
                </button>
              )}
              <button className="btn-logout" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </div>
        ) : (
          <button className="btn-login" onClick={() => setShowAuthModal(true)}>
            🔐 Войти
          </button>
        )}
      </div>

      {showDepositForm && (
        <div className="deposit-form">
          <h3>Пополнение баланса</h3>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Сумма"
            min="1"
            step="1"
          />
          <div className="deposit-actions">
            <button className="btn-confirm" onClick={handleDeposit}>
              Пополнить
            </button>
            <button className="btn-cancel" onClick={() => setShowDepositForm(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

