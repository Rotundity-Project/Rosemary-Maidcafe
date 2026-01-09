import {
  GameState,
  GameAction,
  Area,
  DailyFinance,
  Season,
} from '@/types';
import { initialGameState, GAME_CONSTANTS } from '@/data/initialState';

/**
 * 计算下一个季节
 */
function getNextSeason(currentSeason: Season): Season {
  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  const currentIndex = seasons.indexOf(currentSeason);
  return seasons[(currentIndex + 1) % 4];
}

/**
 * 计算咖啡厅升级成本
 */
function getCafeUpgradeCost(currentLevel: number): number {
  return 500 * Math.pow(2, currentLevel - 1);
}

/**
 * 计算区域解锁成本
 */
function getAreaUnlockCost(area: Area): number {
  const costs: Record<Area, number> = {
    main: 0,
    outdoor: 2000,
    vip_room: 5000,
    stage: 10000,
  };
  return costs[area];
}

/**
 * 游戏状态 Reducer
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // ==================== 时间控制 ====================
    case 'TICK': {
      // 如果暂停，不推进时间
      if (state.isPaused) {
        return state;
      }

      // 如果不在营业时间，不推进时间
      if (!state.isBusinessHours) {
        return state;
      }

      // 推进时间
      const newTime = state.time + GAME_CONSTANTS.TIME_INCREMENT;
      
      // 检查是否到达营业结束时间
      const newIsBusinessHours = newTime < GAME_CONSTANTS.BUSINESS_END_TIME;

      return {
        ...state,
        time: Math.min(newTime, GAME_CONSTANTS.BUSINESS_END_TIME),
        isBusinessHours: newIsBusinessHours,
      };
    }

    case 'TOGGLE_PAUSE': {
      return {
        ...state,
        isPaused: !state.isPaused,
      };
    }

    case 'END_DAY': {
      // 记录当日财务到历史
      const dailyFinance: DailyFinance = {
        day: state.day,
        revenue: state.finance.dailyRevenue,
        expenses: state.finance.dailyExpenses,
        profit: state.finance.dailyRevenue - state.finance.dailyExpenses,
      };

      // 保留最近7天的历史
      const newHistory = [...state.finance.history, dailyFinance].slice(-7);

      return {
        ...state,
        isPaused: true,
        isBusinessHours: false,
        finance: {
          ...state.finance,
          history: newHistory,
        },
      };
    }

    case 'START_NEW_DAY': {
      const newDay = state.day + 1;
      
      // 检查是否需要切换季节
      const newSeason = newDay % GAME_CONSTANTS.DAYS_PER_SEASON === 1 && newDay > 1
        ? getNextSeason(state.season)
        : state.season;

      return {
        ...state,
        day: newDay,
        time: GAME_CONSTANTS.BUSINESS_START_TIME,
        season: newSeason,
        isPaused: true,
        isBusinessHours: true,
        customers: [], // 清空顾客
        finance: {
          ...state.finance,
          dailyRevenue: 0,
          dailyExpenses: 0,
        },
        statistics: {
          ...state.statistics,
          totalDaysPlayed: state.statistics.totalDaysPlayed + 1,
        },
        // 重置女仆状态
        maids: state.maids.map(maid => ({
          ...maid,
          status: {
            isWorking: false,
            currentTask: null,
            servingCustomerId: null,
          },
        })),
      };
    }

    // ==================== 女仆管理 ====================
    case 'HIRE_MAID': {
      // 检查是否达到最大女仆数
      const maxMaids = state.facility.cafeLevel + 2; // 基础2 + 等级
      if (state.maids.length >= maxMaids) {
        return state;
      }

      return {
        ...state,
        maids: [...state.maids, action.maid],
        statistics: {
          ...state.statistics,
          maidsHired: state.statistics.maidsHired + 1,
        },
      };
    }

    case 'FIRE_MAID': {
      return {
        ...state,
        maids: state.maids.filter(maid => maid.id !== action.maidId),
        selectedMaidId: state.selectedMaidId === action.maidId ? null : state.selectedMaidId,
      };
    }

    case 'ASSIGN_ROLE': {
      return {
        ...state,
        maids: state.maids.map(maid =>
          maid.id === action.maidId
            ? { ...maid, role: action.role }
            : maid
        ),
      };
    }

    case 'UPDATE_MAID': {
      return {
        ...state,
        maids: state.maids.map(maid =>
          maid.id === action.maidId
            ? { ...maid, ...action.updates }
            : maid
        ),
      };
    }

    // ==================== 顾客管理 ====================
    case 'SPAWN_CUSTOMER': {
      return {
        ...state,
        customers: [...state.customers, action.customer],
      };
    }

    case 'UPDATE_CUSTOMER': {
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.customerId
            ? { ...customer, ...action.updates }
            : customer
        ),
      };
    }

    case 'REMOVE_CUSTOMER': {
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.customerId),
        selectedCustomerId: state.selectedCustomerId === action.customerId ? null : state.selectedCustomerId,
      };
    }

    case 'SERVE_CUSTOMER': {
      // 更新女仆状态
      const updatedMaids = state.maids.map(maid =>
        maid.id === action.maidId
          ? {
              ...maid,
              status: {
                ...maid.status,
                isWorking: true,
                currentTask: 'serving',
                servingCustomerId: action.customerId,
              },
            }
          : maid
      );

      // 更新顾客状态
      const updatedCustomers = state.customers.map(customer =>
        customer.id === action.customerId
          ? { ...customer, status: 'waiting_order' as const }
          : customer
      );

      return {
        ...state,
        maids: updatedMaids,
        customers: updatedCustomers,
      };
    }

    // ==================== 菜单管理 ====================
    case 'UNLOCK_MENU_ITEM': {
      const menuItem = state.menuItems.find(item => item.id === action.itemId);
      if (!menuItem || menuItem.unlocked) {
        return state;
      }

      // 检查金币是否足够
      if (state.finance.gold < menuItem.unlockCost) {
        return state;
      }

      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.itemId
            ? { ...item, unlocked: true }
            : item
        ),
        finance: {
          ...state.finance,
          gold: state.finance.gold - menuItem.unlockCost,
        },
      };
    }

    case 'SET_ITEM_PRICE': {
      const menuItem = state.menuItems.find(item => item.id === action.itemId);
      if (!menuItem || !menuItem.unlocked) {
        return state;
      }

      // 限制价格范围
      const minPrice = menuItem.basePrice * GAME_CONSTANTS.MIN_PRICE_MULTIPLIER;
      const maxPrice = menuItem.basePrice * GAME_CONSTANTS.MAX_PRICE_MULTIPLIER;
      const clampedPrice = Math.max(minPrice, Math.min(maxPrice, action.price));

      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.itemId
            ? { ...item, currentPrice: clampedPrice }
            : item
        ),
      };
    }

    // ==================== 设施管理 ====================
    case 'UPGRADE_CAFE': {
      const { cafeLevel } = state.facility;
      if (cafeLevel >= GAME_CONSTANTS.MAX_CAFE_LEVEL) {
        return state;
      }

      const upgradeCost = getCafeUpgradeCost(cafeLevel);
      if (state.finance.gold < upgradeCost) {
        return state;
      }

      const newLevel = cafeLevel + 1;
      const newMaxSeats = GAME_CONSTANTS.BASE_SEATS + (newLevel - 1) * GAME_CONSTANTS.SEATS_PER_LEVEL;

      return {
        ...state,
        facility: {
          ...state.facility,
          cafeLevel: newLevel,
          maxSeats: newMaxSeats,
        },
        finance: {
          ...state.finance,
          gold: state.finance.gold - upgradeCost,
        },
      };
    }

    case 'BUY_DECORATION': {
      const decoration = state.facility.decorations.find(d => d.id === action.decorationId);
      if (!decoration || decoration.purchased) {
        return state;
      }

      if (state.finance.gold < decoration.cost) {
        return state;
      }

      return {
        ...state,
        facility: {
          ...state.facility,
          decorations: state.facility.decorations.map(d =>
            d.id === action.decorationId
              ? { ...d, purchased: true }
              : d
          ),
        },
        finance: {
          ...state.finance,
          gold: state.finance.gold - decoration.cost,
        },
      };
    }

    case 'UPGRADE_EQUIPMENT': {
      const equipment = state.facility.equipment.find(e => e.id === action.equipmentId);
      if (!equipment || equipment.level >= equipment.maxLevel) {
        return state;
      }

      // 计算升级成本（随等级增加）
      const upgradeCost = Math.floor(equipment.upgradeCost * Math.pow(1.5, equipment.level - 1));
      if (state.finance.gold < upgradeCost) {
        return state;
      }

      return {
        ...state,
        facility: {
          ...state.facility,
          equipment: state.facility.equipment.map(e =>
            e.id === action.equipmentId
              ? { ...e, level: e.level + 1 }
              : e
          ),
        },
        finance: {
          ...state.finance,
          gold: state.finance.gold - upgradeCost,
        },
      };
    }

    case 'UNLOCK_AREA': {
      if (state.facility.unlockedAreas.includes(action.area)) {
        return state;
      }

      const unlockCost = getAreaUnlockCost(action.area);
      if (state.finance.gold < unlockCost) {
        return state;
      }

      return {
        ...state,
        facility: {
          ...state.facility,
          unlockedAreas: [...state.facility.unlockedAreas, action.area],
        },
        finance: {
          ...state.finance,
          gold: state.finance.gold - unlockCost,
        },
      };
    }

    // ==================== 财务 ====================
    case 'ADD_REVENUE': {
      if (action.amount <= 0) {
        return state;
      }

      return {
        ...state,
        finance: {
          ...state.finance,
          gold: state.finance.gold + action.amount,
          dailyRevenue: state.finance.dailyRevenue + action.amount,
        },
        statistics: {
          ...state.statistics,
          totalRevenue: state.statistics.totalRevenue + action.amount,
        },
      };
    }

    case 'ADD_EXPENSE': {
      if (action.amount <= 0) {
        return state;
      }

      return {
        ...state,
        finance: {
          ...state.finance,
          dailyExpenses: state.finance.dailyExpenses + action.amount,
        },
      };
    }

    case 'DEDUCT_GOLD': {
      if (action.amount <= 0) {
        return state;
      }

      return {
        ...state,
        finance: {
          ...state.finance,
          gold: Math.max(0, state.finance.gold - action.amount),
        },
      };
    }

    // ==================== 事件 ====================
    case 'TRIGGER_EVENT': {
      return {
        ...state,
        activeEvents: [...state.activeEvents, action.event],
        eventHistory: [...state.eventHistory, action.event],
      };
    }

    case 'END_EVENT': {
      return {
        ...state,
        activeEvents: state.activeEvents.filter(event => event.id !== action.eventId),
      };
    }

    // ==================== 成就 ====================
    case 'UNLOCK_ACHIEVEMENT': {
      const achievement = state.achievements.find(a => a.id === action.achievementId);
      if (!achievement || achievement.unlocked) {
        return state;
      }

      return {
        ...state,
        achievements: state.achievements.map(a =>
          a.id === action.achievementId
            ? { ...a, unlocked: true, unlockedDate: Date.now() }
            : a
        ),
        finance: {
          ...state.finance,
          gold: state.finance.gold + achievement.reward,
        },
      };
    }

    case 'UPDATE_STATISTICS': {
      return {
        ...state,
        statistics: {
          ...state.statistics,
          ...action.updates,
        },
      };
    }

    // ==================== UI ====================
    case 'SET_ACTIVE_PANEL': {
      return {
        ...state,
        activePanel: action.panel,
      };
    }

    case 'SELECT_MAID': {
      return {
        ...state,
        selectedMaidId: action.maidId,
      };
    }

    case 'SELECT_CUSTOMER': {
      return {
        ...state,
        selectedCustomerId: action.customerId,
      };
    }

    case 'ADD_NOTIFICATION': {
      return {
        ...state,
        notifications: [...state.notifications, action.notification],
      };
    }

    case 'REMOVE_NOTIFICATION': {
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.notificationId),
      };
    }

    // ==================== 存储 ====================
    case 'LOAD_GAME': {
      return action.state;
    }

    case 'RESET_GAME': {
      return initialGameState;
    }

    default:
      return state;
  }
}

export default gameReducer;
