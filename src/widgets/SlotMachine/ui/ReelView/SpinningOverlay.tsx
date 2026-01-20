import React from 'react';
import './SpinningOverlay.css';

interface SpinningOverlayProps {
  isActive: boolean;
}

export const SpinningOverlay: React.FC<SpinningOverlayProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="spinning-overlay">
      <div className="spin-lines" />
    </div>
  );
};

