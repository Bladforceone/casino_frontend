import React, { useEffect } from 'react';
import { useCascadeGameStore } from '@entities/cascade/model/store';
import { Button } from '@shared/ui/Button';
import './CascadeControlPanel.css';

export const CascadeControlPanel: React.FC = () => {
  const { 
    bet, 
    balance, 
    isSpinning, 
    isResolving,
    isBonusGame,
    freeSpinsLeft,
    spin, 
    setBet, 
    buyBonus,
    isTurbo,
    setTurbo,
  } = useCascadeGameStore();

  // Привязка к пробелу
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && !isResolving && (balance >= bet || isBonusGame)) {
        e.preventDefault();
        spin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [spin, isSpinning, isResolving, balance, bet, isBonusGame]);

  const handleBetIncrease = () => {
    setBet(bet + 2); // Увеличиваем на 2, так как ставка должна быть четной
  };

  const handleBetDecrease = () => {
    setBet(bet - 2); // Уменьшаем на 2
  };

  const canSpin = (balance >= bet || isBonusGame) && !isSpinning && !isResolving;
  const canBuyBonus = balance >= bet * 100 && !isBonusGame && !isSpinning && !isResolving;

  return (
    <div className="cascade-control-panel">
      <div className="bet-controls">
        <label className="control-label">Ставка:</label>
        <div className="bet-buttons">
          <Button 
            onClick={handleBetDecrease} 
            disabled={isSpinning || isResolving || bet <= 2}
            variant="secondary"
          >
            -
          </Button>
          <div className="bet-display">{bet}</div>
          <Button 
            onClick={handleBetIncrease} 
            disabled={isSpinning || isResolving || bet >= 1000}
            variant="secondary"
          >
            +
          </Button>
        </div>
      </div>

      <Button
        onClick={() => spin()}
        disabled={!canSpin}
        variant="primary"
        className="spin-button"
        type="button"
      >
        {isSpinning ? 'Вращение...' : isResolving ? 'Каскад...' : isBonusGame ? `Фриспин (${freeSpinsLeft})` : 'Крутить'}
      </Button>

      <Button
        onClick={() => setTurbo(!isTurbo)}
        disabled={isSpinning || isResolving}
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

