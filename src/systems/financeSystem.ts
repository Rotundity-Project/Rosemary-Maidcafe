import { Finance, DailyFinance, Maid, Facility } from '@/types';

// 基础日常开支常量
const BASE_RENT = 100;           // 基础租金
const BASE_UTILITIES = 50;       // 基础水电费
const MAID_DAILY_WAGE = 30;      // 女仆日薪基础
const MAID_LEVEL_WAGE_BONUS = 5; // 每级额外工资

/**
 * 添加收入到财务记录
 * 同时增加金币和日收入
 * Requirements: 5.1, 5.2
 */
export function addRevenue(finance: Finance, amount: number): Finance {
  if (amount < 0) {
    return finance;
  }
  
  return {
    ...finance,
    gold: finance.gold + amount,
    dailyRevenue: finance.dailyRevenue + amount,
  };
}

/**
 * 添加支出到财务记录
 * 只增加日支出记录，不扣除金币
 * Requirements: 5.1, 5.2
 */
export function addExpense(finance: Finance, amount: number): Finance {
  if (amount < 0) {
    return finance;
  }
  
  return {
    ...finance,
    dailyExpenses: finance.dailyExpenses + amount,
  };
}

/**
 * 扣除金币
 * 直接从金币余额中扣除
 * Requirements: 5.3, 5.5
 */
export function deductGold(finance: Finance, amount: number): Finance {
  if (amount < 0) {
    return finance;
  }
  
  return {
    ...finance,
    gold: Math.max(0, finance.gold - amount),
  };
}

/**
 * 计算日常运营成本
 * 包括租金、水电费、女仆工资
 * Requirements: 5.4
 */
export function calculateDailyOperatingCost(maids: Maid[], facility: Facility): number {
  // 基础租金随咖啡厅等级增加
  const rent = BASE_RENT * facility.cafeLevel;
  
  // 水电费随座位数增加
  const utilities = BASE_UTILITIES + (facility.maxSeats * 5);
  
  // 女仆工资：基础工资 + 等级加成
  const maidWages = maids.reduce((total, maid) => {
    const wage = MAID_DAILY_WAGE + (maid.level - 1) * MAID_LEVEL_WAGE_BONUS;
    return total + wage;
  }, 0);
  
  // 设备维护费用（每个设备等级 * 5）
  const equipmentMaintenance = facility.equipment.reduce((total, eq) => {
    return total + eq.level * 5;
  }, 0);
  
  return rent + utilities + maidWages + equipmentMaintenance;
}

/**
 * 处理日结
 * 将当日财务记录添加到历史，重置日收支
 * Requirements: 5.4, 5.6
 */
export function processEndOfDay(finance: Finance, day: number): Finance {
  const dailyRecord: DailyFinance = {
    day,
    revenue: finance.dailyRevenue,
    expenses: finance.dailyExpenses,
    profit: finance.dailyRevenue - finance.dailyExpenses,
  };
  
  // 保留最近7天的历史记录
  const newHistory = [...finance.history, dailyRecord].slice(-7);
  
  return {
    ...finance,
    dailyRevenue: 0,
    dailyExpenses: 0,
    history: newHistory,
  };
}

/**
 * 检查是否能支付指定金额
 * Requirements: 5.5
 */
export function canAfford(gold: number, cost: number): boolean {
  return gold >= cost;
}

/**
 * 获取财务警告状态
 * 当金币余额为负或接近零时返回警告
 * Requirements: 5.5
 */
export function getFinanceWarning(finance: Finance): string | null {
  if (finance.gold < 0) {
    return '警告：金币余额为负！部分功能已被限制。';
  }
  if (finance.gold < 100) {
    return '注意：金币余额不足，请注意收支平衡。';
  }
  return null;
}

/**
 * 计算利润率
 * 用于财务面板显示
 */
export function calculateProfitMargin(revenue: number, expenses: number): number {
  if (revenue === 0) {
    return 0;
  }
  return ((revenue - expenses) / revenue) * 100;
}

/**
 * 获取历史财务趋势
 * 返回最近几天的利润趋势
 */
export function getFinanceTrend(history: DailyFinance[]): 'up' | 'down' | 'stable' {
  if (history.length < 2) {
    return 'stable';
  }
  
  const recent = history.slice(-3);
  const profits = recent.map(d => d.profit);
  
  const avgChange = profits.slice(1).reduce((sum, profit, i) => {
    return sum + (profit - profits[i]);
  }, 0) / (profits.length - 1);
  
  if (avgChange > 10) {
    return 'up';
  }
  if (avgChange < -10) {
    return 'down';
  }
  return 'stable';
}

/**
 * 计算总收入（从历史记录）
 */
export function calculateTotalRevenue(history: DailyFinance[]): number {
  return history.reduce((total, day) => total + day.revenue, 0);
}

/**
 * 计算总支出（从历史记录）
 */
export function calculateTotalExpenses(history: DailyFinance[]): number {
  return history.reduce((total, day) => total + day.expenses, 0);
}

/**
 * 计算平均日利润
 */
export function calculateAverageDailyProfit(history: DailyFinance[]): number {
  if (history.length === 0) {
    return 0;
  }
  const totalProfit = history.reduce((total, day) => total + day.profit, 0);
  return totalProfit / history.length;
}
