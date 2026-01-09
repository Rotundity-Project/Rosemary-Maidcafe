import { Maid, MaidStats, MaidPersonality, MaidRole } from '@/types';
import {
  maidFirstNames,
  maidLastNames,
  personalityStatBonuses,
} from '@/data/maidNames';
import { getRandomMaidImage } from '@/data/maidImages';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `maid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 从数组中随机选择一个元素
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 生成指定范围内的随机整数
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 将值限制在指定范围内
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 生成随机女仆
 * @param usedImages 已使用的图片路径数组，用于避免重复
 * Requirements: 1.2, 1.3, 2.1, 2.2
 */
export function generateRandomMaid(usedImages: string[] = []): Maid {
  const personalities: MaidPersonality[] = ['cheerful', 'cool', 'shy', 'energetic', 'elegant'];
  const personality = randomChoice(personalities);
  const bonuses = personalityStatBonuses[personality];
  
  // 基础属性在20-50之间随机，加上性格加成
  const baseStats: MaidStats = {
    charm: clamp(randomInt(20, 50) + bonuses.charm, 1, 100),
    skill: clamp(randomInt(20, 50) + bonuses.skill, 1, 100),
    stamina: clamp(randomInt(20, 50) + bonuses.stamina, 1, 100),
    speed: clamp(randomInt(20, 50) + bonuses.speed, 1, 100),
  };

  const firstName = randomChoice(maidFirstNames);
  const lastName = randomChoice(maidLastNames);
  const name = `${lastName}${firstName}`;
  
  const maid: Maid = {
    id: generateId(),
    name,
    avatar: getRandomMaidImage(usedImages),
    personality,
    stats: baseStats,
    experience: 0,
    level: 1,
    role: 'server', // 默认角色
    status: {
      isWorking: false,
      currentTask: null,
      servingCustomerId: null,
    },
    mood: randomInt(70, 100),
    stamina: 100, // 新雇佣的女仆体力满
    hireDate: Date.now(),
  };

  return maid;
}


/**
 * 计算女仆服务效率
 * 基于女仆的属性计算，体力低于20%时效率减半
 * Requirements: 2.4
 */
export function calculateEfficiency(maid: Maid): number {
  // 基础效率 = (魅力 + 技能 + 速度) / 3
  const baseEfficiency = (maid.stats.charm + maid.stats.skill + maid.stats.speed) / 3;
  
  // 心情影响效率 (心情100时为1.0，心情0时为0.5)
  const moodModifier = 0.5 + (maid.mood / 200);
  
  // 计算效率
  let efficiency = baseEfficiency * moodModifier;
  
  // 体力低于20%时效率减半 (Requirements: 2.4)
  if (maid.stamina < 20) {
    efficiency *= 0.5;
  }
  
  return clamp(efficiency, 0, 100);
}

/**
 * 计算经验获取量
 * 基于顾客满意度计算
 * Requirements: 2.5
 */
export function calculateExperienceGain(satisfaction: number): number {
  // 满意度0-100，经验获取5-25
  // 满意度越高，经验越多
  const baseExp = 5;
  const bonusExp = Math.floor((satisfaction / 100) * 20);
  return baseExp + bonusExp;
}

/**
 * 获取升级所需经验
 * 每级需要 level * 100 经验
 */
export function getExperienceForLevel(level: number): number {
  return level * 100;
}

/**
 * 检查并处理升级
 * Requirements: 2.5, 2.6
 */
export function checkLevelUp(maid: Maid): Maid {
  const maxLevel = 50;
  const updatedMaid = { ...maid };
  
  // 检查是否可以升级
  while (
    updatedMaid.level < maxLevel &&
    updatedMaid.experience >= getExperienceForLevel(updatedMaid.level)
  ) {
    // 扣除升级所需经验
    updatedMaid.experience -= getExperienceForLevel(updatedMaid.level);
    updatedMaid.level += 1;
    
    // 升级时提升属性 (每项+2，但不超过100)
    updatedMaid.stats = {
      charm: clamp(updatedMaid.stats.charm + 2, 1, 100),
      skill: clamp(updatedMaid.stats.skill + 2, 1, 100),
      stamina: clamp(updatedMaid.stats.stamina + 2, 1, 100),
      speed: clamp(updatedMaid.stats.speed + 2, 1, 100),
    };
  }
  
  return updatedMaid;
}

/**
 * 更新女仆体力
 * 工作时消耗体力，休息或空闲时恢复体力
 * Requirements: 2.8
 */
export function updateMaidStamina(maid: Maid, deltaMinutes: number): Maid {
  let newStamina = maid.stamina;
  
  if (maid.role === 'resting') {
    // 休息角色时每分钟恢复2点体力
    newStamina = maid.stamina + (deltaMinutes * 2);
  } else if (maid.status.isWorking) {
    // 工作时每分钟消耗0.5点体力
    newStamina = maid.stamina - (deltaMinutes * 0.5);
  } else {
    // 空闲时（不工作也不是休息角色）每分钟恢复0.5点体力
    newStamina = maid.stamina + (deltaMinutes * 0.5);
  }
  
  return {
    ...maid,
    stamina: clamp(newStamina, 0, 100),
  };
}

/**
 * 获取咖啡厅等级对应的最大女仆数
 * Requirements: 2.9
 */
export function getMaxMaids(cafeLevel: number): number {
  // 等级1: 2名女仆
  // 每升一级增加1名
  // 等级10: 11名女仆
  return Math.min(2 + (cafeLevel - 1), 11);
}

/**
 * 检查是否可以雇佣更多女仆
 */
export function canHireMoreMaids(currentMaidCount: number, cafeLevel: number): boolean {
  return currentMaidCount < getMaxMaids(cafeLevel);
}

/**
 * 分配女仆角色
 * Requirements: 2.7
 */
export function assignRole(maid: Maid, role: MaidRole): Maid {
  return {
    ...maid,
    role,
    status: {
      ...maid.status,
      isWorking: role !== 'resting',
      currentTask: role === 'resting' ? null : maid.status.currentTask,
      servingCustomerId: role === 'resting' ? null : maid.status.servingCustomerId,
    },
  };
}

/**
 * 更新女仆心情
 */
export function updateMaidMood(maid: Maid, delta: number): Maid {
  return {
    ...maid,
    mood: clamp(maid.mood + delta, 0, 100),
  };
}

/**
 * 添加经验并检查升级
 */
export function addExperience(maid: Maid, experience: number): Maid {
  const updatedMaid = {
    ...maid,
    experience: maid.experience + experience,
  };
  return checkLevelUp(updatedMaid);
}
