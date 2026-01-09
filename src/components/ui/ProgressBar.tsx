'use client';

import React from 'react';

export type ProgressBarColor = 'pink' | 'green' | 'blue' | 'yellow' | 'red' | 'purple';
export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: ProgressBarColor;
  size?: ProgressBarSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const colorStyles: Record<ProgressBarColor, string> = {
  pink: 'bg-pink-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
};

const bgColorStyles: Record<ProgressBarColor, string> = {
  pink: 'bg-pink-100',
  green: 'bg-green-100',
  blue: 'bg-blue-100',
  yellow: 'bg-yellow-100',
  red: 'bg-red-100',
  purple: 'bg-purple-100',
};

const sizeStyles: Record<ProgressBarSize, string> = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  color = 'pink',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-xs text-gray-600">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-xs font-medium text-gray-700">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`
          w-full rounded-full overflow-hidden
          ${bgColorStyles[color]}
          ${sizeStyles[size]}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`
            h-full rounded-full transition-all duration-300 ease-out
            ${colorStyles[color]}
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Specialized progress bars for common game uses
interface StaminaBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: ProgressBarSize;
}

export function StaminaBar({ value, max = 100, showLabel = false, size = 'sm' }: StaminaBarProps) {
  // Color changes based on stamina level
  const color: ProgressBarColor = value < 20 ? 'red' : value < 50 ? 'yellow' : 'green';
  return (
    <ProgressBar
      value={value}
      max={max}
      color={color}
      size={size}
      showLabel={showLabel}
      label="体力"
    />
  );
}

export function PatienceBar({ value, max = 100, showLabel = false, size = 'sm' }: StaminaBarProps) {
  // Color changes based on patience level
  const color: ProgressBarColor = value < 30 ? 'red' : value < 60 ? 'yellow' : 'blue';
  return (
    <ProgressBar
      value={value}
      max={max}
      color={color}
      size={size}
      showLabel={showLabel}
      label="耐心"
    />
  );
}

export function MoodBar({ value, max = 100, showLabel = false, size = 'sm' }: StaminaBarProps) {
  const color: ProgressBarColor = value < 30 ? 'red' : value < 60 ? 'yellow' : 'pink';
  return (
    <ProgressBar
      value={value}
      max={max}
      color={color}
      size={size}
      showLabel={showLabel}
      label="心情"
    />
  );
}

export function ExperienceBar({ value, max = 100, showLabel = false, size = 'sm' }: StaminaBarProps) {
  return (
    <ProgressBar
      value={value}
      max={max}
      color="purple"
      size={size}
      showLabel={showLabel}
      label="经验"
    />
  );
}

export default ProgressBar;
