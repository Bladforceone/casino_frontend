import React, { useRef, useState, useEffect } from 'react';
import { CascadeBoard } from '@widgets/CascadeBoard';
import { BonusActivationAnimation } from '@widgets/BonusActivationAnimation';
import { Button } from '@shared/ui/Button';
import { useCascadeGameStore } from '@entities/cascade/model/store';
import { useAuthStore } from '@features/auth';
import { AuthModal } from '@features/auth';
import './CascadeGamePage.css';
import {CascadeControlPanel} from "@widgets/CascadeControlPanel";

export const CascadeGamePage: React.FC = () => {
  const [isPaytableOpen, setIsPaytableOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [showDepositForm, setShowDepositForm] = useState(false);
  
  const { 
    useOnlineMode, 
    setOnlineMode, 
    syncBalance, 
    isResolving, 
    deposit, 
    isTurbo,
    bet,
    balance,
    isSpinning,
    isBonusGame,
    freeSpinsLeft,
    awardedFreeSpins,
    spin,
    setBet,
    buyBonus,
    setTurbo,
  } = useCascadeGameStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [showBonusOverlay, setShowBonusOverlay] = useState(false);
  const lastAwardedRef = useRef(0);
  const lastFreeSpinsRef = useRef(0);

  useEffect(() => {
    const trigger = () => {
      setShowBonusOverlay(true);
      const t = window.setTimeout(() => setShowBonusOverlay(false), 2200);
      return () => window.clearTimeout(t);
    };

    // 1) Получение бонуски через выигрыш (бек начислил фриспины)
    if (awardedFreeSpins > 0 && lastAwardedRef.current === 0) {
      lastAwardedRef.current = awardedFreeSpins;
      lastFreeSpinsRef.current = freeSpinsLeft;
      return trigger();
    }

    // 2) Покупка бонуски: фриспины появились, но awardedFreeSpins = 0 (обычно так и бывает при покупке)
    if (
      awardedFreeSpins === 0 &&
      lastFreeSpinsRef.current === 0 &&
      freeSpinsLeft > 0 &&
      isBonusGame
    ) {
      lastFreeSpinsRef.current = freeSpinsLeft;
      return trigger();
    }

    // Обновляем рефы
    if (awardedFreeSpins === 0) lastAwardedRef.current = 0;
    lastFreeSpinsRef.current = freeSpinsLeft;
  }, [awardedFreeSpins, freeSpinsLeft, isBonusGame]);

  // Синхронизация баланса при загрузке
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

  // Продвижение каскадов теперь управляется внутри CascadeBoard
  // после завершения анимации и обновления доски через updateBoardAfterCascade

  return (
    <div className="cascade-game-page">
      <BonusActivationAnimation show={showBonusOverlay} text="БОНУСНАЯ ИГРА" />
      <header className="game-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            onClick={() => { window.location.hash = '#/games'; }}
            variant="secondary"
            className="back-menu-button"
          >
            ← В меню
          </Button>
          <h1 className="game-title">🍬 SugarRash Cascade 🍬</h1>
        </div>
        <div className="header-buttons">
          <Button 
            onClick={() => setIsPaytableOpen(true)}
            variant="secondary"
            className="info-button"
          >
            📊 Правила
          </Button>
          <Button 
            onClick={() => setOnlineMode(!useOnlineMode)}
            variant={useOnlineMode ? "primary" : "secondary"}
            className="online-button"
          >
            {useOnlineMode ? '🌐 Онлайн' : '💻 Оффлайн'}
          </Button>
        </div>
      </header>
      
      <main className="game-content">
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

        <div className="game-content-wrapper">
          <div className="game-center-content">
            <CascadeBoard />
            <CascadeControlPanel
          bet={bet}
          balance={balance}
          isSpinning={isSpinning}
          isResolving={isResolving}
          isBonusGame={isBonusGame}
          freeSpinsLeft={freeSpinsLeft}
          isTurbo={isTurbo}
          onSpin={spin}
          onBetIncrease={() => setBet(bet + 2)}
          onBetDecrease={() => setBet(bet - 2)}
          onTurboToggle={() => setTurbo(!isTurbo)}
          onBuyBonus={buyBonus}
          minBet={2}
          maxBet={1000}
            />
          </div>
        </div>
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {isPaytableOpen && (
        <div className="paytable-modal-overlay" onClick={() => setIsPaytableOpen(false)}>
          <div className="paytable-modal" onClick={(e) => e.stopPropagation()}>
            <div className="paytable-header">
              <h2>Правила игры</h2>
              <Button onClick={() => setIsPaytableOpen(false)} variant="secondary">✕</Button>
            </div>
            <div className="paytable-content">
              <h3>Механика игры:</h3>
              <ul>
                <li>Игровое поле 7x7 символов</li>
                <li>Кластеры из 5+ одинаковых символов взрываются</li>
                <li>Символы падают вниз, заполняя пустоты</li>
                <li>Каскады продолжаются до тех пор, пока есть кластеры</li>
                <li>Выигрыши суммируются за все каскады</li>
              </ul>
              
              <h3>Символы:</h3>
              <ul>
                <li>🍒 🍋 🍊 🍇 🍉 💎 ⭐ - Обычные символы (0-6)</li>
                <li>🎁 - Скаттер (7): 3+ скаттеров = фриспины</li>
              </ul>
              
              <h3>Бонусы:</h3>
              <ul>
                <li>3 скаттера = 10 фриспинов</li>
                <li>4 скаттера = 15 фриспинов</li>
                <li>5+ скаттеров = 20 фриспинов</li>
                <li>Покупка бонуса: ставка × 100</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

