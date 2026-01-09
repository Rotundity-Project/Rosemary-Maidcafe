import { GameEvent, GameState, Season, EventEffect } from '@/types';
import { positiveEvents, negativeEvents, seasonalEvents } from '@/data/events';

/**
 * 事件系统 - 处理游戏中的随机事件、季节事件和事件效果
 */

// 事件触发概率配置
const EVENT_TRIGGER_CHANCE = 0.15; // 15% 基础触发概率
const POSITIVE_EVENT_WEIGHT = 0.6; // 60% 正面事件权重
const SEASONAL_EVENT_CHANCE = 0.25; // 25% 季节事件触发概率

/**
 * 随机事件判定 - 根据天数和季节决定是否触发事件
 * @param day 当前天数
 * @param season 当前季节
 * @returns 触发的事件，如果没有触发则返回 null
 */
export function rollForEvent(day: number, season: Season): GameEvent | null {
  // 基础触发判定
  const roll = Math.random();
  if (roll > EVENT_TRIGGER_CHANCE) {
    return null;
  }

  // 判断是否触发季节事件
  const seasonalRoll = Math.random();
  if (seasonalRoll < SEASONAL_EVENT_CHANCE) {
    const seasonEvents = getSeasonalEvents(season);
    if (seasonEvents.length > 0) {
      const randomIndex = Math.floor(Math.random() * seasonEvents.length);
      return seasonEvents[randomIndex];
    }
  }

  // 判断触发正面还是负面事件
  const eventTypeRoll = Math.random();
  if (eventTypeRoll < POSITIVE_EVENT_WEIGHT) {
    // 触发正面事件
    const randomIndex = Math.floor(Math.random() * positiveEvents.length);
    return positiveEvents[randomIndex];
  } else {
    // 触发负面事件
    const randomIndex = Math.floor(Math.random() * negativeEvents.length);
    return negativeEvents[randomIndex];
  }
}

/**
 * 获取指定季节的事件列表
 * @param season 季节
 * @returns 该季节的事件数组
 */
export function getSeasonalEvents(season: Season): GameEvent[] {
  return seasonalEvents[season] || [];
}

/**
 * 应用事件效果到游戏状态
 * @param state 当前游戏状态
 * @param event 要应用的事件
 * @returns 应用效果后的新游戏状态
 */
export function applyEventEffects(state: GameState, event: GameEvent): GameState {
  let newState = { ...state };

  // 将事件添加到活动事件列表
  newState.activeEvents = [...state.activeEvents, event];
  newState.eventHistory = [...state.eventHistory, event];

  // 应用即时效果（非乘数效果）
  for (const effect of event.effects) {
    if (!effect.isMultiplier) {
      newState = applyImmediateEffect(newState, effect);
    }
  }

  return newState;
}

/**
 * 应用即时效果（非乘数效果）
 */
function applyImmediateEffect(state: GameState, effect: EventEffect): GameState {
  const newState = { ...state };

  switch (effect.target) {
    case 'reputation':
      newState.reputation = Math.max(0, Math.min(100, state.reputation + effect.modifier));
      break;
    case 'revenue':
      // 即时收入效果直接加到金币
      if (!effect.isMultiplier) {
        newState.finance = {
          ...state.finance,
          gold: state.finance.gold + effect.modifier,
          dailyRevenue: state.finance.dailyRevenue + effect.modifier,
        };
      }
      break;
    // customers 和 satisfaction 的即时效果通常不直接应用
    // 它们作为乘数在其他系统中使用
  }

  return newState;
}

/**
 * 移除过期的事件
 * @param events 当前活动事件列表
 * @param currentTime 当前游戏时间（分钟）
 * @param dayStartTime 当天开始时间（分钟，通常是540即9:00AM）
 * @returns 过滤后的活动事件列表
 */
export function removeExpiredEvents(
  events: GameEvent[],
  currentTime: number,
  dayStartTime: number = 540
): GameEvent[] {
  // 计算从当天开始经过的时间
  const elapsedTime = currentTime - dayStartTime;

  return events.filter((event) => {
    // 事件持续时间内保留
    // 注意：这里假设事件在当天开始时触发
    // 如果需要更精确的时间追踪，需要在事件中记录开始时间
    return elapsedTime < event.duration;
  });
}

/**
 * 获取当前活动事件的效果乘数
 * @param events 活动事件列表
 * @param target 效果目标类型
 * @returns 累积的乘数值
 */
export function getActiveEventMultiplier(
  events: GameEvent[],
  target: 'revenue' | 'customers' | 'satisfaction' | 'reputation'
): number {
  let multiplier = 1.0;

  for (const event of events) {
    for (const effect of event.effects) {
      if (effect.target === target && effect.isMultiplier) {
        multiplier *= effect.modifier;
      }
    }
  }

  return multiplier;
}

/**
 * 获取当前活动事件的即时加成
 * @param events 活动事件列表
 * @param target 效果目标类型
 * @returns 累积的加成值
 */
export function getActiveEventBonus(
  events: GameEvent[],
  target: 'revenue' | 'customers' | 'satisfaction' | 'reputation'
): number {
  let bonus = 0;

  for (const event of events) {
    for (const effect of event.effects) {
      if (effect.target === target && !effect.isMultiplier) {
        bonus += effect.modifier;
      }
    }
  }

  return bonus;
}

/**
 * 检查是否有特定类型的事件正在活动
 * @param events 活动事件列表
 * @param eventId 事件ID
 * @returns 是否存在该事件
 */
export function isEventActive(events: GameEvent[], eventId: string): boolean {
  return events.some((event) => event.id === eventId);
}

/**
 * 获取所有可能的事件（用于调试或显示）
 * @returns 所有事件的数组
 */
export function getAllEvents(): GameEvent[] {
  const allSeasonalEvents = Object.values(seasonalEvents).flat();
  return [...positiveEvents, ...negativeEvents, ...allSeasonalEvents];
}

/**
 * 根据事件ID获取事件
 * @param eventId 事件ID
 * @returns 事件对象，如果未找到则返回 undefined
 */
export function getEventById(eventId: string): GameEvent | undefined {
  const allEvents = getAllEvents();
  return allEvents.find((event) => event.id === eventId);
}
