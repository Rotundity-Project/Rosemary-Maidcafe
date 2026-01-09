import { MenuItem, Season, GameState } from '@/types';

/**
 * 菜单系统 - 管理菜单项的解锁、定价和可用性
 * Requirements: 4.2, 4.4, 4.5, 4.6, 4.7
 */

/**
 * 获取菜单项价格的有效范围
 * 价格范围为基础价格的 50% 到 200%
 * Requirements: 4.4
 */
export function getPriceRange(basePrice: number): { min: number; max: number } {
  return {
    min: Math.floor(basePrice * 0.5),
    max: Math.floor(basePrice * 2.0),
  };
}

/**
 * 解锁菜单项
 * 检查金币是否足够，扣除解锁费用并解锁菜单项
 * Requirements: 4.2
 */
export function unlockMenuItem(
  state: GameState,
  itemId: string
): GameState {
  const itemIndex = state.menuItems.findIndex((item) => item.id === itemId);
  
  // 菜单项不存在
  if (itemIndex === -1) {
    return state;
  }
  
  const item = state.menuItems[itemIndex];
  
  // 已经解锁
  if (item.unlocked) {
    return state;
  }
  
  // 金币不足
  if (state.finance.gold < item.unlockCost) {
    return state;
  }
  
  // 创建更新后的菜单项数组
  const updatedMenuItems = [...state.menuItems];
  updatedMenuItems[itemIndex] = {
    ...item,
    unlocked: true,
  };
  
  return {
    ...state,
    menuItems: updatedMenuItems,
    finance: {
      ...state.finance,
      gold: state.finance.gold - item.unlockCost,
    },
  };
}

/**
 * 设置菜单项价格
 * 价格必须在有效范围内 (basePrice * 0.5 到 basePrice * 2.0)
 * Requirements: 4.4
 */
export function setItemPrice(
  state: GameState,
  itemId: string,
  price: number
): GameState {
  const itemIndex = state.menuItems.findIndex((item) => item.id === itemId);
  
  // 菜单项不存在
  if (itemIndex === -1) {
    return state;
  }
  
  const item = state.menuItems[itemIndex];
  
  // 未解锁的菜单项不能设置价格
  if (!item.unlocked) {
    return state;
  }
  
  // 检查价格是否在有效范围内
  const { min, max } = getPriceRange(item.basePrice);
  const clampedPrice = Math.max(min, Math.min(max, Math.floor(price)));
  
  // 创建更新后的菜单项数组
  const updatedMenuItems = [...state.menuItems];
  updatedMenuItems[itemIndex] = {
    ...item,
    currentPrice: clampedPrice,
  };
  
  return {
    ...state,
    menuItems: updatedMenuItems,
  };
}

/**
 * 更新菜单项人气
 * 当菜单项被点单时增加人气值
 * Requirements: 4.5, 4.6
 */
export function updatePopularity(
  state: GameState,
  itemId: string,
  increment: number = 1
): GameState {
  const itemIndex = state.menuItems.findIndex((item) => item.id === itemId);
  
  // 菜单项不存在
  if (itemIndex === -1) {
    return state;
  }
  
  const item = state.menuItems[itemIndex];
  
  // 创建更新后的菜单项数组
  const updatedMenuItems = [...state.menuItems];
  updatedMenuItems[itemIndex] = {
    ...item,
    // 人气值上限为 100
    popularity: Math.min(100, item.popularity + increment),
  };
  
  return {
    ...state,
    menuItems: updatedMenuItems,
  };
}

/**
 * 获取当前季节可用的菜单项
 * 返回已解锁且在当前季节可用的菜单项
 * Requirements: 4.7
 */
export function getAvailableItems(
  menuItems: MenuItem[],
  season: Season
): MenuItem[] {
  return menuItems.filter((item) => {
    // 必须已解锁
    if (!item.unlocked) {
      return false;
    }
    
    // 全年可用的菜单项 (season === null)
    if (item.season === null) {
      return true;
    }
    
    // 季节限定菜单项必须匹配当前季节
    return item.season === season;
  });
}

/**
 * 根据人气获取菜单项的点单权重
 * 人气越高，被点单的概率越大
 * Requirements: 4.6
 */
export function getOrderWeight(item: MenuItem): number {
  // 基础权重 + 人气加成
  // 人气 0-100 对应权重 1-3
  return 1 + (item.popularity / 100) * 2;
}

/**
 * 根据权重随机选择菜单项
 * 用于顾客点单时的菜单选择
 * Requirements: 4.6
 */
export function selectRandomMenuItem(
  availableItems: MenuItem[]
): MenuItem | null {
  if (availableItems.length === 0) {
    return null;
  }
  
  // 计算总权重
  const totalWeight = availableItems.reduce(
    (sum, item) => sum + getOrderWeight(item),
    0
  );
  
  // 随机选择
  let random = Math.random() * totalWeight;
  
  for (const item of availableItems) {
    random -= getOrderWeight(item);
    if (random <= 0) {
      return item;
    }
  }
  
  // 兜底返回最后一个
  return availableItems[availableItems.length - 1];
}

/**
 * 获取指定分类的菜单项
 */
export function getItemsByCategory(
  menuItems: MenuItem[],
  category: MenuItem['category']
): MenuItem[] {
  return menuItems.filter((item) => item.category === category);
}

/**
 * 检查是否可以解锁菜单项
 */
export function canUnlockItem(state: GameState, itemId: string): boolean {
  const item = state.menuItems.find((i) => i.id === itemId);
  
  if (!item) {
    return false;
  }
  
  if (item.unlocked) {
    return false;
  }
  
  return state.finance.gold >= item.unlockCost;
}
