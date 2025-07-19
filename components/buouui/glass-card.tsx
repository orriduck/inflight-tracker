import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'button';
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, onClick, variant = 'default' }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    if (onClick) setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    onClick?.();
    setIsPressed(false);
  };

  return (
    <div
      className={cn(
        "backdrop-blur-lg bg-white/20 dark:bg-white/10",
        "border border-white/30 dark:border-white/20",
        "rounded-xl shadow-lg",
        "transition-all duration-200 ease-out",
        onClick && [
          "cursor-pointer select-none",
          "hover:bg-white/30 dark:hover:bg-white/20",
          "hover:border-white/40 dark:hover:border-white/30",
          "hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/20",
          variant === 'button' && [
            "hover:scale-105",
            "active:scale-95",
            isPressed && "scale-95 bg-white/40 dark:bg-white/25"
          ]
        ],
        className
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        backdropFilter: isPressed ? 'blur(20px)' : 'blur(16px)',
        WebkitBackdropFilter: isPressed ? 'blur(20px)' : 'blur(16px)',
        transform: isPressed && variant === 'button' ? 'scale(0.95)' : undefined,
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
