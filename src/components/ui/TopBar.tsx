'use client';

import React from 'react';
import { useGame } from '@/components/game/GameProvider';
import { formatGameTime, formatGold, formatDay, getSeasonIcon, formatSeason, getWeatherIcon, formatWeather } from '@/utils/formatters';
import { Button } from './Button';
import { SpeedControl } from './SpeedControl';

export function TopBar() {
  const { state, dispatch } = useGame();
  const { day, time, season, weather, isPaused, finance, reputation, gameSpeed } = state;

  const handleTogglePause = () => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  };

  const handleSpeedChange = (speed: typeof gameSpeed) => {
    dispatch({ type: 'SET_GAME_SPEED', speed });
  };

  return (
    <header className="bg-white border-b border-pink-100 px-2 sm:px-4 py-2 sm:py-3 shadow-sm">
      {/* Desktop layout (>= 640px): Single row */}
      <div className="hidden sm:flex items-center justify-between max-w-7xl mx-auto">
        {/* Left section - Game title and day */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-pink-500">
            🌿 迷迭香咖啡厅
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{formatDay(day)}</span>
            <span className="text-pink-200">|</span>
            <span className="flex items-center gap-1">
              {getSeasonIcon(season)}
              <span className="hidden md:inline">{formatSeason(season)}</span>
            </span>
            <span className="text-pink-200">|</span>
            <span className="flex items-center gap-1">
              {getWeatherIcon(weather)}
              <span className="hidden md:inline">{formatWeather(weather)}</span>
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
          <SpeedControl currentSpeed={gameSpeed} onSpeedChange={handleSpeedChange} />
          <Button
            variant={isPaused ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleTogglePause}
            leftIcon={isPaused ? <PlayIcon /> : <PauseIcon />}
            className={isPaused ? '' : 'bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-200'}
          >
            {isPaused ? '继续' : '暂停'}
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
        </div>
      </div>

      {/* Mobile layout (< 640px): Compact two-row layout */}
      <div className="flex sm:hidden flex-col gap-2 max-w-7xl mx-auto safe-area-top">
        {/* Row 1: Icon, Time, Pause button, Speed Control */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Game icon only (no title text on mobile) */}
          <div className="flex items-center">
            <span className="text-xl" aria-label="迷迭香咖啡厅">🌿</span>
          </div>

          {/* Center: Time display */}
          <div className="flex items-center gap-1.5 bg-pink-50 rounded-lg px-3 py-1.5 border border-pink-100 flex-1 justify-center">
            <span className="text-base">🕐</span>
            <span className="font-mono text-base font-semibold text-gray-800">
              {formatGameTime(time)}
            </span>
          </div>

          {/* Right: Pause button with touch-target size */}
          <button
            onClick={handleTogglePause}
            className={`touch-target-lg flex items-center justify-center rounded-lg transition-all duration-150 active:scale-95 min-w-[48px] min-h-[48px] ${
              isPaused 
                ? 'bg-pink-500 text-white' 
                : 'bg-pink-100 text-pink-700 border border-pink-200'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={isPaused ? '继续游戏' : '暂停游戏'}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>

        {/* Row 2: Resources (Gold, Reputation, Day/Season) and Speed Control */}
        <div className="flex items-center justify-between gap-2">
          {/* Gold */}
          <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1.5 rounded-lg border border-yellow-100 flex-1 justify-center">
            <span className="text-base">💰</span>
            <span className="font-semibold text-yellow-700 text-sm">
              {formatGold(finance.gold)}
            </span>
          </div>

          {/* Reputation */}
          <div className="flex items-center gap-1.5 bg-purple-50 px-2 py-1.5 rounded-lg border border-purple-100 flex-1 justify-center">
            <span className="text-base">⭐</span>
            <span className="font-semibold text-purple-700 text-sm">
              {reputation}
            </span>
          </div>

          {/* Day/Season */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 flex-1 justify-center">
            <span className="text-base">{getSeasonIcon(season)}</span>
            <span className="text-gray-600 text-sm font-medium">D{day}</span>
          </div>

          {/* Speed Control - Compact version for mobile */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-1">
            {[
              { value: 0.5, label: '0.5x', icon: '🐢' },
              { value: 1, label: '1x', icon: '🚶' },
              { value: 2, label: '2x', icon: '🚀' },
              { value: 4, label: '4x', icon: '⚡' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSpeedChange(option.value as typeof gameSpeed)}
                className={`
                  flex items-center justify-center px-2 py-1.5 rounded text-xs font-medium
                  transition-all duration-150 active:scale-95 touch-feedback
                  ${gameSpeed === option.value
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-600 hover:bg-white/50'
                  }
                `}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label={`游戏速度 ${option.label}`}
              >
                <span>{option.icon}</span>
              </button>
            ))}
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
