import React from 'react';
import { useCascadeGameStore } from '@entities/cascade/model/store';
import './CascadeInfoPanel.css';

export const CascadeInfoPanel: React.FC = () => {
  const { 
    balance, 
    lastWin, 
    totalWin, 
    isBonusGame,
    freeSpinsLeft,
    scatterCount,
    awardedFreeSpins,
    cascades,
    currentCascadeIndex,
  } = useCascadeGameStore();

  return (
    <div className="cascade-info-panel">
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

      {scatterCount > 0 && (
        <div className="scatter-info">
          <div className="scatter-badge">
            🎁 Скаттеров: {scatterCount}
          </div>
          {awardedFreeSpins > 0 && (
            <div className="free-spins-awarded">
              Начислено фриспинов: {awardedFreeSpins}
            </div>
          )}
        </div>
      )}

      {cascades.length > 0 && currentCascadeIndex >= 0 && (
        <div className="cascade-info">
          <div className="cascade-badge">
            Каскад {currentCascadeIndex + 1} / {cascades.length}
          </div>
          {cascades[currentCascadeIndex]?.clusters?.map((cluster: any, index: number) => (
            <div key={index} className="cluster-info">
              <span>Кластер {cluster.count} символов: {cluster.payout.toFixed(2)} (x{cluster.multiplier})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

