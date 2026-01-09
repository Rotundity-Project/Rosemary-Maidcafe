/**
 * 格式化工具
 * 提供时间、金币、数字等格式化功能
 * Requirements: 1.5, 5.6
 */

import { Season } from '@/types';

/**
 * 将游戏时间（分钟）格式化为时间字符串
 * @param minutes 游戏时间（分钟，从0开始，540=9:00AM）
 * @returns 格式化的时间字符串 (如 "09:00" 或 "下午 3:30")
 */
export function formatGameTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 将游戏时间格式化为12小时制
 * @param minutes 游戏时间（分钟）
 * @returns 格式化的时间字符串 (如 "上午 9:00" 或 "下午 3:30")
 */
export function formatGameTime12Hour(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours < 12 ? '上午' : '下午';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${period} ${displayHours}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 格式化金币数量
 * @param amount 金币数量
 * @param showSign 是否显示正负号
 * @returns 格式化的金币字符串 (如 "1,234" 或 "+500")
 */
export function formatGold(amount: number, showSign: boolean = false): string {
  const formatted = Math.abs(amount).toLocaleString('zh-CN');
  
  if (showSign) {
    if (amount > 0) return `+${formatted}`;
    if (amount < 0) return `-${formatted}`;
  }
  
  return amount < 0 ? `-${formatted}` : formatted;
}

/**
 * 格式化金币为简短形式
 * @param amount 金币数量
 * @returns 简短格式 (如 "1.2K", "3.5M")
 */
export function formatGoldShort(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1000000) {
    return `${sign}${(absAmount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `${sign}${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${sign}${absAmount}`;
}

/**
 * 格式化百分比
 * @param value 数值 (0-100 或 0-1)
 * @param isDecimal 是否为小数形式 (0-1)
 * @param decimals 小数位数
 * @returns 格式化的百分比字符串 (如 "85%")
 */
export function formatPercent(value: number, isDecimal: boolean = false, decimals: number = 0): string {
  const percent = isDecimal ? value * 100 : value;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * 格式化天数
 * @param day 天数
 * @returns 格式化的天数字符串 (如 "第 1 天")
 */
export function formatDay(day: number): string {
  return `第 ${day} 天`;
}

/**
 * 格式化季节
 * @param season 季节
 * @returns 季节的中文名称
 */
export function formatSeason(season: Season): string {
  const seasonNames: Record<Season, string> = {
    spring: '春季',
    summer: '夏季',
    autumn: '秋季',
    winter: '冬季',
  };
  return seasonNames[season];
}

/**
 * 获取季节图标
 * @param season 季节
 * @returns 季节对应的emoji图标
 */
export function getSeasonIcon(season: Season): string {
  const seasonIcons: Record<Season, string> = {
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂',
    winter: '❄️',
  };
  return seasonIcons[season];
}

/**
 * 格式化时间戳为日期字符串
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化的日期字符串 (如 "2024-01-15 14:30")
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化时间戳为相对时间
 * @param timestamp 时间戳（毫秒）
 * @returns 相对时间字符串 (如 "5分钟前", "2小时前")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

/**
 * 格式化持续时间（游戏内分钟）
 * @param minutes 持续时间（分钟）
 * @returns 格式化的持续时间 (如 "30分钟", "1小时30分钟")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}小时`;
  }
  
  return `${hours}小时${remainingMinutes}分钟`;
}

/**
 * 格式化数字为带千分位的字符串
 * @param value 数值
 * @returns 格式化的数字字符串
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN');
}

/**
 * 格式化等级
 * @param level 等级
 * @returns 格式化的等级字符串 (如 "Lv.5")
 */
export function formatLevel(level: number): string {
  return `Lv.${level}`;
}
