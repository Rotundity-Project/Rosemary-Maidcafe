'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GameState, GameAction } from '@/types';

/**
 * 游戏循环配置
 */
interface GameLoopConfig {
  /** 游戏速度倍率 (1 = 正常速度) */
  speedMultiplier?: number;
  /** 每个游戏tick对应的真实毫秒数 */
  tickInterval?: number;
}

/**
 * 游戏循环 Hook
 * 使用 requestAnimationFrame 实现游戏循环
 * 简化版本 - 使用单一 effect 管理整个循环生命周期
 * Requirements: 3.1, 3.2, 3.4, 3.5
 */
export function useGameLoop(
  state: GameState,
  dispatch: React.Dispatch<GameAction>,
  config: GameLoopConfig = {}
) {
  const { speedMultiplier = 1, tickInterval = 2000 } = config;
  
  // 使用 ref 存储最新的 state 和 config 以避免闭包问题
  const stateRef = useRef(state);
  const configRef = useRef({ speedMultiplier, tickInterval });
  const dispatchRef = useRef(dispatch);

  // 更新 refs 以保持最新值
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    configRef.current = { speedMultiplier, tickInterval };
  }, [speedMultiplier, tickInterval]);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  const resetTimers = useCallback(() => {}, []);

  /**
   * 主游戏循环 effect
   * 简化逻辑：单一 effect 管理整个动画帧循环
   * 循环始终运行，但只在未暂停且在营业时间时执行游戏逻辑
   * Requirements: 3.1, 3.2, 3.4, 3.5
   */
  useEffect(() => {
    let frameId: number;
    let lastTime = 0;
    let accumulated = 0;

    const loop = (currentTime: number) => {
      // 初始化时间
      if (lastTime === 0) {
        lastTime = currentTime;
      }

      const currentState = stateRef.current;
      const { speedMultiplier: speed, tickInterval: interval } = configRef.current;
      
      // 计算时间差
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // 只有在未暂停且在营业时间时才执行游戏逻辑
      if (!currentState.isPaused && currentState.isBusinessHours) {
        // 累计时间（考虑速度倍率和游戏速度设置）
        accumulated += deltaTime * speed * currentState.gameSpeed;
        
        // 当累计时间达到 tick 间隔时，执行游戏逻辑
        if (accumulated >= interval) {
          const tickCount = Math.floor(accumulated / interval);
          accumulated %= interval;
          
          // 执行 tick 次数的游戏逻辑
          for (let i = 0; i < tickCount; i++) {
            dispatchRef.current({ type: 'TICK', deltaTime: interval });
          }
        }
      } else {
        // 暂停时重置累计时间，避免恢复时突然执行大量 tick
        accumulated = 0;
      }
      
      // 继续循环
      frameId = requestAnimationFrame(loop);
    };

    // 启动循环
    frameId = requestAnimationFrame(loop);

    // 清理函数
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  /**
   * 启动游戏循环（兼容旧接口）
   * 现在循环始终运行，此函数仅用于重置计时器
   */
  const startLoop = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  /**
   * 停止游戏循环（兼容旧接口）
   * 现在通过 isPaused 状态控制，此函数为空操作
   */
  const stopLoop = useCallback(() => {
    // 循环始终运行，通过 state.isPaused 控制是否执行逻辑
  }, []);

  return {
    startLoop,
    stopLoop,
    resetTimers,
  };
}

export default useGameLoop;
