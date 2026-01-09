import { Equipment } from '@/types';

export const defaultEquipment: Equipment[] = [
  {
    id: 'coffee-machine',
    name: '咖啡机',
    level: 1,
    maxLevel: 5,
    effect: '提升饮品制作速度',
    upgradeCost: 300,
  },
  {
    id: 'oven',
    name: '烤箱',
    level: 1,
    maxLevel: 5,
    effect: '提升甜点制作速度',
    upgradeCost: 350,
  },
  {
    id: 'stove',
    name: '炉灶',
    level: 1,
    maxLevel: 5,
    effect: '提升主食制作速度',
    upgradeCost: 400,
  },
  {
    id: 'refrigerator',
    name: '冰箱',
    level: 1,
    maxLevel: 5,
    effect: '延长食材保鲜时间',
    upgradeCost: 250,
  },
  {
    id: 'dishwasher',
    name: '洗碗机',
    level: 1,
    maxLevel: 3,
    effect: '加快餐具清洗速度',
    upgradeCost: 200,
  },
  {
    id: 'pos-system',
    name: '收银系统',
    level: 1,
    maxLevel: 3,
    effect: '加快结账速度',
    upgradeCost: 500,
  },
  {
    id: 'air-conditioner',
    name: '空调',
    level: 1,
    maxLevel: 3,
    effect: '提升顾客舒适度',
    upgradeCost: 600,
  },
  {
    id: 'sound-system',
    name: '音响系统',
    level: 1,
    maxLevel: 3,
    effect: '提升氛围满意度',
    upgradeCost: 450,
  },
];

// 设备升级成本倍率
export const equipmentUpgradeCostMultiplier: number[] = [
  1,    // Level 1 -> 2
  1.5,  // Level 2 -> 3
  2.2,  // Level 3 -> 4
  3,    // Level 4 -> 5
];

// 设备效果提升百分比
export const equipmentEffectBonus: number[] = [
  0,    // Level 1: 基础
  10,   // Level 2: +10%
  25,   // Level 3: +25%
  45,   // Level 4: +45%
  70,   // Level 5: +70%
];
