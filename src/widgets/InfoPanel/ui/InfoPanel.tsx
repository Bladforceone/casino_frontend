import React from 'react';
import { useGameStore } from '@entities/game';
import './InfoPanel.css';

export const InfoPanel: React.FC = () => {
  const { 
    balance, 
    lastWin,
    isBonusGame,
    freeSpinsLeft,
  } = useGameStore();

  return (
    <div className="info-panel">
      <div className="info-section">
        <div className="info-item">
          <span className="info-label">Баланс:</span>
          <span className="info-value balance">{balance.toFixed(2)}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Последний выигрыш:</span>
          <span className={`info-value ${lastWin > 0 ? 'win' : ''}`}>
            {lastWin.toFixed(2)}
          </span>
        </div>

      </div>

      {isBonusGame && (
        <div className="bonus-indicator">
          <div className="bonus-badge">
            🎁 БОНУСНАЯ ИГРА
          </div>
          <div className="free-spins">
            Осталось фриспинов: {freeSpinsLeft}
          </div>
        </div>
      )}


    </div>
  );
};

