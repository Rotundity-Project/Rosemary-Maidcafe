import { Facility, Decoration, Equipment, Area } from '@/types';
import { equipmentUpgradeCostMultiplier } from '@/data/equipment';

// 咖啡厅升级成本（按等级）
const CAFE_UPGRADE_COSTS: number[] = [
  0,      // Level 1 (初始)
  500,    // Level 1 -> 2
  1000,   // Level 2 -> 3
  2000,   // Level 3 -> 4
  3500,   // Level 4 -> 5
  5500,   // Level 5 -> 6
  8000,   // Level 6 -> 7
  11000,  // Level 7 -> 8
  15000,  // Level 8 -> 9
  20000,  // Level 9 -> 10
];

// 区域解锁成本
const AREA_UNLOCK_COSTS: Record<Area, number> = {
  main: 0,           // 主区域免费（初始解锁）
  outdoor: 2000,     // 户外座位
  vip_room: 5000,    // VIP包间
  stage: 8000,       // 舞台
};

// 最大咖啡厅等级
const MAX_CAFE_LEVEL = 10;

// 基础座位数和每级增加座位数
const BASE_SEATS = 4;
const SEATS_PER_LEVEL = 2;

/**
 * 计算指定咖啡厅等级的最大座位数
 * 公式: 4 + (level - 1) * 2，范围从4到22
 * Requirements: 6.1, 6.2
 */
export function calculateMaxSeats(cafeLevel: number): number {
  const clampedLevel = Math.max(1, Math.min(cafeLevel, MAX_CAFE_LEVEL));
  return BASE_SEATS + (clampedLevel - 1) * SEATS_PER_LEVEL;
}

/**
 * 获取咖啡厅升级成本
 * Requirements: 6.1
 */
export function getCafeUpgradeCost(currentLevel: number): number {
  if (currentLevel >= MAX_CAFE_LEVEL) {
    return Infinity; // 已达最高等级
  }
  return CAFE_UPGRADE_COSTS[currentLevel] || Infinity;
}

/**
 * 升级咖啡厅
 * 返回升级后的设施状态和扣除的金币，如果无法升级则返回null
 * Requirements: 6.1, 6.2
 */
export function upgradeCafe(
  facility: Facility,
  gold: number
): { facility: Facility; cost: number } | null {
  // 检查是否已达最高等级
  if (facility.cafeLevel >= MAX_CAFE_LEVEL) {
    return null;
  }

  const upgradeCost = getCafeUpgradeCost(facility.cafeLevel);
  
  // 检查金币是否足够
  if (gold < upgradeCost) {
    return null;
  }

  const newLevel = facility.cafeLevel + 1;
  
  return {
    facility: {
      ...facility,
      cafeLevel: newLevel,
      maxSeats: calculateMaxSeats(newLevel),
    },
    cost: upgradeCost,
  };
}


/**
 * 购买装饰品
 * 返回更新后的设施状态和扣除的金币，如果无法购买则返回null
 * Requirements: 6.3
 */
export function buyDecoration(
  facility: Facility,
  decorationId: string,
  gold: number
): { facility: Facility; cost: number } | null {
  // 查找装饰品
  const decorationIndex = facility.decorations.findIndex(d => d.id === decorationId);
  
  if (decorationIndex === -1) {
    return null; // 装饰品不存在
  }

  const decoration = facility.decorations[decorationIndex];
  
  // 检查是否已购买
  if (decoration.purchased) {
    return null;
  }

  // 检查金币是否足够
  if (gold < decoration.cost) {
    return null;
  }

  // 更新装饰品状态
  const newDecorations = [...facility.decorations];
  newDecorations[decorationIndex] = {
    ...decoration,
    purchased: true,
  };

  return {
    facility: {
      ...facility,
      decorations: newDecorations,
    },
    cost: decoration.cost,
  };
}

/**
 * 获取设备升级成本
 * 成本 = 基础成本 * 升级倍率
 * Requirements: 6.4, 6.5
 */
export function getEquipmentUpgradeCost(equipment: Equipment): number {
  if (equipment.level >= equipment.maxLevel) {
    return Infinity; // 已达最高等级
  }
  
  const multiplierIndex = equipment.level - 1;
  const multiplier = equipmentUpgradeCostMultiplier[multiplierIndex] || 1;
  
  return Math.floor(equipment.upgradeCost * multiplier);
}

/**
 * 升级设备
 * 返回更新后的设施状态和扣除的金币，如果无法升级则返回null
 * Requirements: 6.4, 6.5
 */
export function upgradeEquipment(
  facility: Facility,
  equipmentId: string,
  gold: number
): { facility: Facility; cost: number } | null {
  // 查找设备
  const equipmentIndex = facility.equipment.findIndex(e => e.id === equipmentId);
  
  if (equipmentIndex === -1) {
    return null; // 设备不存在
  }

  const equipment = facility.equipment[equipmentIndex];
  
  // 检查是否已达最高等级
  if (equipment.level >= equipment.maxLevel) {
    return null;
  }

  const upgradeCost = getEquipmentUpgradeCost(equipment);
  
  // 检查金币是否足够
  if (gold < upgradeCost) {
    return null;
  }

  // 更新设备状态
  const newEquipment = [...facility.equipment];
  newEquipment[equipmentIndex] = {
    ...equipment,
    level: equipment.level + 1,
  };

  return {
    facility: {
      ...facility,
      equipment: newEquipment,
    },
    cost: upgradeCost,
  };
}


/**
 * 获取区域解锁成本
 * Requirements: 6.6
 */
export function getAreaUnlockCost(area: Area): number {
  return AREA_UNLOCK_COSTS[area] || Infinity;
}

/**
 * 解锁新区域
 * 返回更新后的设施状态和扣除的金币，如果无法解锁则返回null
 * Requirements: 6.6
 */
export function unlockArea(
  facility: Facility,
  area: Area,
  gold: number
): { facility: Facility; cost: number } | null {
  // 检查区域是否已解锁
  if (facility.unlockedAreas.includes(area)) {
    return null;
  }

  const unlockCost = getAreaUnlockCost(area);
  
  // 检查金币是否足够
  if (gold < unlockCost) {
    return null;
  }

  return {
    facility: {
      ...facility,
      unlockedAreas: [...facility.unlockedAreas, area],
    },
    cost: unlockCost,
  };
}

/**
 * 计算所有已购买装饰品的满意度加成总和
 * Requirements: 6.3
 */
export function calculateSatisfactionBonus(decorations: Decoration[]): number {
  return decorations
    .filter(d => d.purchased)
    .reduce((total, d) => total + d.satisfactionBonus, 0);
}

/**
 * 检查区域是否已解锁
 */
export function isAreaUnlocked(facility: Facility, area: Area): boolean {
  return facility.unlockedAreas.includes(area);
}

/**
 * 获取所有可购买的装饰品（未购买的）
 */
export function getAvailableDecorations(facility: Facility): Decoration[] {
  return facility.decorations.filter(d => !d.purchased);
}

/**
 * 获取所有已购买的装饰品
 */
export function getPurchasedDecorations(facility: Facility): Decoration[] {
  return facility.decorations.filter(d => d.purchased);
}

/**
 * 获取可升级的设备（未达最高等级的）
 */
export function getUpgradeableEquipment(facility: Facility): Equipment[] {
  return facility.equipment.filter(e => e.level < e.maxLevel);
}

/**
 * 获取未解锁的区域
 */
export function getLockedAreas(facility: Facility): Area[] {
  const allAreas: Area[] = ['main', 'outdoor', 'vip_room', 'stage'];
  return allAreas.filter(area => !facility.unlockedAreas.includes(area));
}

/**
 * 计算设备效率加成
 * 根据设备等级返回效率提升百分比
 * Requirements: 6.5
 */
export function calculateEquipmentEfficiency(equipment: Equipment): number {
  // 每级提升15%效率
  return (equipment.level - 1) * 15;
}

/**
 * 获取特定类型设备的效率加成
 */
export function getEquipmentEfficiencyById(facility: Facility, equipmentId: string): number {
  const equipment = facility.equipment.find(e => e.id === equipmentId);
  if (!equipment) {
    return 0;
  }
  return calculateEquipmentEfficiency(equipment);
}

/**
 * 计算总设备效率加成
 * 返回所有设备的平均效率提升
 */
export function calculateTotalEquipmentEfficiency(facility: Facility): number {
  if (facility.equipment.length === 0) {
    return 0;
  }
  
  const totalEfficiency = facility.equipment.reduce(
    (total, eq) => total + calculateEquipmentEfficiency(eq),
    0
  );
  
  return totalEfficiency / facility.equipment.length;
}

/**
 * 检查是否可以升级咖啡厅
 */
export function canUpgradeCafe(facility: Facility, gold: number): boolean {
  if (facility.cafeLevel >= MAX_CAFE_LEVEL) {
    return false;
  }
  return gold >= getCafeUpgradeCost(facility.cafeLevel);
}

/**
 * 检查是否可以购买装饰品
 */
export function canBuyDecoration(
  facility: Facility,
  decorationId: string,
  gold: number
): boolean {
  const decoration = facility.decorations.find(d => d.id === decorationId);
  if (!decoration || decoration.purchased) {
    return false;
  }
  return gold >= decoration.cost;
}

/**
 * 检查是否可以升级设备
 */
export function canUpgradeEquipment(
  facility: Facility,
  equipmentId: string,
  gold: number
): boolean {
  const equipment = facility.equipment.find(e => e.id === equipmentId);
  if (!equipment || equipment.level >= equipment.maxLevel) {
    return false;
  }
  return gold >= getEquipmentUpgradeCost(equipment);
}

/**
 * 检查是否可以解锁区域
 */
export function canUnlockArea(
  facility: Facility,
  area: Area,
  gold: number
): boolean {
  if (facility.unlockedAreas.includes(area)) {
    return false;
  }
  return gold >= getAreaUnlockCost(area);
}
