import { Achievement, GameStatistics, GameAction } from '@/types';

/**
 * 成就系统 - 负责成就检查、解锁和统计更新
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

/**
 * 检查成就是否满足解锁条件
 * @param statistics 当前游戏统计数据
 * @param achievements 成就列表
 * @returns 新解锁的成就ID列表
 */
export function checkAchievements(
  statistics: GameStatistics,
  achievements: Achievement[]
): string[] {
  const newlyUnlocked: string[] = [];

  for (const achievement of achievements) {
    // 跳过已解锁的成就
    if (achievement.unlocked) {
      continue;
    }

    const { type, target } = achievement.condition;
    let currentValue = 0;

    // 根据条件类型获取当前值
    switch (type) {
      case 'totalCustomersServed':
        currentValue = statistics.totalCustomersServed;
        break;
      case 'totalRevenue':
        currentValue = statistics.totalRevenue;
        break;
      case 'totalDaysPlayed':
        currentValue = statistics.totalDaysPlayed;
        break;
      case 'totalTipsEarned':
        currentValue = statistics.totalTipsEarned;
        break;
      case 'perfectServicesCount':
        currentValue = statistics.perfectServicesCount;
        break;
      case 'maidsHired':
        currentValue = statistics.maidsHired;
        break;
      default:
        continue;
    }

    // 检查是否达到目标
    if (currentValue >= target) {
      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
}

/**
 * 解锁指定成就
 * @param achievements 成就列表
 * @param achievementId 要解锁的成就ID
 * @returns 更新后的成就列表和奖励金额
 */
export function unlockAchievement(
  achievements: Achievement[],
  achievementId: string
): { achievements: Achievement[]; reward: number } {
  let reward = 0;

  const updatedAchievements = achievements.map((achievement) => {
    if (achievement.id === achievementId && !achievement.unlocked) {
      reward = achievement.reward;
      return {
        ...achievement,
        unlocked: true,
        unlockedDate: Date.now(),
      };
    }
    return achievement;
  });

  return { achievements: updatedAchievements, reward };
}

/**
 * 根据游戏动作更新统计数据
 * @param statistics 当前统计数据
 * @param action 游戏动作
 * @returns 更新后的统计数据
 */
export function updateStatistics(
  statistics: GameStatistics,
  action: GameAction
): GameStatistics {
  switch (action.type) {
    case 'REMOVE_CUSTOMER':
      // 顾客离开时增加服务计数（假设成功服务）
      return {
        ...statistics,
        totalCustomersServed: statistics.totalCustomersServed + 1,
      };

    case 'ADD_REVENUE':
      return {
        ...statistics,
        totalRevenue: statistics.totalRevenue + action.amount,
      };

    case 'HIRE_MAID':
      return {
        ...statistics,
        maidsHired: statistics.maidsHired + 1,
      };

    case 'START_NEW_DAY':
      return {
        ...statistics,
        totalDaysPlayed: statistics.totalDaysPlayed + 1,
      };

    case 'UPDATE_STATISTICS':
      return {
        ...statistics,
        ...action.updates,
      };

    default:
      return statistics;
  }
}

/**
 * 记录完美服务
 * @param statistics 当前统计数据
 * @returns 更新后的统计数据
 */
export function recordPerfectService(statistics: GameStatistics): GameStatistics {
  return {
    ...statistics,
    perfectServicesCount: statistics.perfectServicesCount + 1,
  };
}

/**
 * 记录小费
 * @param statistics 当前统计数据
 * @param tipAmount 小费金额
 * @returns 更新后的统计数据
 */
export function recordTip(
  statistics: GameStatistics,
  tipAmount: number
): GameStatistics {
  return {
    ...statistics,
    totalTipsEarned: statistics.totalTipsEarned + tipAmount,
  };
}

/**
 * 获取成就进度
 * @param achievement 成就
 * @param statistics 统计数据
 * @returns 进度百分比 (0-100)
 */
export function getAchievementProgress(
  achievement: Achievement,
  statistics: GameStatistics
): number {
  if (achievement.unlocked) {
    return 100;
  }

  const { type, target } = achievement.condition;
  let currentValue = 0;

  switch (type) {
    case 'totalCustomersServed':
      currentValue = statistics.totalCustomersServed;
      break;
    case 'totalRevenue':
      currentValue = statistics.totalRevenue;
      break;
    case 'totalDaysPlayed':
      currentValue = statistics.totalDaysPlayed;
      break;
    case 'totalTipsEarned':
      currentValue = statistics.totalTipsEarned;
      break;
    case 'perfectServicesCount':
      currentValue = statistics.perfectServicesCount;
      break;
    case 'maidsHired':
      currentValue = statistics.maidsHired;
      break;
    default:
      return 0;
  }

  return Math.min(100, Math.floor((currentValue / target) * 100));
}

/**
 * 获取已解锁成就数量
 * @param achievements 成就列表
 * @returns 已解锁数量
 */
export function getUnlockedCount(achievements: Achievement[]): number {
  return achievements.filter((a) => a.unlocked).length;
}

/**
 * 获取总奖励金额
 * @param achievements 成就列表
 * @returns 已获得的总奖励
 */
export function getTotalRewardsEarned(achievements: Achievement[]): number {
  return achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.reward, 0);
}
