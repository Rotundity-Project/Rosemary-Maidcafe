'use client';

import React, { useState, useEffect } from 'react';
import { GameProvider } from '@/components/game/GameProvider';
import { AudioProvider } from '@/components/game/AudioProvider';
import { GameLoop } from '@/components/game/GameLoop';
import { GameUI } from '@/components/game/GameUI';

/**
 * 主页面组件
 * 集成 GameProvider、GameLoop 和 GameUI
 * 处理游戏加载状态
 * Requirements: 8.2
 */
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Handle initial loading
  useEffect(() => {
    // Simulate checking for saved game data
    const checkSavedGame = async () => {
      try {
        // Small delay to ensure localStorage is available
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load game:', error);
        setLoadError('加载游戏失败，请刷新页面重试');
        setIsLoading(false);
      }
    };

    checkSavedGame();
  }, []);

  // Loading state - white anime theme
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4 motion-safe:animate-bounce">🌿</div>
          <h1 className="text-2xl font-bold text-pink-500 mb-2">
            迷迭香咖啡厅
          </h1>
          <p className="text-gray-400">
            正在加载游戏...
          </p>
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full motion-safe:animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Error state - white anime theme
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md border border-pink-100">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-xl font-bold text-gray-700 mb-2">
            加载失败
          </h1>
          <p className="text-gray-400 mb-4">
            {loadError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition-colors shadow-sm"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  // Main game
  return (
    <GameProvider>
      <AudioProvider>
        <GameLoop />
        <GameUI />
      </AudioProvider>
    </GameProvider>
  );
}
