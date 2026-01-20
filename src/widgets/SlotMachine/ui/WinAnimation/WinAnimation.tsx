import React, { useEffect, useState } from 'react';
import './WinAnimation.css';

interface WinAnimationProps {
  winAmount: number;
  show: boolean;
}

export const WinAnimation: React.FC<WinAnimationProps> = ({ winAmount, show }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show && winAmount > 0) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [show, winAmount]);

  if (!visible || winAmount === 0) return null;

  return (
    <div className="win-animation">
      <div className="win-text">
        <span className="win-label">ВЫИГРЫШ!</span>
        <span className="win-amount">{winAmount.toFixed(2)}</span>
      </div>
      <div className="win-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              '--angle': `${(i * 360) / 20}deg`,
              '--delay': `${i * 0.05}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

