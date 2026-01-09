/**
 * 随机数生成工具
 * 提供各种随机数生成和随机选择功能
 */

/**
 * 生成唯一ID
 * @param prefix ID前缀
 * @returns 唯一ID字符串
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 从数组中随机选择一个元素
 * @param arr 源数组
 * @returns 随机选择的元素
 */
export function randomChoice<T>(arr: readonly T[]): T {
  if (arr.length === 0) {
    throw new Error('Cannot select from empty array');
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 从数组中随机选择多个不重复的元素
 * @param arr 源数组
 * @param count 选择数量
 * @returns 随机选择的元素数组
 */
export function randomChoiceMultiple<T>(arr: readonly T[], count: number): T[] {
  if (count > arr.length) {
    throw new Error('Count exceeds array length');
  }
  
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 生成指定范围内的随机整数 [min, max]
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成指定范围内的随机浮点数 [min, max)
 * @param min 最小值（包含）
 * @param max 最大值（不包含）
 * @returns 随机浮点数
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * 根据概率返回布尔值
 * @param probability 概率 (0-1)
 * @returns 是否命中
 */
export function randomChance(probability: number): boolean {
  return Math.random() < probability;
}

/**
 * 根据权重随机选择
 * @param items 带权重的选项数组
 * @returns 选中的选项
 */
export function weightedRandom<T>(items: { item: T; weight: number }[]): T {
  if (items.length === 0) {
    throw new Error('Cannot select from empty array');
  }
  
  const totalWeight = items.reduce((sum, { weight }) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const { item, weight } of items) {
    random -= weight;
    if (random <= 0) {
      return item;
    }
  }
  
  // 兜底返回最后一个
  return items[items.length - 1].item;
}

/**
 * 打乱数组顺序 (Fisher-Yates shuffle)
 * @param arr 源数组
 * @returns 打乱后的新数组
 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
