'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GameState, GameAction, Customer, Maid } from '@/types';
import { GAME_CONSTANTS } from '@/data/initialState';
import { generateCustomer, generateOrder, updatePatience, shouldCustomerLeave, handlePatienceTimeout } from '@/systems/customerSystem';
import { updateMaidStamina, calculateEfficiency } from '@/systems/maidSystem';
import { checkAchievements } from '@/systems/achievementSystem';

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
  const { speedMultiplier = 1, tickInterval = 1000 } = config;
  
  // 使用 ref 存储最新的 state 和 config 以避免闭包问题
  const stateRef = useRef(state);
  const configRef = useRef({ speedMultiplier, tickInterval });
  const dispatchRef = useRef(dispatch);
  
  // 顾客生成时间追踪
  const lastCustomerSpawnRef = useRef<number>(0);

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

  /**
   * 处理时间推进
   * Requirements: 3.1, 3.2
   */
  const handleTimeTick = useCallback(() => {
    dispatchRef.current({ type: 'TICK', deltaTime: GAME_CONSTANTS.TIME_INCREMENT });
  }, []);

  /**
   * 处理顾客生成
   */
  const handleCustomerSpawn = useCallback((currentState: GameState) => {
    // 检查座位是否已满
    const occupiedSeats = currentState.customers.filter(
      c => c.status !== 'leaving'
    ).length;
    
    if (occupiedSeats >= currentState.facility.maxSeats) {
      return;
    }
    
    // 生成新顾客
    const newCustomer = generateCustomer(currentState.reputation, currentState.season);
    
    // 为顾客生成订单
    const order = generateOrder(newCustomer, currentState.menuItems, currentState.season);
    
    // 分配座位
    const seatId = `seat_${occupiedSeats + 1}`;
    
    const customerWithOrder: Customer = {
      ...newCustomer,
      order,
      seatId,
      status: 'seated',
    };
    
    dispatchRef.current({ type: 'SPAWN_CUSTOMER', customer: customerWithOrder });
  }, []);

  /**
   * 更新女仆状态
   */
  const handleMaidUpdates = useCallback((currentState: GameState, deltaMinutes: number) => {
    currentState.maids.forEach((maid: Maid) => {
      const updatedMaid = updateMaidStamina(maid, deltaMinutes);
      
      if (updatedMaid.stamina !== maid.stamina) {
        dispatchRef.current({
          type: 'UPDATE_MAID',
          maidId: maid.id,
          updates: { stamina: updatedMaid.stamina },
        });
      }
    });
  }, []);

  /**
   * 处理顾客耐心更新
   */
  const handleCustomerPatience = useCallback((currentState: GameState, deltaMinutes: number) => {
    currentState.customers.forEach((customer: Customer) => {
      if (customer.status === 'leaving' || customer.status === 'paying') {
        return;
      }
      
      const updatedCustomer = updatePatience(customer, deltaMinutes);
      
      if (shouldCustomerLeave(updatedCustomer)) {
        const { customer: leavingCustomer, reputationPenalty } = handlePatienceTimeout(updatedCustomer);
        
        dispatchRef.current({
          type: 'UPDATE_CUSTOMER',
          customerId: customer.id,
          updates: {
            patience: leavingCustomer.patience,
            satisfaction: leavingCustomer.satisfaction,
            status: leavingCustomer.status,
          },
        });
        
        dispatchRef.current({
          type: 'ADD_NOTIFICATION',
          notification: {
            id: `patience_timeout_${customer.id}`,
            type: 'warning',
            message: `${customer.name} 因等待太久而离开了，声望 -${reputationPenalty}`,
            timestamp: Date.now(),
          },
        });
        
        setTimeout(() => {
          dispatchRef.current({ type: 'REMOVE_CUSTOMER', customerId: customer.id });
        }, 2000);
      } else if (updatedCustomer.patience !== customer.patience) {
        dispatchRef.current({
          type: 'UPDATE_CUSTOMER',
          customerId: customer.id,
          updates: { patience: updatedCustomer.patience },
        });
      }
    });
  }, []);

  /**
   * 自动分配女仆服务客人
   * 找到空闲的女仆并分配给等待服务的客人
   */
  const handleAutoAssignMaids = useCallback((currentState: GameState) => {
    // 找到需要服务的客人（刚入座，等待女仆来点餐）
    const waitingCustomers = currentState.customers.filter(
      (c: Customer) => c.status === 'seated'
    );
    
    if (waitingCustomers.length === 0) {
      return;
    }
    
    // 找到空闲的女仆（不在休息、没有正在服务的客人、体力足够）
    const availableMaids = currentState.maids.filter(
      (m: Maid) => 
        m.role !== 'resting' && 
        !m.status.isWorking && 
        m.status.servingCustomerId === null &&
        m.stamina >= 10 // 体力至少10%才能工作
    );
    
    if (availableMaids.length === 0) {
      return;
    }
    
    // 按效率排序女仆（效率高的优先）
    const sortedMaids = [...availableMaids].sort((a, b) => {
      return calculateEfficiency(b) - calculateEfficiency(a);
    });
    
    // 按耐心排序客人（耐心低的优先服务）
    const sortedCustomers = [...waitingCustomers].sort((a, b) => {
      return a.patience - b.patience;
    });
    
    // 分配女仆服务客人
    const assignCount = Math.min(sortedMaids.length, sortedCustomers.length);
    for (let i = 0; i < assignCount; i++) {
      const maid = sortedMaids[i];
      const customer = sortedCustomers[i];
      
      dispatchRef.current({
        type: 'SERVE_CUSTOMER',
        maidId: maid.id,
        customerId: customer.id,
      });
    }
  }, []);

  /**
   * 检查并解锁成就
   */
  const handleAchievementCheck = useCallback((currentState: GameState) => {
    const unlockedIds = checkAchievements(currentState.statistics, currentState.achievements);
    
    for (const achievementId of unlockedIds) {
      const achievement = currentState.achievements.find(a => a.id === achievementId);
      if (achievement) {
        dispatchRef.current({
          type: 'UNLOCK_ACHIEVEMENT',
          achievementId,
        });
        
        dispatchRef.current({
          type: 'ADD_NOTIFICATION',
          notification: {
            id: `achievement_${achievementId}_${Date.now()}`,
            type: 'achievement',
            message: `🏆 成就解锁：${achievement.name}！奖励 ${achievement.reward} 金币`,
            timestamp: Date.now(),
          },
        });
      }
    }
  }, []);

  /**
   * 重置循环计时器
   */
  const resetTimers = useCallback(() => {
    lastCustomerSpawnRef.current = 0;
  }, []);

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
        lastCustomerSpawnRef.current = currentTime;
      }

      const currentState = stateRef.current;
      const { speedMultiplier: speed, tickInterval: interval } = configRef.current;
      
      // 计算时间差
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // 只有在未暂停且在营业时间时才执行游戏逻辑
      if (!currentState.isPaused && currentState.isBusinessHours) {
        // 累计时间（考虑速度倍率）
        accumulated += deltaTime * speed;
        
        // 当累计时间达到 tick 间隔时，执行游戏逻辑
        if (accumulated >= interval) {
          const tickCount = Math.floor(accumulated / interval);
          accumulated %= interval;
          
          // 执行 tick 次数的游戏逻辑
          for (let i = 0; i < tickCount; i++) {
            // 时间推进
            handleTimeTick();
            
            // 更新女仆状态
            handleMaidUpdates(currentState, GAME_CONSTANTS.TIME_INCREMENT);
            
            // 更新顾客耐心
            handleCustomerPatience(currentState, GAME_CONSTANTS.TIME_INCREMENT);
            
            // 自动分配女仆服务客人
            handleAutoAssignMaids(stateRef.current);
            
            // 检查成就
            handleAchievementCheck(stateRef.current);
          }
        }
        
        // 顾客生成逻辑（独立于 tick）
        const timeSinceLastSpawn = currentTime - lastCustomerSpawnRef.current;
        const spawnInterval = getCustomerSpawnInterval(currentState);
        
        if (timeSinceLastSpawn >= spawnInterval) {
          handleCustomerSpawn(currentState);
          lastCustomerSpawnRef.current = currentTime;
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
  }, [handleTimeTick, handleMaidUpdates, handleCustomerPatience, handleAutoAssignMaids, handleAchievementCheck, handleCustomerSpawn]);

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

/**
 * 计算顾客生成间隔
 * 基于声望和咖啡厅等级
 */
function getCustomerSpawnInterval(state: GameState): number {
  // 基础间隔 15 秒
  const baseInterval = 15000;
  
  // 声望影响（声望越高，间隔越短）
  const reputationModifier = 1 - (state.reputation / 100) * 0.4;
  
  // 咖啡厅等级影响
  const levelModifier = 1 - ((state.facility.cafeLevel - 1) / 9) * 0.3;
  
  // 最终间隔，最低 5 秒
  return Math.max(baseInterval * reputationModifier * levelModifier, 5000);
}

export default useGameLoop;
