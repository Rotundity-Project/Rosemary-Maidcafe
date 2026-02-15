import { Maid, MaidStats, MaidPersonality, MaidRole } from '@/types';
import {
  maidFirstNames,
  maidLastNames,
  personalityStatBonuses,
} from '@/data/maidNames';
import { getRandomMaidImage } from '@/data/maidImages';
import { generateId, randomChoice, randomInt, clamp } from '@/utils';

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
      isResting: false,
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
 * 优化：减少中间计算步骤，提升性能
 * Requirements: 2.4
 */
export function calculateEfficiency(maid: Maid): number {
  // 参数验证
  if (!maid || typeof maid.stats?.charm !== 'number' || typeof maid.stats?.skill !== 'number' || 
      typeof maid.stats?.speed !== 'number' || typeof maid.mood !== 'number' || typeof maid.stamina !== 'number') {
    return 0;
  }
  
  // 提取属性值并归一化 (0-100范围)
  const charm = Math.max(0, Math.min(100, maid.stats.charm));
  const skill = Math.max(0, Math.min(100, maid.stats.skill));
  const speed = Math.max(0, Math.min(100, maid.stats.speed));
  const mood = Math.max(0, Math.min(100, maid.mood));
  
  // 基础效率 = (魅力 + 技能 + 速度) / 3
  const baseEfficiency = (charm + skill + speed) / 3;
  
  // 心情影响效率 (心情100时为1.0，心情0时为0.5)
  const moodModifier = 0.5 + (mood / 200);
  
  // 计算效率并应用体力惩罚
  // 体力低于20%时效率减半 (Requirements: 2.4)
  const staminaMultiplier = maid.stamina < 20 ? 0.5 : 1.0;
  const efficiency = baseEfficiency * moodModifier * staminaMultiplier;
  
  return Math.max(0, Math.min(100, efficiency));
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
  
  if (maid.status.isResting) {
    // 休息时每分钟恢复2点体力
    newStamina = maid.stamina + (deltaMinutes * 2);
  } else if (maid.status.isWorking) {
    // 工作时每分钟消耗0.5点体力
    newStamina = maid.stamina - (deltaMinutes * 0.5);
  } else {
    // 空闲时每分钟恢复0.5点体力
    newStamina = maid.stamina + (deltaMinutes * 0.5);
  }
  
  return {
    ...maid,
    stamina: clamp(newStamina, 0, 100),
  };
}

/**
 * 更新女仆心情
 * 工作时心情可能下降，休息时心情恢复
 * @param maid 女仆
 * @param deltaMinutes 经过的时间（分钟）
 * @returns 更新后的女仆
 */
export function updateMaidMood(maid: Maid, deltaMinutes: number): Maid {
  let newMood = maid.mood;
  
  if (maid.status.isResting) {
    // 休息时心情恢复较快，每分钟恢复1点
    newMood = maid.mood + (deltaMinutes * 1);
  } else if (maid.status.isWorking) {
    // 工作时心情缓慢下降，每分钟下降0.2点
    newMood = maid.mood - (deltaMinutes * 0.2);
  } else {
    // 空闲时心情略微恢复，每分钟恢复0.5点
    newMood = maid.mood + (deltaMinutes * 0.5);
  }
  
  return {
    ...maid,
    mood: clamp(newMood, 0, 100),
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
 * 根据角色获取效率加成
 * 不同角色在不同服务类型时有额外加成
 */
export function getRoleEfficiencyBonus(maid: Maid, customerType: string): number {
  const roleBonuses: Record<string, Record<string, number>> = {
    greeter: { regular: 1.1, vip: 1.15 },
    server: { regular: 1.1, group: 1.15 },
    barista: { regular: 1.1, critic: 1.1 },
    entertainer: { vip: 1.15, critic: 1.2 },
  };
  
  const roleBonus = roleBonuses[maid.role]?.[customerType] ?? 1.0;
  return roleBonus;
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
      isWorking: true,
      isResting: false,
      currentTask: maid.status.currentTask,
      servingCustomerId: maid.status.servingCustomerId,
    },
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

/**
 * 开始服务
 * 初始化服务进度
 */
export function startService(maid: Maid, customerId: string): Maid {
  return {
    ...maid,
    status: {
      ...maid.status,
      isWorking: true,
      currentTask: 'serving',
      servingCustomerId: customerId,
    },
  };
}

/**
 * 更新服务进度
 * 基于女仆速度计算进度增量
 * @param maid 女仆
 * @param deltaMinutes 经过的时间(分钟)
 * @returns 新的进度值(0-100)
 */
export function updateServiceProgress(maid: Maid, currentProgress: number, deltaMinutes: number): number {
  const speed = maid.stats.speed;
  
  // 基础进度增量: 速度值 * 0.5 * 时间(分钟)
  const progressIncrement = speed * 0.5 * deltaMinutes;
  
  // 体力低于50%时效率降低
  const staminaMultiplier = maid.stamina < 50 ? 0.7 : 1.0;
  
  const newProgress = currentProgress + (progressIncrement * staminaMultiplier);
  
  return Math.min(newProgress, 100);
}

/**
 * 计算服务所需时间(分钟)
 * 基于女仆速度计算
 */
export function getServiceDuration(maid: Maid): number {
  const speed = maid.stats.speed;
  const staminaMultiplier = maid.stamina < 50 ? 0.7 : 1.0;
  
  // 基础时间: 100 / (速度 * 0.5 * 体力倍率)
  return 100 / (speed * 0.5 * staminaMultiplier);
}
