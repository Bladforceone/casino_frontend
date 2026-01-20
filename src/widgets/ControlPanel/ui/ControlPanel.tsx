import React, { useEffect } from 'react';
import { useGameStore } from '@entities/game';
import { Button } from '@shared/ui/Button';
import './ControlPanel.css';

export const ControlPanel: React.FC = () => {
  const { 
    bet, 
    balance, 
    isSpinning, 
    isBonusGame,
    freeSpinsLeft,
    spin, 
    setBet, 
    buyBonus,
    isTurbo,
    setTurbo,
  } = useGameStore();

  // Привязка к пробелу
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && (balance >= bet || isBonusGame)) {
        e.preventDefault();
        spin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [spin, isSpinning, balance, bet, isBonusGame]);

  const handleBetIncrease = () => {
    setBet(bet + 1);
  };

  const handleBetDecrease = () => {
    setBet(bet - 1);
  };

  const canSpin = balance >= bet || isBonusGame;
  const canBuyBonus = balance >= bet * 100 && !isBonusGame && !isSpinning;

  return (
    <div className="control-panel">
      <div className="bet-controls">
        <label className="control-label">Ставка:</label>
        <div className="bet-buttons">
          <Button 
            onClick={handleBetDecrease} 
            disabled={isSpinning || bet <= 1}
            variant="secondary"
          >
            -
          </Button>
          <div className="bet-display">{bet}</div>
          <Button 
            onClick={handleBetIncrease} 
            disabled={isSpinning || bet >= 100}
            variant="secondary"
          >
            +
          </Button>
        </div>
      </div>

      <Button
        onClick={spin}
        disabled={!canSpin || isSpinning}
        variant="primary"
        className="spin-button"
      >
        {isSpinning ? 'Вращение...' : isBonusGame ? `Фриспин (${freeSpinsLeft})` : 'Крутить'}
      </Button>

      <Button
        onClick={() => setTurbo(!isTurbo)}
        disabled={isSpinning}
        variant={isTurbo ? "danger" : "secondary"}
        className="turbo-button"
      >
        {isTurbo ? '🚀 Турбо ВКЛ' : '⚡ Турбо'}
      </Button>

      <Button
        onClick={buyBonus}
        disabled={!canBuyBonus}
        variant="danger"
        className="bonus-button"
      >
        Купить бонус ({bet * 100})
      </Button>
    </div>
  );
};

