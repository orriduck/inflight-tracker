import React, { useState, useRef, useEffect } from 'react';

interface LiquidGlassProps {
  width?: number;
  height?: number;
  initialPosition?: { x: number | 'center'; y: number | 'center' };
  borderRadius?: number;
  className?: string;
  disabled?: boolean;
  constrainToViewport?: boolean;
  opacity?: number;
  blur?: number;
  contrast?: number;
  brightness?: number;
  saturate?: number;
  onDragStart?: (position: { x: number; y: number }) => void;
  onDrag?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  style?: React.CSSProperties;
}

const LiquidGlass: React.FC<LiquidGlassProps> = ({
  width = 300,
  height = 200,
  initialPosition = { x: 'center', y: 'center' },
  borderRadius = 150,
  className = '',
  disabled = false,
  constrainToViewport = true,
  opacity = 1,
  blur = 0.25,
  contrast = 1.2,
  brightness = 1.05,
  saturate = 1.1,
  onDragStart,
  onDrag,
  onDragEnd,
  style = {},
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const glassRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    let initialX = 0;
    let initialY = 0;

    if (initialPosition.x === 'center') {
      initialX = containerRect.width / 2 - width / 2;
    } else {
      initialX = initialPosition.x;
    }

    if (initialPosition.y === 'center') {
      initialY = containerRect.height / 2 - height / 2;
    } else {
      initialY = initialPosition.y;
    }

    setPosition({ x: initialX, y: initialY });
  }, [initialPosition, width, height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const currentX = position.x;
    const currentY = position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newX = currentX + dx;
      let newY = currentY + dy;

      if (constrainToViewport && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, containerRect.width - width));
        newY = Math.max(0, Math.min(newY, containerRect.height - height));
      }

      setPosition({ x: newX, y: newY });
      onDrag?.({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      onDragEnd?.({ x: position.x, y: position.y });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    onDragStart?.({ x: position.x, y: position.y });
  };

  const glassStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: `${borderRadius}px`,
    transform: `translate(${position.x}px, ${position.y}px)`,
    opacity: opacity,
    backdropFilter: `blur(${blur}px) contrast(${contrast}) brightness(${brightness}) saturate(${saturate})`,
    WebkitBackdropFilter: `blur(${blur}px) contrast(${contrast}) brightness(${brightness}) saturate(${saturate})`, // For Safari
    cursor: disabled ? 'default' : 'grab',
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      <div
        ref={glassRef}
        className="absolute top-0 left-0 transition-none" // transition-none to prevent lag during drag
        style={glassStyle}
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
};

export default LiquidGlass;
