'use client';

import React, { useState, useRef, useCallback } from 'react';

interface SwipeableListItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    label: string;
    icon: string;
    color: string;
  };
  rightAction?: {
    label: string;
    icon: string;
    color: string;
  };
  disabled?: boolean;
  className?: string;
}

export function SwipeableListItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  disabled = false,
  className = '',
}: SwipeableListItemProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const maxOffset = 80; // Maximum swipe distance in pixels

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || disabled) return;
    
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX.current;
    const clampedDiff = Math.max(-maxOffset, Math.min(maxOffset, diff));
    setOffsetX(clampedDiff);
  }, [isDragging, disabled]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || disabled) return;
    
    // Trigger action if swiped far enough
    if (offsetX > maxOffset * 0.6 && onSwipeRight) {
      onSwipeRight();
    } else if (offsetX < -maxOffset * 0.6 && onSwipeLeft) {
      onSwipeLeft();
    }
    
    // Reset position
    setOffsetX(0);
    setIsDragging(false);
  }, [isDragging, offsetX, onSwipeLeft, onSwipeRight, disabled]);

  // Mouse events for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleTouchStart(e);
  }, [handleTouchStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleTouchMove(e);
  }, [handleTouchMove]);

  const handleMouseUp = useCallback(() => {
    handleTouchEnd();
  }, [handleTouchEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setOffsetX(0);
      setIsDragging(false);
    }
  }, [isDragging]);

  const hasLeftAction = leftAction && onSwipeLeft;
  const hasRightAction = rightAction && onSwipeRight;
  const showLeftIndicator = offsetX > 10 && hasLeftAction;
  const showRightIndicator = offsetX < -10 && hasRightAction;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      {/* Left Action Indicator */}
      {hasLeftAction && (
        <div 
          className={`absolute inset-y-0 left-0 flex items-center px-4 transition-opacity duration-200 ${
            showLeftIndicator ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            backgroundColor: leftAction.color,
            transform: `translateX(${Math.max(0, offsetX)}px)`
          }}
        >
          <span className="text-white text-sm font-medium">
            {leftAction.icon} {leftAction.label}
          </span>
        </div>
      )}

      {/* Right Action Indicator */}
      {hasRightAction && (
        <div 
          className={`absolute inset-y-0 right-0 flex items-center px-4 transition-opacity duration-200 ${
            showRightIndicator ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            backgroundColor: rightAction.color,
            transform: `translateX(${Math.min(0, offsetX)}px)`
          }}
        >
          <span className="text-white text-sm font-medium">
            {rightAction.label} {rightAction.icon}
          </span>
        </div>
      )}

      {/* Main Content */}
      <div 
        className="transition-transform duration-100"
        style={{ 
          transform: `translateX(${offsetX}px)`,
          cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab'
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeableListItem;
