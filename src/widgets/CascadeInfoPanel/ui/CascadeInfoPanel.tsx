import React from 'react';
import { useCascadeGameStore } from '@entities/cascade/model/store';
import '@widgets/InfoPanel/ui/InfoPanel.css';

export const CascadeInfoPanel: React.FC = () => {
  const { 
    balance, 
    lastWin,
  } = useCascadeGameStore();

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
        </div>
    );
};

