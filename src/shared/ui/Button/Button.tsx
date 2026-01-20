import React from 'react';
import './Button.css';

interface ButtonProps {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  variant = 'primary',
  children,
  className = '',
  type = 'button',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Предотвращаем стандартное поведение кнопки (submit формы, скролл и т.д.)
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`button button-${variant} ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

