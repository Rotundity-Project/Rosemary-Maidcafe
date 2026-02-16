'use client';

import React, { useState, useEffect } from 'react';
import { GameProvider } from '@/components/game/GameProvider';
import { AudioProvider } from '@/components/game/AudioProvider';
import { GameLoop } from '@/components/game/GameLoop';
import { GameUI } from '@/components/game/GameUI';
import { GameContentSkeleton, LoadingProgress } from '@/components/ui/SkeletonLoader';

/**
 * 主页面组件
 * 集成 GameProvider、GameLoop 和 GameUI
 * 处理游戏加载状态
 * Requirements: 8.2
 */
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Loading steps for progress indication
  const loadingSteps = ['初始化', '加载数据', '准备资源'];

  // Handle initial loading
  useEffect(() => {
    const loadGame = async () => {
      try {
        // Step 1: Initialize
        setLoadingStep(0);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 2: Load saved data
        setLoadingStep(1);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 3: Prepare resources
        setLoadingStep(2);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load game:', error);
        setLoadError('加载游戏失败，请刷新页面重试');
        setIsLoading(false);
      }
    };

    loadGame();
  }, []);

  // Loading state - white anime theme with progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center max-w-sm px-4">
          {/* Logo/Title with animation */}
          <div className="relative mb-6">
            <div className="text-6xl mb-4 animate-bounce">🌿</div>
            <h1 className="text-2xl font-bold text-pink-500 mb-2">
              迷迭香咖啡厅
            </h1>
            <p className="text-gray-400 text-sm">
              少女的咖啡厅经营物语
            </p>
            
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
            <div className="absolute -bottom-1 -left-3 text-xl animate-pulse delay-100">☕</div>
          </div>

          {/* Loading progress */}
          <div className="mb-6">
            <LoadingProgress steps={loadingSteps} currentStep={loadingStep} />
          </div>

          {/* Loading indicator */}
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
          </div>
          
          <p className="text-gray-400 text-sm mt-4">
            正在加载...
          </p>
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
