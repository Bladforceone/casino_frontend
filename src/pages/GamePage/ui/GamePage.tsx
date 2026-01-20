import React, { useEffect, useRef, useState } from 'react';
import { SlotMachine } from '@widgets/SlotMachine';
import { CasinoControlPanel } from '@widgets/CasinoControlPanel';
import { InfoPanel } from '@widgets/InfoPanel';
import { PaytableModal } from '@widgets/PaytableModal';
import { UserPanel } from '@widgets/UserPanel';
import { BonusActivationAnimation } from '@widgets/BonusActivationAnimation';
import { Button } from '@shared/ui/Button';
import { useGameStore } from '@entities/game';
import './GamePage.css';

export const GamePage: React.FC = () => {
  const [isPaytableOpen, setIsPaytableOpen] = useState(false);
  const [showBonusOverlay, setShowBonusOverlay] = useState(false);
  const {
    bet,
    balance,
    isSpinning,
    isBonusGame,
    freeSpinsLeft,
    isTurbo,
    spin,
    setBet,
    buyBonus,
    setTurbo,
  } = useGameStore();

  const mountedRef = useRef(false);
  const prevFreeSpinsRef = useRef(freeSpinsLeft);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevFreeSpinsRef.current = freeSpinsLeft;
      return;
    }

    // Показ "БОНУСНАЯ ИГРА" при входе во фриспины (и при выигрыше, и при покупке)
    if (prevFreeSpinsRef.current === 0 && freeSpinsLeft > 0 && isBonusGame) {
      setShowBonusOverlay(true);
      const t = window.setTimeout(() => setShowBonusOverlay(false), 2200);
      prevFreeSpinsRef.current = freeSpinsLeft;
      return () => window.clearTimeout(t);
    }

    prevFreeSpinsRef.current = freeSpinsLeft;
  }, [freeSpinsLeft, isBonusGame]);

  const handleBetIncrease = () => {
    setBet(bet + 1);
  };

  const handleBetDecrease = () => {
    setBet(bet - 1);
  };

  return (
    <div className="game-page">
      <BonusActivationAnimation show={showBonusOverlay} text="БОНУСНАЯ ИГРА" />
      <header className="game-header">
        <Button
          onClick={() => { window.location.hash = '#/games'; }}
          variant="secondary"
          className="back-menu-button"
        >
          ← В меню
        </Button>
        <h1 className="game-title">🎰 Слот Машина 🎰</h1>
        <Button 
          onClick={() => setIsPaytableOpen(true)}
          variant="secondary"
          className="info-button"
        >
          📊 Таблица выплат
        </Button>
      </header>
      
      <main className="game-content">
        <UserPanel />
        <SlotMachine />
        <CasinoControlPanel
          bet={bet}
          balance={balance}
          isSpinning={isSpinning}
          isBonusGame={isBonusGame}
          freeSpinsLeft={freeSpinsLeft}
          isTurbo={isTurbo}
          onSpin={spin}
          onBetIncrease={handleBetIncrease}
          onBetDecrease={handleBetDecrease}
          onTurboToggle={() => setTurbo(!isTurbo)}
          onBuyBonus={buyBonus}
          minBet={1}
          maxBet={100}
        />
      </main>
      
      <footer className="game-footer">
        <p>20 линий выигрыша • Бонусные игры • Wild символы</p>
      </footer>

      <PaytableModal 
        isOpen={isPaytableOpen} 
        onClose={() => setIsPaytableOpen(false)} 
      />
    </div>
  );
};

