import React, { useState, useEffect, useMemo } from 'react';
import { WinningLine, SymbolType } from '@shared/types/game';
import './LinesOverlay.css';

interface LinesOverlayProps {
  winningLines: WinningLine[];
}

// Константы для расчета позиций (соответствуют ReelView.css)
const REEL_WIDTH = 120;
const REEL_GAP = 12;
const SYMBOL_HEIGHT = 100;
const SYMBOL_GAP = 8;
const REEL_PADDING = 10;
const REELS_COUNT = 5;
const ROWS_COUNT = 3;

// Мобильные размеры
const REEL_WIDTH_MOBILE = 75;
const REEL_GAP_MOBILE = 8;
const SYMBOL_HEIGHT_MOBILE = 60;
const SYMBOL_GAP_MOBILE = 4;
const REEL_PADDING_MOBILE = 5;

// Функция для получения центра символа
// Учитываем, что каждый reel-container имеет свою ширину и padding
const getSymbolCenter = (
  reelIndex: number,
  rowIndex: number,
  isMobile: boolean = false
): { x: number; y: number } => {
  const reelWidth = isMobile ? REEL_WIDTH_MOBILE : REEL_WIDTH;
  const reelGap = isMobile ? REEL_GAP_MOBILE : REEL_GAP;
  const symbolHeight = isMobile ? SYMBOL_HEIGHT_MOBILE : SYMBOL_HEIGHT;
  const symbolGap = isMobile ? SYMBOL_GAP_MOBILE : SYMBOL_GAP;
  const padding = isMobile ? REEL_PADDING_MOBILE : REEL_PADDING;
  
  // X координата: позиция начала reel + центр reel
  const x = reelIndex * (reelWidth + reelGap) + reelWidth / 2;
  
  // Y координата: padding + позиция ряда + центр символа
  const y = padding + rowIndex * (symbolHeight + symbolGap) + symbolHeight / 2;
  
  return { x, y };
};

// Функция для генерации пути линии
const generateLinePath = (
  positions: number[][],
  isMobile: boolean = false
): string => {
  if (!positions || positions.length === 0) {
    console.warn('⚠️ Empty positions array');
    return '';
  }
  
  const points = positions
    .filter(pos => pos && pos.length >= 2 && !isNaN(pos[0]) && !isNaN(pos[1]))
    .map(([reelIndex, rowIndex]) => {
      // Проверяем валидность индексов
      if (reelIndex < 0 || reelIndex >= REELS_COUNT || rowIndex < 0 || rowIndex >= ROWS_COUNT) {
        console.warn(`⚠️ Invalid position: [${reelIndex}, ${rowIndex}]`);
        return null;
      }
      return getSymbolCenter(reelIndex, rowIndex, isMobile);
    })
    .filter(point => point !== null) as { x: number; y: number }[];
  
  if (points.length === 0) {
    console.warn('⚠️ No valid points after filtering');
    return '';
  }
  
  if (points.length === 1) {
    // Для одной точки создаем маленький круг
    return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
  }
  
  // Используем прямые линии между точками
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  
  return path;
};

export const LinesOverlay: React.FC<LinesOverlayProps> = ({ winningLines }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Фильтруем линии, исключая бонусные символы (подарки)
  // Бонусные символы имеют lineIndex: -1 или symbols: SymbolType.BONUS
  const filteredLines = useMemo(() => {
    return winningLines.filter(line => 
      line.lineIndex !== -1 && line.symbols !== SymbolType.BONUS
    );
  }, [winningLines]);
  
  // Определяем мобильный режим
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Сбрасываем индекс когда массив изменяется
  useEffect(() => {
    if (filteredLines.length === 0) {
      setCurrentLineIndex(0);
      return;
    }
    
    // Убеждаемся, что индекс в пределах массива
    if (currentLineIndex >= filteredLines.length) {
      setCurrentLineIndex(0);
    }
  }, [filteredLines, currentLineIndex]);
  
  useEffect(() => {
    if (filteredLines.length === 0) return;
    
    // Циклическая анимация через все выигрышные линии (без бонусов)
    const interval = setInterval(() => {
      setCurrentLineIndex((prev) => {
        if (filteredLines.length === 0) return 0;
        return (prev + 1) % filteredLines.length;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [filteredLines.length]);
  
  // Вычисляем размеры контейнера для SVG
  const svgDimensions = useMemo(() => {
    const reelWidth = isMobile ? REEL_WIDTH_MOBILE : REEL_WIDTH;
    const reelGap = isMobile ? REEL_GAP_MOBILE : REEL_GAP;
    const symbolHeight = isMobile ? SYMBOL_HEIGHT_MOBILE : SYMBOL_HEIGHT;
    const symbolGap = isMobile ? SYMBOL_GAP_MOBILE : SYMBOL_GAP;
    const padding = isMobile ? REEL_PADDING_MOBILE : REEL_PADDING;
    
    const width = REELS_COUNT * reelWidth + (REELS_COUNT - 1) * reelGap;
    const height = ROWS_COUNT * symbolHeight + (ROWS_COUNT - 1) * symbolGap + 2 * padding;
    
    return { width, height };
  }, [isMobile]);
  
  // Безопасная проверка существования элемента
  const currentLine = filteredLines.length > 0 ? filteredLines[currentLineIndex] : null;
  
  // Генерируем путь для текущей линии (даже если currentLine может быть undefined)
  const linePath = currentLine ? generateLinePath(currentLine.positions, isMobile) : '';
  
  // Отладочная информация (всегда вызываем хук, но проверяем внутри)
  useEffect(() => {
    if (currentLine) {
      console.log('🎯 Current line:', {
        lineIndex: currentLine.lineIndex,
        positions: currentLine.positions,
        path: linePath,
        pathLength: linePath.length,
        count: currentLine.count,
        winAmount: currentLine.winAmount,
        gradientId: `lineGradient-${currentLine.lineIndex}`
      });
      
      // Проверяем, что путь не пустой
      if (!linePath || linePath.trim() === '') {
        console.error('❌ Empty path for line:', currentLine.lineIndex, 'positions:', currentLine.positions);
      }
    }
  }, [currentLine, linePath]);
  
  // Если нет линий для отображения (только бонусы), не показываем линии
  if (filteredLines.length === 0) {
    // Но все равно показываем счетчик, если есть выигрышные линии (включая бонусы)
    if (winningLines.length === 0) return null;
    
    return (
      <div className="lines-overlay">
        <div className="lines-counter">
          <span className="lines-label">Выигрышных линий:</span>
          <span className="lines-count">{winningLines.length}</span>
        </div>
      </div>
    );
  }

  // Если нет текущей линии или путь пустой, показываем только счетчик
  if (!currentLine || !linePath || linePath.trim() === '' || currentLine.positions.length === 0) {
    if (currentLine) {
      console.warn('⚠️ Empty line path for line:', currentLine.lineIndex, 'positions:', currentLine.positions);
    }
    return (
      <div className="lines-overlay">
        <div className="lines-counter">
          <span className="lines-label">Выигрышных линий:</span>
          <span className="lines-count">{winningLines.length}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SVG overlay для визуализации линий */}
      <svg
        className="winning-lines-svg"
        width={svgDimensions.width}
        height={svgDimensions.height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {/* Градиенты для линий - должны быть в defs и иметь уникальные ID */}
        <defs>
          <linearGradient id={`lineGradient-${currentLine.lineIndex}`} x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#64C8FF" stopOpacity="1" />
            <stop offset="30%" stopColor="#7DB8FF" stopOpacity="1" />
            <stop offset="50%" stopColor="#9B7FFF" stopOpacity="1" />
            <stop offset="70%" stopColor="#D18AFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF6B9D" stopOpacity="1" />
          </linearGradient>
          <linearGradient id={`lineGlowGradient-${currentLine.lineIndex}`} x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B8E6FF" stopOpacity="1" />
            <stop offset="30%" stopColor="#C8EDFF" stopOpacity="1" />
            <stop offset="50%" stopColor="#C4B5FF" stopOpacity="1" />
            <stop offset="70%" stopColor="#E0C5FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFB8D1" stopOpacity="1" />
          </linearGradient>
          {/* Радиальный градиент для свечения */}
          <radialGradient id={`lineGlowRadial-${currentLine.lineIndex}`}>
            <stop offset="0%" stopColor="rgba(100, 200, 255, 0.8)" />
            <stop offset="50%" stopColor="rgba(155, 127, 255, 0.5)" />
            <stop offset="100%" stopColor="rgba(255, 107, 157, 0.2)" />
          </radialGradient>
        </defs>
        
        {/* Тень линии для эффекта глубины (самый нижний слой) */}
        <path
          d={linePath}
          className="line-shadow"
          strokeWidth={isMobile ? 6 : 10}
        />
        {/* Основная градиентная линия (главный слой) - должна быть видна поверх тени */}
        <path
          d={linePath}
          className="winning-line"
          strokeWidth={isMobile ? 6 : 8}
          stroke={`url(#lineGradient-${currentLine.lineIndex})`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={1}
        />
        {/* Дополнительная светящаяся линия для эффекта */}
        <path
          d={linePath}
          className="winning-line-glow"
          strokeWidth={isMobile ? 4 : 5}
          stroke={`url(#lineGlowGradient-${currentLine.lineIndex})`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Дополнительный слой свечения для большей яркости */}
        <path
          d={linePath}
          className="winning-line-glow"
          strokeWidth={isMobile ? 3 : 4}
          stroke={`url(#lineGlowGradient-${currentLine.lineIndex})`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
          style={{
            filter: 'blur(3px)',
          }}
        />
      </svg>
      
      {/* Счетчик линий */}
      <div className="lines-overlay">
        <div className="lines-counter">
          <span className="lines-label">Выигрышных линий:</span>
          <span className="lines-count">{winningLines.length}</span>
        </div>
      </div>
      
      {/* Индикатор текущей линии */}
      {filteredLines.length > 1 && (
        <div className="line-indicator">
          <span className="line-number">
            {currentLine.lineIndex === -1 
              ? 'Бонус' 
              : `Линия ${currentLine.lineIndex}`}
          </span>
          <span className="line-win">
            +{currentLine.winAmount}
          </span>
        </div>
      )}
    </>
  );
};


