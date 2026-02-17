'use client';

import React, { useCallback, KeyboardEvent } from 'react';
import { GameSpeed } from '@/types';
import { selectionFeedback, supportsHapticFeedback } from '@/utils/haptic';

interface SpeedControlProps {
  currentSpeed: GameSpeed;
  onSpeedChange: (speed: GameSpeed) => void;
}

const speedOptions: { value: GameSpeed; label: string; icon: string }[] = [
  { value: 0.5, label: '0.5x', icon: '🐢' },
  { value: 1, label: '1x', icon: '🚶' },
  { value: 2, label: '2x', icon: '🚀' },
  { value: 4, label: '4x', icon: '⚡' },
];

// 触觉反馈函数
const triggerHaptic = (type: 'light' | 'medium' = 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const patterns = {
      light: 10,
      medium: 25,
    };
    navigator.vibrate(patterns[type]);
  }
};

export function SpeedControl({ currentSpeed, onSpeedChange }: SpeedControlProps) {
  const handleSpeedChange = useCallback((speed: GameSpeed) => {
    triggerHaptic('light');
    onSpeedChange(speed);
  }, [onSpeedChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let newIndex = index;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = (index + 1) % speedOptions.length;
        triggerHaptic('light');
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = (index - 1 + speedOptions.length) % speedOptions.length;
        triggerHaptic('light');
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        triggerHaptic('medium');
        break;
      case 'End':
        e.preventDefault();
        newIndex = speedOptions.length - 1;
        triggerHaptic('medium');
        break;
      default:
        return;
    }
    
    onSpeedChange(speedOptions[newIndex].value);
  }, [onSpeedChange]);

  return (
    <div 
      className="flex items-center gap-2"
      role="group"
      aria-label="游戏速度控制"
    >
      <span id="speed-label" className="text-sm text-gray-600">速度:</span>
      <div 
        className="flex gap-1 bg-gray-100 rounded-lg p-1"
        role="radiogroup"
        aria-labelledby="speed-label"
      >
        {speedOptions.map((option, index) => (
          <button
            key={option.value}
            onClick={() => handleSpeedChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1
              ${currentSpeed === option.value
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-gray-600 hover:bg-white/50'
              }
            `}
            role="radio"
            aria-checked={currentSpeed === option.value}
            aria-label={`游戏速度 ${option.label}`}
            // 所有按钮都可聚焦，支持 Tab 导航
            tabIndex={0}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SpeedControl;
