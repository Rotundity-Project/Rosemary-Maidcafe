/**
 * 共享工具函数
 * 集中管理项目中重复使用的辅助函数
 */

/**
 * 生成唯一ID
 */
let idCounter = 0;
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${++idCounter}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 从数组中随机选择一个元素
 */
export function randomChoice<T>(arr: T[]): T {
  if (!arr || arr.length === 0) {
    throw new Error('randomChoice: array is empty');
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 生成指定范围内的随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 将值限制在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 计算数组总和
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * 计算数组平均值
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

/**
 * 按权重随机选择
 * @param items 项目数组
 * @param weights 权重数组，长度必须与items相同
 * @returns 选中的项目索引
 */
export function weightedRandom<T>(items: T[], weights: number[]): number {
  if (items.length !== weights.length) {
    throw new Error('items and weights must have the same length');
  }
  
  const totalWeight = sum(weights);
  if (totalWeight <= 0) {
    return 0;
  }
  
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return i;
    }
  }
  
  return items.length - 1;
}
