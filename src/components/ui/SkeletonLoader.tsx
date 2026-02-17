'use client';

import React from 'react';

/**
 * 骨架屏加载组件
 * 提供更友好的加载体验，减少感知等待时间
 */
export function SkeletonLoader({ 
  variant = 'rectangular',
  className = '' 
}: { 
  variant?: 'rectangular' | 'circular' | 'text';
  className?: string;
}) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';
  
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
}

/**
 * 卡片骨架屏
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <SkeletonLoader variant="circular" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" className="w-3/4" />
          <SkeletonLoader variant="text" className="w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLoader variant="text" />
        <SkeletonLoader variant="text" />
        <SkeletonLoader variant="text" className="w-2/3" />
      </div>
    </div>
  );
}

/**
 * 列表骨架屏
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * 游戏内容骨架屏
 * 用于游戏主界面加载时的过渡
 */
export function GameContentSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Top bar skeleton */}
      <div className="flex justify-between items-center mb-4">
        <SkeletonLoader variant="text" className="w-24 h-8" />
        <SkeletonLoader variant="rectangular" className="w-20 h-8" />
      </div>
      
      {/* Main area skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * 加载步骤指示器
 */
export function LoadingProgress({ 
  steps, 
  currentStep 
}: { 
  steps: string[]; 
  currentStep: number 
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                index < currentStep 
                  ? 'bg-pink-500 text-white' 
                  : index === currentStep 
                    ? 'bg-pink-200 text-pink-600 animate-pulse' 
                    : 'bg-gray-200 text-gray-400'
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className={`text-xs mt-1 hidden sm:block ${index <= currentStep ? 'text-pink-500' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div 
              className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                index < currentStep ? 'bg-pink-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default SkeletonLoader;
