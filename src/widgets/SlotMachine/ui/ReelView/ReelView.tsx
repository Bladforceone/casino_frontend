import React, { useState, useEffect } from 'react';
import { Symbol, SymbolType } from '@shared/types/game';
import { SymbolView } from '../SymbolView/SymbolView';
import { SpinningOverlay } from './SpinningOverlay';
import './ReelView.css';

interface ReelViewProps {
  symbols: Symbol[];
  isSpinning: boolean;
  winningPositions?: number[];
  reelIndex: number;
  isTurbo?: boolean;
}

// Создаем дополнительные символы для эффекта прокрутки
const createSpinningSymbols = (count: number): Symbol[] => {
  const types = [
    SymbolType.SYMBOL_1,
    SymbolType.SYMBOL_2,
    SymbolType.SYMBOL_3,
    SymbolType.SYMBOL_4,
    SymbolType.SYMBOL_5,
    SymbolType.SYMBOL_6,
    SymbolType.SYMBOL_7,
    SymbolType.SYMBOL_8,
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    type: types[i % types.length],
    id: `spinning-${i}-${Math.random()}`,
  }));
};

export const ReelView: React.FC<ReelViewProps> = ({ 
  symbols, 
  isSpinning,
  winningPositions = [],
  reelIndex,
  isTurbo = false,
}) => {
  const [displaySymbols, setDisplaySymbols] = useState<Symbol[]>(symbols || []);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!symbols || symbols.length === 0) {
      return;
    }

    if (isSpinning) {
      setIsAnimating(true);
      // Создаем много символов для прокрутки
      const spinSymbols = createSpinningSymbols(20);
      setDisplaySymbols([...spinSymbols, ...symbols]);
    } else {
      // Задержка перед остановкой каждого барабана
      const stopDelay = isTurbo ? 0 : reelIndex * 200; // В турбо режиме останавливаем сразу
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setDisplaySymbols(symbols);
      }, stopDelay);

      return () => clearTimeout(timer);
    }
  }, [isSpinning, symbols, reelIndex, isTurbo]);

  return (
    <div className="reel-container">
      <SpinningOverlay isActive={isAnimating} />
      <div 
        className={`reel ${isAnimating ? 'reel-spinning' : ''} ${isTurbo && isAnimating ? 'turbo' : ''}`}
        style={{
          animationDelay: `${reelIndex * 0.1}s`, // Каскадный запуск
        }}
      >
        {displaySymbols?.length > 0 && displaySymbols.map((symbol, index) => (
          <div key={symbol.id} className="reel-symbol">
            <SymbolView 
              type={symbol.type} 
              isWinning={!isAnimating && winningPositions.includes(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

