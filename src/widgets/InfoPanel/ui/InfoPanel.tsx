import React from 'react';
import { useGameStore } from '@entities/game';
import './InfoPanel.css';

export const InfoPanel: React.FC = () => {
  const { 
    balance, 
    lastWin, 
    totalWin, 
    isBonusGame,
    freeSpinsLeft,
    winningLines 
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
        
        <div className="info-item">
          <span className="info-label">Общий выигрыш:</span>
          <span className="info-value total">{totalWin.toFixed(2)}</span>
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

      {winningLines.length > 0 && (
        <div className="winning-info">
          <h3 className="winning-title">Выигрышные линии:</h3>
          <div className="winning-lines">
            {winningLines.map((line, index) => (
              <div key={index} className="winning-line">
                {line.lineIndex === -1 ? (
                  <span>Бонус x{line.count}: {line.winAmount.toFixed(2)}</span>
                ) : (
                  <span>
                    Линия {line.lineIndex}: {line.count}x {line.symbols} = {line.winAmount.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

