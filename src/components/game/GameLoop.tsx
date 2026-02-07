'use client';

import { useEffect, useCallback } from 'react';
import { useGame } from './GameProvider';
import { useGameLoop } from '@/hooks/useGameLoop';

/**
 * 游戏循环组件配置
 */
interface GameLoopProps {
  /** 游戏速度倍率 */
  speedMultiplier?: number;
  /** 每个游戏tick对应的真实毫秒数 */
  tickInterval?: number;
  /** 日结回调 */
  onDayEnd?: () => void;
  /** 新一天开始回调 */
  onNewDay?: () => void;
}

/**
 * 游戏循环组件
 * 集成 useGameLoop hook，管理游戏暂停/继续，处理日结逻辑
 * Requirements: 3.3
 */
export function GameLoop({
  speedMultiplier = 1,
  tickInterval = 1000,
}: GameLoopProps) {
  const { state, dispatch } = useGame();
  
  // 使用游戏循环 hook
  const { resetTimers } = useGameLoop(state, dispatch, {
    speedMultiplier,
    tickInterval,
  });

  /**
   * 切换暂停状态
   */
  const togglePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  }, [dispatch]);

  /**
   * 添加键盘快捷键支持
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 空格键切换暂停
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  void resetTimers;
  
  return null;
}

/**
 * 游戏循环控制器 Hook
 * 提供给其他组件使用的控制接口
 */
export function useGameLoopControls() {
  const { state, dispatch } = useGame();

  const togglePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  }, [dispatch]);

  const endDay = useCallback(() => {
    dispatch({ type: 'END_DAY' });
  }, [dispatch]);

  const startNewDay = useCallback(() => {
    dispatch({ type: 'START_NEW_DAY' });
  }, [dispatch]);

  return {
    isPaused: state.isPaused,
    isBusinessHours: state.isBusinessHours,
    currentTime: state.time,
    currentDay: state.day,
    togglePause,
    endDay,
    startNewDay,
  };
}

export default GameLoop;
