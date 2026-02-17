import {
  GameState,
  GameAction,
  Area,
  DailyFinance,
  Season,
  Customer,
  GuideStep,
} from '@/types';
import { initialGameState, GAME_CONSTANTS } from '@/data/initialState';
import { calculateEfficiency, startService, updateMaidStamina, updateMaidMood, updateServiceProgress as updateMaidServiceProgress, addExperience, getRoleEfficiencyBonus, isMaidTired } from '@/systems/maidSystem';
import { checkAchievements } from '@/systems/achievementSystem';
import { calculateRewards, calculateSatisfaction, completeService, generateCustomer, generateOrder, getSpawnInterval, handlePatienceTimeout, shouldCustomerLeave, startCustomerService, updateCustomerServiceProgress, updatePatience } from '@/systems/customerSystem';
import { calculateDailyOperatingCost } from '@/systems/financeSystem';
import { applyTaskEvent, claimTaskReward, refreshDailyTasks } from '@/systems/taskSystem';
import { getCafeUpgradeCost, getAreaUnlockCost } from '@/systems/facilitySystem';
import { generateId, generateNotificationId } from '@/utils';
import { getNextStepConfig, canAdvanceToNextStep, getGuideNotification, GUIDE_STEPS } from './guideSystem';


// 状态更新辅助函数 - 减少代码重复
/**
 * 更新财务和统计数据的辅助函数
 * 统一处理金币、收入、声望、统计数据更新
 */
function updateFinanceAndStatistics(
  state: GameState,
  rewards: { gold: number; tip: number; reputation: number },
  additionalStats?: Partial<GameState['statistics']>
): Pick<GameState, 'finance' | 'reputation' | 'statistics'> {
  return {
    finance: {
      ...state.finance,
      gold: state.finance.gold + rewards.gold + rewards.tip,
      dailyRevenue: state.finance.dailyRevenue + rewards.gold + rewards.tip,
    },
    reputation: Math.max(0, Math.min(100, state.reputation + rewards.reputation)),
    statistics: {
      ...state.statistics,
      totalCustomersServed: state.statistics.totalCustomersServed + 1,
      totalRevenue: state.statistics.totalRevenue + rewards.gold + rewards.tip,
      totalTipsEarned: state.statistics.totalTipsEarned + rewards.tip,
      ...additionalStats,
    },
  };
}

/**
 * 计算下一个季节
 */
function getNextSeason(currentSeason: Season): Season {
  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  const currentIndex = seasons.indexOf(currentSeason);
  return seasons[(currentIndex + 1) % 4];
}

/**
 * 处理顾客离开事件 - 抽取为独立函数
 * 消除代码重复，统一的顾客离开处理逻辑
 */
function handleCustomerLeave(
  customer: ReturnType<typeof updatePatience>,
  customersById: Map<string, any>,
  nextRuntime: any,
  notifications: any[],
  currentReputation: number
): { customersById: Map<string, any>; reputation: number; notifications: any[] } {
  const { customer: leavingCustomer, reputationPenalty } = handlePatienceTimeout(customer);
  const newReputation = Math.max(0, currentReputation - reputationPenalty);
  
  customersById.set(customer.id, leavingCustomer);
  nextRuntime.customerStatusTicks[customer.id] = 1;
  nextRuntime.customerStreak = 0;
  
  notifications.push({
    id: generateNotificationId('patience_timeout'),
    type: 'warning',
    message: `${customer.name} 因等待太久而离开了，声望 -${reputationPenalty}`,
    timestamp: Date.now(),
  });
  
  return { customersById, reputation: newReputation, notifications };
}

/**
 * 处理顾客状态转换的辅助函数
 * 统一处理顾客从 eating -> paying -> leaving -> 删除 的流程
 */
function processCustomerStatusTicks(
  customer: any,
  customersById: Map<string, any>,
  nextRuntime: any
): boolean {
  if (customer.status === 'eating' || customer.status === 'paying' || customer.status === 'leaving') {
    const defaultTicks = customer.status === 'eating' ? 2 : 1;
    const current = nextRuntime.customerStatusTicks[customer.id] ?? defaultTicks;
    const remaining = current - 1;

    if (remaining > 0) {
      nextRuntime.customerStatusTicks[customer.id] = remaining;
      return false;
    }

    if (customer.status === 'eating') {
      customersById.set(customer.id, { ...customer, status: 'paying' });
      nextRuntime.customerStatusTicks[customer.id] = 1;
      return false;
    }

    if (customer.status === 'paying') {
      customersById.set(customer.id, { ...customer, status: 'leaving' });
      nextRuntime.customerStatusTicks[customer.id] = 1;
      return false;
    }

    customersById.delete(customer.id);
    delete nextRuntime.customerStatusTicks[customer.id];
    return true;
  }
  return false;
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

      const deltaMinutes = GAME_CONSTANTS.TIME_INCREMENT;
      const deltaMs = action.deltaTime;

      const nextRuntime = {
        ...state.runtime,
        customerSpawnMs: (state.runtime.customerSpawnMs ?? 0) + deltaMs,
        customerStatusTicks: { ...(state.runtime.customerStatusTicks ?? {}) },
      };

      const baseCustomers = state.customers;

      let notifications = [...state.notifications];
      let reputation = state.reputation;
      let tasks = state.tasks;

      const maidsById = new Map(state.maids.map(m => [m.id, m] as const));
      let customersById = new Map(baseCustomers.map(c => [c.id, c] as const));

      for (const customer of [...customersById.values()]) {
        // 使用辅助函数处理顾客状态转换
        const processed = processCustomerStatusTicks(customer, customersById, nextRuntime);
        if (processed) {
          continue;
        }
        delete nextRuntime.customerStatusTicks[customer.id];
      }

      for (const maid of maidsById.values()) {
        const updatedStamina = updateMaidStamina(maid, deltaMinutes);
        const updated = updateMaidMood(updatedStamina, deltaMinutes);
        const wasResting = maid.status.isResting;
        const wasWorking = maid.status.isWorking;

        if (updated.stamina <= 0 && !wasResting) {
          maidsById.set(maid.id, {
            ...updated,
            stamina: 0,
            status: {
              isWorking: false,
              isResting: true,
              currentTask: null,
              servingCustomerId: null,
            },
          });
          notifications.push({
            id: generateNotificationId('maid_exhausted'),
            type: 'warning',
            message: `${maid.name} 体力耗尽，已自动安排休息`,
            timestamp: Date.now(),
          });
          continue;
        }

        if (updated.stamina >= 50 && wasResting) {
          maidsById.set(maid.id, {
            ...updated,
            status: {
              ...updated.status,
              isResting: false,
            },
          });
          notifications.push({
            id: generateNotificationId('maid_recovered'),
            type: 'success',
            message: `${maid.name} 体力恢复，已返回工作岗位`,
            timestamp: Date.now(),
          });
          continue;
        }

        if (updated.stamina !== maid.stamina || updated.status.isWorking !== wasWorking) {
          maidsById.set(maid.id, updated);
        }
      }

      for (const customer of customersById.values()) {
        if (customer.status === 'leaving' || customer.status === 'paying' || customer.status === 'eating') {
          continue;
        }

        const updatedCustomer = updatePatience(customer, deltaMinutes);
        if (shouldCustomerLeave(updatedCustomer)) {
          // 使用辅助函数处理顾客离开事件
          const result = handleCustomerLeave(updatedCustomer, customersById, nextRuntime, notifications, reputation);
          customersById = result.customersById;
          reputation = result.reputation;
          notifications = result.notifications;
          continue;
        }

        if (updatedCustomer.patience !== customer.patience) {
          customersById.set(customer.id, updatedCustomer);
        }
      }

      // 优化：单次遍历处理多个状态，减少数组复制
      // 分离不同状态的顾客以避免重复遍历
      const waitingCustomers: any[] = [];
      const activeCustomers: any[] = [];
      const customersWithService: any[] = [];
      
      for (const customer of customersById.values()) {
        // 处理服务进度更新
        if (customer.status === 'waiting_order' && customer.serviceProgress !== undefined && customer.servingMaidId) {
          customersWithService.push(customer);
        }
        // 收集等待服务的顾客
        if (customer.status === 'seated') {
          waitingCustomers.push(customer);
        }
        // 收集有座位的顾客
        if (customer.status !== 'waiting_seat' && customer.seatId) {
          activeCustomers.push(customer);
        }
      }

      // 处理服务进度
      for (const customer of customersWithService) {
        const maid = maidsById.get(customer.servingMaidId);
        if (!maid) {
          continue;
        }

        const newProgress = updateMaidServiceProgress(maid, customer.serviceProgress, deltaMinutes);
        if (newProgress >= 100) {
          const waitTime = customer.serviceStartTime ? (Date.now() - customer.serviceStartTime) / 60000 : 0;
          const satisfaction = calculateSatisfaction(maid, customer, waitTime);
          const rewards = calculateRewards(customer, maid);

          // 为女仆添加经验
          const experiencedMaid = addExperience(maid, rewards.maidExperience);
          maidsById.set(maid.id, {
            ...experiencedMaid,
            status: {
              ...experiencedMaid.status,
              isWorking: false,
              currentTask: null,
              servingCustomerId: null,
            },
          });

          customersById.set(customer.id, completeService({ ...customer, satisfaction }));
          nextRuntime.customerStatusTicks[customer.id] = 2;

          // 使用辅助函数更新财务和统计数据
          const financeAndStats = updateFinanceAndStatistics(state, rewards);

          state = {
            ...state,
            ...financeAndStats,
            runtime: {
              ...state.runtime,
              customersServedToday: (state.runtime.customersServedToday ?? 0) + 1,
              customerStreak: (state.runtime.customerStreak ?? 0) + 1,
            },
          };
          tasks = applyTaskEvent(tasks, { type: 'serve_customers', amount: 1 });
          tasks = applyTaskEvent(tasks, { type: 'earn_gold', amount: rewards.gold + rewards.tip });
          // VIP顾客服务任务
          if (customer.type === 'vip') {
            tasks = applyTaskEvent(tasks, { type: 'serve_vip', amount: 1 });
          }
          // 小费任务
          if (rewards.tip > 0) {
            tasks = applyTaskEvent(tasks, { type: 'earn_tips', amount: rewards.tip });
          }
          // 满意度任务
          tasks = applyTaskEvent(tasks, { type: 'maintain_satisfaction', value: satisfaction });
          // 累计收入任务（使用当前金币作为累计值）
          tasks = applyTaskEvent(tasks, { type: 'total_revenue', amount: state.finance.gold });
          // 累计顾客任务
          tasks = applyTaskEvent(tasks, { type: 'total_customers', amount: state.statistics.totalCustomersServed + 1 });
        } else {
          customersById.set(customer.id, updateCustomerServiceProgress(customer, newProgress));
        }
      }
      if (waitingCustomers.length > 0) {
        const availableMaids = [...maidsById.values()].filter(
          m =>
            !m.status.isResting &&
            !m.status.isWorking &&
            m.status.servingCustomerId === null &&
            m.stamina >= 10
        );

        if (availableMaids.length > 0) {
          const sortedMaids = [...availableMaids].sort((a, b) => calculateEfficiency(b) - calculateEfficiency(a));
          const sortedCustomers = [...waitingCustomers].sort((a, b) => a.patience - b.patience);
          const assignCount = Math.min(sortedMaids.length, sortedCustomers.length);

          for (let i = 0; i < assignCount; i++) {
            const maid = sortedMaids[i];
            const customer = sortedCustomers[i];
            maidsById.set(maid.id, startService(maid, customer.id));
            customersById.set(customer.id, startCustomerService(customer, maid.id));
          }
        }
      }

      // 使用之前遍历时收集的 activeCustomers 数据
      const occupiedSeats = new Set(activeCustomers.map(c => c.seatId));

      const spawnIntervalMs = getSpawnInterval(reputation, state.facility.cafeLevel);
      let spawnMs = nextRuntime.customerSpawnMs;
      let spawnCount = 0;

      while (spawnMs >= spawnIntervalMs && spawnCount < 3) {
        if (occupiedSeats.size >= state.facility.maxSeats) {
          break;
        }

        let seatId: string | null = null;
        for (let i = 1; i <= state.facility.maxSeats; i++) {
          const candidate = `seat-${i}`;
          if (!occupiedSeats.has(candidate)) {
            seatId = candidate;
            break;
          }
        }

        if (!seatId) {
          break;
        }

        const newCustomer = generateCustomer(reputation, state.season, state.weather);
        const order = generateOrder(newCustomer, state.menuItems, state.season);

        customersById.set(newCustomer.id, {
          ...newCustomer,
          order,
          seatId,
          status: 'seated',
        });
        occupiedSeats.add(seatId);
        spawnMs -= spawnIntervalMs;
        spawnCount += 1;
      }

      const finalCustomers = [...customersById.values()];

      const unlockedIds = checkAchievements(state.statistics, state.achievements, state);
      let achievements = state.achievements;
      let achievementRewardGold = 0;
      for (const id of unlockedIds) {
        const achievement = achievements.find(a => a.id === id);
        if (!achievement || achievement.unlocked) {
          continue;
        }
        achievements = achievements.map(a => a.id === id ? { ...a, unlocked: true, unlockedDate: Date.now() } : a);
        achievementRewardGold += achievement.reward;
        notifications.push({
          id: generateNotificationId('achievement'),
          type: 'achievement',
          message: `🏆 成就解锁：${achievement.name}！奖励 ${achievement.reward} 金币`,
          timestamp: Date.now(),
        });
      }

      const newTime = state.time + deltaMinutes;
      const time = Math.min(newTime, GAME_CONSTANTS.BUSINESS_END_TIME);
      const isClosingTick = time >= GAME_CONSTANTS.BUSINESS_END_TIME;

      const intermediateState: GameState = {
        ...state,
        time,
        isBusinessHours: !isClosingTick,
        runtime: {
          ...nextRuntime,
          customerSpawnMs: spawnMs,
        },
        maids: [...maidsById.values()],
        customers: finalCustomers,
        achievements,
        tasks,
        finance: {
          ...state.finance,
          gold: state.finance.gold + achievementRewardGold,
        },
        reputation,
        notifications,
      };

      if (!isClosingTick) {
        return intermediateState;
      }

      const dailyOperatingCost = calculateDailyOperatingCost(intermediateState.maids, intermediateState.facility);
      const dailyFinance: DailyFinance = {
        day: intermediateState.day,
        revenue: intermediateState.finance.dailyRevenue,
        expenses: intermediateState.finance.dailyExpenses + dailyOperatingCost,
        profit: intermediateState.finance.dailyRevenue - (intermediateState.finance.dailyExpenses + dailyOperatingCost),
      };
      const newHistory = [...intermediateState.finance.history, dailyFinance].slice(-7);

      return {
        ...intermediateState,
        isPaused: true,
        isBusinessHours: false,
        dailySummaryOpen: true,
        time: GAME_CONSTANTS.BUSINESS_END_TIME,
        finance: {
          ...intermediateState.finance,
          gold: Math.max(0, intermediateState.finance.gold - dailyOperatingCost),
          history: newHistory,
        },
      };
    }

    case 'TOGGLE_PAUSE': {
      return {
        ...state,
        isPaused: !state.isPaused,
      };
    }

    case 'SET_GAME_SPEED': {
      return {
        ...state,
        gameSpeed: action.speed,
      };
    }

    case 'END_DAY': {
      // 计算日常运营成本
      const dailyOperatingCost = calculateDailyOperatingCost(state.maids, state.facility);
      
      // 记录当日财务到历史
      const dailyFinance: DailyFinance = {
        day: state.day,
        revenue: state.finance.dailyRevenue,
        expenses: state.finance.dailyExpenses + dailyOperatingCost,
        profit: state.finance.dailyRevenue - (state.finance.dailyExpenses + dailyOperatingCost),
      };
      
      // 保留最近7天的历史
      const newHistory = [...state.finance.history, dailyFinance].slice(-7);
      
      return {
        ...state,
        isPaused: true,
        isBusinessHours: false,
        dailySummaryOpen: true,
        finance: {
          ...state.finance,
          gold: Math.max(0, state.finance.gold - dailyOperatingCost),
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
        dailySummaryOpen: false,
        runtime: {
          ...state.runtime,
          customerSpawnMs: 0,
          customerStatusTicks: {},
          customersServedToday: 0,
          customerStreak: 0,
        },
        customers: [], // 清空顾客
        tasks: refreshDailyTasks(state.tasks, newDay),
        finance: {
          ...state.finance,
          dailyRevenue: 0,
          dailyExpenses: 0,
        },
        statistics: {
          ...state.statistics,
          totalDaysPlayed: state.statistics.totalDaysPlayed + 1,
        },
        // 重置女仆状态，恢复体力
        maids: state.maids.map(maid => ({
          ...maid,
          stamina: 100, // 新的一天体力恢复满
          mood: 100, // 新的一天心情恢复满
          status: {
            isWorking: false,
            isResting: false,
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
        tasks: applyTaskEvent(state.tasks, { type: 'hire_maids', amount: 1 }),
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

    case 'TOGGLE_MAID_REST': {
      return {
        ...state,
        maids: state.maids.map(maid =>
          maid.id === action.maidId
            ? {
                ...maid,
                status: {
                  ...maid.status,
                  isResting: !maid.status.isResting,
                  isWorking: false,
                  currentTask: null,
                  servingCustomerId: null,
                },
              }
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

    case 'START_SERVICE': {
      const maid = state.maids.find(m => m.id === action.maidId);
      const customer = state.customers.find(c => c.id === action.customerId);
      
      if (!maid || !customer) {
        return state;
      }

      const updatedMaid = startService(maid, action.customerId);
      const updatedCustomer = startCustomerService(customer, action.maidId);

      return {
        ...state,
        maids: state.maids.map(m => m.id === action.maidId ? updatedMaid : m),
        customers: state.customers.map(c => c.id === action.customerId ? updatedCustomer : c),
      };
    }

    case 'UPDATE_SERVICE_PROGRESS': {
      const maid = state.maids.find(m => m.id === action.maidId);
      const customer = state.customers.find(c => c.id === action.customerId);
      
      if (!maid || !customer || customer.serviceProgress === undefined) {
        return state;
      }

      const newProgress = updateMaidServiceProgress(maid, customer.serviceProgress, GAME_CONSTANTS.TIME_INCREMENT);
      const updatedCustomer = updateCustomerServiceProgress(customer, newProgress);

      return {
        ...state,
        customers: state.customers.map(c => c.id === action.customerId ? updatedCustomer : c),
      };
    }

    case 'COMPLETE_SERVICE': {
      const maid = state.maids.find(m => m.id === action.maidId);
      const customer = state.customers.find(c => c.id === action.customerId);
      
      if (!maid || !customer) {
        return state;
      }

      // 计算等待时间
      const waitTime = customer.serviceStartTime 
        ? (Date.now() - customer.serviceStartTime) / 60000 
        : 0;

      // 计算满意度
      const satisfaction = calculateSatisfaction(maid, customer, waitTime);
      
      // 计算奖励
      const rewards = calculateRewards(customer, maid);
      
      // 判断是否为完美服务 (满意度 >= 90)
      const isPerfectService = satisfaction >= 90;
      
      // 更新女仆状态(释放)
      const updatedMaid = {
        ...maid,
        status: {
          ...maid.status,
          isWorking: false,
          currentTask: null,
          servingCustomerId: null,
        },
      };

      // 更新顾客状态
      const updatedCustomer = completeService({
        ...customer,
        satisfaction,
      });

      // 使用辅助函数更新财务和统计数据
      const financeAndStats = updateFinanceAndStatistics(
        state,
        rewards,
        { perfectServicesCount: state.statistics.perfectServicesCount + (isPerfectService ? 1 : 0) }
      );

      return {
        ...state,
        maids: state.maids.map(m => m.id === action.maidId ? updatedMaid : m),
        customers: state.customers.map(c => c.id === action.customerId ? updatedCustomer : c),
        ...financeAndStats,
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
        tasks: applyTaskEvent(state.tasks, { type: 'unlock_menu_items', amount: 1 }),
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
        tasks: applyTaskEvent(state.tasks, { type: 'upgrade_cafe', level: newLevel }),
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

    // ==================== 任务 ====================
    case 'CLAIM_TASK_REWARD': {
      const { tasks, reward } = claimTaskReward(state.tasks, action.taskId);
      if (!reward) {
        return state;
      }

      return {
        ...state,
        tasks,
        finance: {
          ...state.finance,
          gold: state.finance.gold + reward.gold,
          dailyRevenue: state.finance.dailyRevenue + reward.gold,
        },
        reputation: Math.max(0, Math.min(100, state.reputation + reward.reputation)),
        notifications: [
          ...state.notifications,
          {
            id: generateNotificationId('task_reward'),
            type: 'success',
            message: `任务奖励已领取：+${reward.gold} 金币，声望 +${reward.reputation}`,
            timestamp: Date.now(),
          },
        ],
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

    case 'CLOSE_DAILY_SUMMARY': {
      return {
        ...state,
        dailySummaryOpen: false,
      };
    }

    case 'ADD_MAID_EXPERIENCE': {
      const maid = state.maids.find(m => m.id === action.maidId);
      if (!maid) {
        return state;
      }
      const updatedMaid = addExperience(maid, action.experience);
      return {
        ...state,
        maids: state.maids.map(m => m.id === action.maidId ? updatedMaid : m),
      };
    }

    case 'ADD_NOTIFICATION': {
      // 限制通知数量，最多保留50条
      const maxNotifications = 50;
      const newNotifications = [...state.notifications, action.notification].slice(-maxNotifications);
      return {
        ...state,
        notifications: newNotifications,
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
      // 数据迁移：确保旧版本存档缺失字段有默认值
      const loadedState = action.state;
      
      // 默认运行时数据
      const defaultRuntime = {
        customerSpawnMs: 0,
        customerStatusTicks: {} as Record<string, number>,
        customersServedToday: 0,
        customerStreak: 0,
      };
      
      // 默认新手引导数据
      const defaultGuide = {
        isActive: true,
        currentStep: 'welcome' as GuideStep,
        completedSteps: [] as GuideStep[],
        shownTips: [] as string[],
      };
      
      // 默认统计数据
      const defaultStatistics = {
        totalCustomersServed: 0,
        totalRevenue: 0,
        totalDaysPlayed: 0,
        totalTipsEarned: 0,
        perfectServicesCount: 0,
        maidsHired: 0,
      };
      
      // 默认财务历史
      const defaultFinanceHistory: DailyFinance[] = [];
      
      return {
        ...loadedState,
        // 运行时数据迁移
        runtime: {
          ...defaultRuntime,
          ...loadedState.runtime,
        },
        // 新手引导数据迁移（旧存档可能没有guide系统）
        guide: loadedState.guide ? {
          isActive: loadedState.guide.isActive ?? defaultGuide.isActive,
          currentStep: (loadedState.guide.currentStep as GuideStep) ?? defaultGuide.currentStep,
          completedSteps: (loadedState.guide.completedSteps as GuideStep[]) ?? defaultGuide.completedSteps,
          shownTips: loadedState.guide.shownTips ?? defaultGuide.shownTips,
        } : defaultGuide,
        // 统计数据迁移
        statistics: {
          ...defaultStatistics,
          ...loadedState.statistics,
        },
        // 财务历史迁移
        finance: {
          gold: loadedState.finance?.gold ?? 2000,
          dailyRevenue: loadedState.finance?.dailyRevenue ?? 0,
          dailyExpenses: loadedState.finance?.dailyExpenses ?? 0,
          history: loadedState.finance?.history ?? defaultFinanceHistory,
        },
        // UI状态重置
        dailySummaryOpen: false,
        notifications: loadedState.notifications ?? [],
        // 确保必要字段存在
        selectedMaidId: loadedState.selectedMaidId ?? null,
        selectedCustomerId: loadedState.selectedCustomerId ?? null,
        activePanel: loadedState.activePanel ?? 'cafe',
        activeEvents: loadedState.activeEvents ?? [],
        eventHistory: loadedState.eventHistory ?? [],
      };
    }

    case 'RESET_GAME': {
      return initialGameState;
    }

    // ==================== 新手引导 ====================
    case 'START_GUIDE': {
      return {
        ...state,
        guide: {
          isActive: true,
          currentStep: 'welcome',
          completedSteps: [],
          shownTips: [],
        },
        notifications: [
          ...state.notifications,
          getGuideNotification('welcome'),
        ],
      };
    }

    case 'NEXT_GUIDE_STEP': {
      // 检查是否可以进入下一步
      if (!canAdvanceToNextStep(state)) {
        return state;
      }
      
      const nextConfig = getNextStepConfig(state.guide.currentStep);
      if (!nextConfig) {
        return state;
      }

      return {
        ...state,
        guide: {
          ...state.guide,
          currentStep: nextConfig.step,
        },
        notifications: [
          ...state.notifications,
          getGuideNotification(nextConfig.step),
        ],
      };
    }

    case 'COMPLETE_GUIDE_STEP': {
      const isAlreadyCompleted = state.guide.completedSteps.includes(action.step);
      if (isAlreadyCompleted) {
        return state;
      }

      return {
        ...state,
        guide: {
          ...state.guide,
          completedSteps: [...state.guide.completedSteps, action.step],
        },
      };
    }

    case 'END_GUIDE': {
      return {
        ...state,
        guide: {
          ...state.guide,
          isActive: false,
          currentStep: 'complete',
          completedSteps: [...state.guide.completedSteps, 'complete'],
        },
      };
    }

    case 'ADD_SHOWN_TIP': {
      if (state.guide.shownTips.includes(action.tipId)) {
        return state;
      }

      return {
        ...state,
        guide: {
          ...state.guide,
          shownTips: [...state.guide.shownTips, action.tipId],
        },
      };
    }

    case 'SKIP_GUIDE': {
      return {
        ...state,
        guide: {
          isActive: false,
          currentStep: 'complete',
          completedSteps: GUIDE_STEPS.map(s => s.step),
          shownTips: [],
        },
      };
    }

    default:
      return state;
  }
}

export default gameReducer;
