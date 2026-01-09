'use client';

import React from 'react';
import { useGame } from '@/components/game/GameProvider';
import { formatGameTime, formatGold, formatDay, getSeasonIcon, formatSeason } from '@/utils/formatters';
import { Button } from './Button';

export function TopBar() {
  const { state, dispatch } = useGame();
  const { day, time, season, isPaused, finance, reputation } = state;

  const handleTogglePause = () => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  };

  return (
    <header className="bg-white border-b border-pink-100 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left section - Game title and day */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-pink-500">
            🌿 迷迭香咖啡厅
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{formatDay(day)}</span>
            <span className="text-pink-200">|</span>
            <span className="flex items-center gap-1">
              {getSeasonIcon(season)}
              <span className="hidden md:inline">{formatSeason(season)}</span>
            </span>
          </div>
        </div>

        {/* Center section - Time and pause control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-pink-50 rounded-lg px-3 py-1.5 border border-pink-100">
            <span className="text-lg">🕐</span>
            <span className="font-mono text-lg font-semibold text-gray-800">
              {formatGameTime(time)}
            </span>
          </div>
          <Button
            variant={isPaused ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleTogglePause}
            leftIcon={isPaused ? <PlayIcon /> : <PauseIcon />}
            className={isPaused ? '' : 'bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-200'}
          >
            <span className="hidden sm:inline">
              {isPaused ? '继续' : '暂停'}
            </span>
          </Button>
        </div>

        {/* Right section - Resources */}
        <div className="flex items-center gap-4">
          {/* Gold */}
          <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
            <span className="text-lg">💰</span>
            <span className="font-semibold text-yellow-700">
              {formatGold(finance.gold)}
            </span>
          </div>

          {/* Reputation */}
          <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
            <span className="text-lg">⭐</span>
            <span className="font-semibold text-purple-700">
              {reputation}
            </span>
          </div>

          {/* Mobile day/season display */}
          <div className="flex sm:hidden items-center gap-1 text-sm">
            <span>{getSeasonIcon(season)}</span>
            <span className="text-gray-600">D{day}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// Icon components
function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default TopBar;
