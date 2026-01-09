'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useGame } from './GameProvider';
import { useGameLoop } from '@/hooks/useGameLoop';
import { GAME_CONSTANTS } from '@/data/initialState';

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
  onDayEnd,
  onNewDay,
}: GameLoopProps) {
  const { state, dispatch } = useGame();
  const hasTriggeredEndDayRef = useRef(false);
  const prevTimeRef = useRef(state.time);
  
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
   * 处理日结
   * Requirements: 3.3
   */
  const handleEndDay = useCallback(() => {
    dispatch({ type: 'END_DAY' });
    onDayEnd?.();
  }, [dispatch, onDayEnd]);

  /**
   * 开始新一天
   */
  const startNewDay = useCallback(() => {
    dispatch({ type: 'START_NEW_DAY' });
    hasTriggeredEndDayRef.current = false;
    resetTimers();
    onNewDay?.();
  }, [dispatch, resetTimers, onNewDay]);

  /**
   * 监听营业时间结束，自动触发日结
   * 当时间达到或超过营业结束时间时触发
   * Requirements: 3.3
   */
  useEffect(() => {
    // 检查是否应该触发日结：
    // 1. 时间达到或超过营业结束时间
    // 2. 仍在营业时间状态（还没触发过日结）
    // 3. 还没有触发过日结
    // 4. 时间确实发生了变化（避免初始化时触发）
    const timeReachedEnd = state.time >= GAME_CONSTANTS.BUSINESS_END_TIME;
    const stillInBusinessHours = state.isBusinessHours;
    const notYetTriggered = !hasTriggeredEndDayRef.current;
    const timeChanged = prevTimeRef.current !== state.time;
    
    prevTimeRef.current = state.time;
    
    if (timeReachedEnd && stillInBusinessHours && notYetTriggered && timeChanged) {
      hasTriggeredEndDayRef.current = true;
      // 使用 setTimeout 延迟调用，避免在 effect 中直接触发状态更新
      const timeoutId = setTimeout(() => {
        handleEndDay();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [state.time, state.isBusinessHours, handleEndDay]);

  /**
   * 当新的一天开始时重置日结标志
   */
  useEffect(() => {
    // 当 isBusinessHours 变为 true 且时间是营业开始时间时，重置标志
    if (state.isBusinessHours && state.time === GAME_CONSTANTS.BUSINESS_START_TIME) {
      hasTriggeredEndDayRef.current = false;
    }
  }, [state.isBusinessHours, state.time]);

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

  // 导出 startNewDay 供外部使用（通过 useGameLoopControls）
  // 此组件不渲染任何 UI，只处理游戏逻辑
  void startNewDay; // 标记为已使用，实际通过 useGameLoopControls 暴露
  
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
