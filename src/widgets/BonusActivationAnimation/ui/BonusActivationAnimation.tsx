import React, { useEffect, useState } from 'react';
import './BonusActivationAnimation.css';

interface BonusActivationAnimationProps {
  show: boolean;
  text?: string;
  durationMs?: number;
}

export const BonusActivationAnimation: React.FC<BonusActivationAnimationProps> = ({
  show,
  text = 'БОНУСНАЯ ИГРА',
  durationMs = 2200,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const t = window.setTimeout(() => setIsVisible(false), durationMs);
    return () => window.clearTimeout(t);
  }, [show, durationMs]);

  if (!isVisible) return null;

  return (
    <div className="bonus-activation-overlay" aria-hidden="true">
      <div className="bonus-activation-backdrop" />
      <div className="bonus-activation-content">
        <div className="bonus-activation-sparkles" />
        <div className="bonus-activation-title">{text}</div>
        <div className="bonus-activation-subtitle">Бесплатные вращения активированы </div>
      </div>
    </div>
  );
};


