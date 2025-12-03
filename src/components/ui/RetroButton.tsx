/**
 * RetroButton component
 * Button with 3D effects and Y2K styling
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './RetroButton.css';

export interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export function RetroButton({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  className = '',
  disabled = false,
  ...props 
}: RetroButtonProps) {
  return (
    <button
      className={`retro-button retro-button-${variant} retro-button-${size} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
