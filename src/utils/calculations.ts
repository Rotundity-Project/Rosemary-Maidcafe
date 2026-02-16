/**
 * 通用计算函数
 * 提供游戏中常用的数学计算和数值处理功能
 * Requirements: 1.5, 5.6
 */

/**
 * 将值限制在指定范围内
 * @param value 输入值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 线性插值
 * @param start 起始值
 * @param end 结束值
 * @param t 插值因子 (0-1)
 * @returns 插值结果
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * 反向线性插值 - 计算值在范围内的位置
 * @param start 起始值
 * @param end 结束值
 * @param value 当前值
 * @returns 位置因子 (0-1)
 */
export function inverseLerp(start: number, end: number, value: number): number {
  if (start === end) return 0;
  return clamp((value - start) / (end - start), 0, 1);
}

/**
 * 将值从一个范围映射到另一个范围
 * @param value 输入值
 * @param inMin 输入范围最小值
 * @param inMax 输入范围最大值
 * @param outMin 输出范围最小值
 * @param outMax 输出范围最大值
 * @returns 映射后的值
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const t = inverseLerp(inMin, inMax, value);
  return lerp(outMin, outMax, t);
}

/**
 * 计算百分比
 * @param value 当前值
 * @param total 总值
 * @returns 百分比 (0-100)
 */
export function calculatePercent(value: number, total: number): number {
  if (total === 0) return 0;
  return clamp((value / total) * 100, 0, 100);
}

/**
 * 根据天数计算当前季节
 * 每30天为一个季节
 * @param day 当前天数
 * @returns 季节
 */
export function calculateSeason(day: number): 'spring' | 'summer' | 'autumn' | 'winter' {
  const seasonIndex = Math.floor((day - 1) / 30) % 4;
  const seasons: ('spring' | 'summer' | 'autumn' | 'winter')[] = ['spring', 'summer', 'autumn', 'winter'];
  return seasons[seasonIndex];
}

/**
 * 计算咖啡厅等级对应的最大座位数
 * 等级1: 4座位，每升一级增加2座位
 * @param cafeLevel 咖啡厅等级 (1-10)
 * @returns 最大座位数
 */
export function calculateMaxSeats(cafeLevel: number): number {
  return 4 + (clamp(cafeLevel, 1, 10) - 1) * 2;
}

/**
 * 计算升级咖啡厅所需金币
 * 优化：调整费用曲线，前期更容易，后期更有挑战
 * @param currentLevel 当前等级
 * @returns 升级所需金币
 */
export function calculateCafeUpgradeCost(currentLevel: number): number {
  // 基础费用400，每级增加600 (原500/500)
  return 400 + currentLevel * 600;
}

/**
 * 计算女仆升级所需经验
 * @param level 当前等级
 * @returns 升级所需经验
 */
export function calculateMaidExpRequired(level: number): number {
  return level * 100;
}

/**
 * 计算日常运营成本
 * 优化：降低基础支出，让经济更容易平衡
 * @param maidCount 女仆数量
 * @param cafeLevel 咖啡厅等级
 * @returns 日常运营成本
 */
export function calculateDailyOperatingCost(maidCount: number, cafeLevel: number): number {
  // 基础租金 = 等级 * 30 (原50)
  const rent = cafeLevel * 30;
  // 水电费 = 等级 * 15 (原20)
  const utilities = cafeLevel * 15;
  // 女仆工资 = 使用新的工资表
  const wages = maidCount * 15; // 使用平均工资
  
  return rent + utilities + wages;
}

/**
 * 计算声望变化
 * @param currentReputation 当前声望
 * @param delta 变化量
 * @returns 新声望值 (0-100)
 */
export function calculateReputationChange(currentReputation: number, delta: number): number {
  return clamp(currentReputation + delta, 0, 100);
}

/**
 * 计算价格范围
 * @param basePrice 基础价格
 * @returns 价格范围 { min, max }
 */
export function calculatePriceRange(basePrice: number): { min: number; max: number } {
  return {
    min: Math.floor(basePrice * 0.5),
    max: Math.floor(basePrice * 2.0),
  };
}

/**
 * 验证价格是否在有效范围内
 * @param price 价格
 * @param basePrice 基础价格
 * @returns 是否有效
 */
export function isValidPrice(price: number, basePrice: number): boolean {
  const range = calculatePriceRange(basePrice);
  return price >= range.min && price <= range.max;
}

/**
 * 计算装饰品满意度加成总和
 * @param decorations 装饰品列表
 * @returns 满意度加成总和
 */
export function calculateDecorationBonus(decorations: { satisfactionBonus: number; purchased: boolean }[]): number {
  return decorations
    .filter(d => d.purchased)
    .reduce((sum, d) => sum + d.satisfactionBonus, 0);
}

/**
 * 计算利润
 * @param revenue 收入
 * @param expenses 支出
 * @returns 利润
 */
export function calculateProfit(revenue: number, expenses: number): number {
  return revenue - expenses;
}

/**
 * 计算平均值
 * @param values 数值数组
 * @returns 平均值
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * 计算总和
 * @param values 数值数组
 * @returns 总和
 */
export function calculateSum(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0);
}

/**
 * 检查是否在营业时间内
 * 营业时间: 9:00 AM (540分钟) - 9:00 PM (1260分钟)
 * @param time 当前时间（分钟）
 * @returns 是否在营业时间内
 */
export function isBusinessHours(time: number): boolean {
  return time >= 540 && time < 1260;
}

/**
 * 计算剩余营业时间（分钟）
 * @param currentTime 当前时间（分钟）
 * @returns 剩余营业时间
 */
export function calculateRemainingBusinessTime(currentTime: number): number {
  const closingTime = 1260; // 9:00 PM
  if (currentTime >= closingTime) return 0;
  if (currentTime < 540) return closingTime - 540; // 还没开门
  return closingTime - currentTime;
}

/**
 * 安全除法，避免除以零
 * @param numerator 分子
 * @param denominator 分母
 * @param defaultValue 除以零时的默认值
 * @returns 除法结果
 */
export function safeDivide(numerator: number, denominator: number, defaultValue: number = 0): number {
  if (denominator === 0) return defaultValue;
  return numerator / denominator;
}

/**
 * 四舍五入到指定小数位
 * @param value 数值
 * @param decimals 小数位数
 * @returns 四舍五入后的值
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
