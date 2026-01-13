'use client';

import React from 'react';
import { GameSpeed } from '@/types';

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

export function SpeedControl({ currentSpeed, onSpeedChange }: SpeedControlProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">速度:</span>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {speedOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSpeedChange(option.value)}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium
              transition-all duration-200
              ${currentSpeed === option.value
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-gray-600 hover:bg-white/50'
              }
            `}
            aria-label={`游戏速度 ${option.label}`}
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
