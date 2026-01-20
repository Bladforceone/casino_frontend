import React, { useMemo, useEffect, useState } from 'react';
import { useGameStore } from '@entities/game';
import { ReelView } from './ReelView/ReelView';
import { LinesOverlay } from './LinesOverlay/LinesOverlay';
import { WinAnimation } from './WinAnimation/WinAnimation';
import './SlotMachine.css';

export const SlotMachine: React.FC = () => {
  const { reels, isSpinning, winningLines, lastWin, isTurbo } = useGameStore();
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  // Создаем карту выигрышных позиций
  const winningPositionsMap = useMemo(() => {
    const map: Record<number, number[]> = {};
    
    winningLines.forEach(line => {
      line.positions.forEach(([reelIndex, rowIndex]) => {
        if (!map[reelIndex]) {
          map[reelIndex] = [];
        }
        if (!map[reelIndex].includes(rowIndex)) {
          map[reelIndex].push(rowIndex);
        }
      });
    });
    
    console.log('🔥 Winning positions map:', map, 'from lines:', winningLines);
    
    return map;
  }, [winningLines]);

  // Показываем анимацию выигрыша
  useEffect(() => {
    if (!isSpinning && lastWin > 0) {
      setShowWinAnimation(true);
      const timer = setTimeout(() => setShowWinAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSpinning, lastWin]);

  return (
    <div className="slot-machine">
      <div className="slot-machine-frame">
        <WinAnimation winAmount={lastWin} show={showWinAnimation} />
        <div className="reels-container">
          <LinesOverlay winningLines={winningLines} />
          {reels.map((reel, index) => (
            <ReelView
              key={index}
              reelIndex={index}
              symbols={reel.symbols}
              isSpinning={isSpinning}
              winningPositions={winningPositionsMap[index] || []}
              isTurbo={isTurbo}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

