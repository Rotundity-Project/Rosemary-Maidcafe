import { GameState } from '@/types';
import { defaultMenuItems } from './menuItems';
import { defaultAchievements } from './achievements';
import { defaultDecorations } from './decorations';
import { defaultEquipment } from './equipment';
import { defaultTasks } from './tasks';

export const initialGameState: GameState = {
  // 时间设置
  day: 1,
  time: 540, // 9:00 AM (9 * 60 = 540分钟)
  season: 'spring',
  weather: 'sunny',
  isPaused: true,
  isBusinessHours: true,
  gameSpeed: 1, // 默认速度1x

  runtime: {
    customerSpawnMs: 0,
    customerStatusTicks: {},
    customersServedToday: 0,
  },
  
  // 核心数据 - 初始为空或默认值
  maids: [],
  customers: [],
  menuItems: defaultMenuItems,
  
  // 设施 - 初始等级1
  facility: {
    cafeLevel: 1,
    maxSeats: 4,
    decorations: defaultDecorations,
    equipment: defaultEquipment,
    unlockedAreas: ['main'],
  },
  
  // 财务 - 初始金币1000
  finance: {
    gold: 1000,
    dailyRevenue: 0,
    dailyExpenses: 0,
    history: [],
  },
  
  // 事件
  activeEvents: [],
  eventHistory: [],
  
  // 成就
  achievements: defaultAchievements,
  tasks: defaultTasks,
  statistics: {
    totalCustomersServed: 0,
    totalRevenue: 0,
    totalDaysPlayed: 0,
    totalTipsEarned: 0,
    perfectServicesCount: 0,
    maidsHired: 0,
  },
  
  // 声望 - 初始50
  reputation: 50,
  
  // UI状态
  selectedMaidId: null,
  selectedCustomerId: null,
  activePanel: 'cafe',
  notifications: [],
  dailySummaryOpen: false,
};

// 游戏常量
export const GAME_CONSTANTS = {
  // 时间相关
  BUSINESS_START_TIME: 540,  // 9:00 AM
  BUSINESS_END_TIME: 1260,   // 9:00 PM
  TIME_INCREMENT: 5,          // 每次tick增加5分钟
  
  // 季节天数
  DAYS_PER_SEASON: 30,
  
  // 咖啡厅等级
  MAX_CAFE_LEVEL: 10,
  SEATS_PER_LEVEL: 2,        // 每级增加2个座位
  BASE_SEATS: 4,             // 基础座位数
  
  // 女仆相关
  MAX_MAID_LEVEL: 50,
  EXPERIENCE_PER_LEVEL: 100,
  LOW_STAMINA_THRESHOLD: 20,
  LOW_STAMINA_EFFICIENCY: 0.5,
  STAMINA_RECOVERY_RATE: 5,  // 休息时每tick恢复的体力
  
  // 顾客相关
  BASE_PATIENCE: 100,
  PATIENCE_DECAY_RATE: 1,    // 每tick减少的耐心
  
  // 价格范围
  MIN_PRICE_MULTIPLIER: 0.5,
  MAX_PRICE_MULTIPLIER: 2.0,
  
  // 存储
  SAVE_KEY: 'rosemary-maid-cafe-save',
  SAVE_VERSION: '1.0.0',
};
