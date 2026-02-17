/**
 * 新手引导系统
 * 负责管理引导步骤、检测引导条件、生成提示信息
 */

import { GameState, GuideStep, GuideState, Notification } from '@/types';
import { generateId, generateNotificationId } from '@/utils';

// 引导步骤配置
export interface GuideStepConfig {
  step: GuideStep;
  title: string;
  description: string;
  highlightPanel?: string;  // 需要高亮的面板
  requiredCondition?: (state: GameState) => boolean;  // 进入步骤的条件
  autoAdvance?: boolean;  // 是否自动推进
}

// 引导步骤配置
export const GUIDE_STEPS: GuideStepConfig[] = [
  {
    step: 'welcome',
    title: '欢迎来到迷迭香咖啡厅',
    description: '恭喜您成为新任店长！这是一个温馨的女仆咖啡厅模拟经营游戏。让我带您熟悉一下基本操作。',
    highlightPanel: undefined,
    autoAdvance: false,
  },
  {
    step: 'hire_first_maid',
    title: '雇佣第一名女仆',
    description: '咖啡厅需要员工才能运营。点击"女仆"面板，然后雇佣一名女仆开始您的经营之旅。',
    highlightPanel: 'maids',
    requiredCondition: (state) => state.maids.length >= 1,
    autoAdvance: true,
  },
  {
    step: 'assign_maid_role',
    title: '分配女仆角色',
    description: '为您的女仆分配合适的角色。接待员负责迎接顾客，服务员负责点餐配送，咖啡师负责制作饮品。',
    highlightPanel: 'maids',
    requiredCondition: (state) => state.maids.some(m => m.role !== null && m.status.isWorking),
    autoAdvance: true,
  },
  {
    step: 'start_business',
    title: '开始营业',
    description: '点击右上角的播放按钮开始营业！顾客会陆续到来，女仆会自动服务他们。',
    highlightPanel: undefined,
    requiredCondition: (state) => !state.isPaused,
    autoAdvance: true,
  },
  {
    step: 'serve_first_customer',
    title: '服务第一位顾客',
    description: '顾客到来后，女仆会自动提供服务。服务完成后您会获得金币和声望。',
    highlightPanel: 'cafe',
    requiredCondition: (state) => state.statistics.totalCustomersServed >= 1,
    autoAdvance: true,
  },
  {
    step: 'check_finance',
    title: '查看财务状况',
    description: '点击"财务"面板可以查看收入支出情况。合理管理财务是经营的关键！',
    highlightPanel: 'finance',
    requiredCondition: (state) => state.activePanel === 'finance',
    autoAdvance: true,
  },
  {
    step: 'upgrade_facility',
    title: '升级设施',
    description: '点击"设施"面板可以升级咖啡厅。升级可以增加座位、吸引更多顾客！',
    highlightPanel: 'facility',
    requiredCondition: (state) => state.facility.cafeLevel >= 2,
    autoAdvance: true,
  },
  {
    step: 'complete',
    title: '引导完成',
    description: '恭喜您已经掌握了基本操作！现在您可以自由经营您的咖啡厅了。祝您生意兴隆！',
    highlightPanel: undefined,
    autoAdvance: false,
  },
];

// 获取当前步骤配置
export function getCurrentStepConfig(state: GameState): GuideStepConfig | null {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
  // 空值检查：如果没有引导状态，返回null
  if (!state.guide || !state.guide.currentStep) {
    return null;
  }
>>>>>>> origin/main
>>>>>>> origin/main
>>>>>>> origin/main
  const currentStep = state.guide.currentStep;
  return GUIDE_STEPS.find(s => s.step === currentStep) || null;
}

// 获取下一步配置
export function getNextStepConfig(currentStep: GuideStep): GuideStepConfig | null {
  const currentIndex = GUIDE_STEPS.findIndex(s => s.step === currentStep);
  if (currentIndex === -1 || currentIndex >= GUIDE_STEPS.length - 1) return null;
  return GUIDE_STEPS[currentIndex + 1];
}

// 检查是否可以进入下一步
export function canAdvanceToNextStep(state: GameState): boolean {
  const currentConfig = getCurrentStepConfig(state);
  if (!currentConfig || !currentConfig.requiredCondition) return true;
  return currentConfig.requiredCondition(state);
}

// 获取引导进度百分比
export function getGuideProgress(state: GameState): number {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
  // 空值检查
  if (!state.guide || !state.guide.completedSteps) {
    return 0;
  }
>>>>>>> origin/main
>>>>>>> origin/main
>>>>>>> origin/main
  const completedSteps = state.guide.completedSteps.length;
  const totalSteps = GUIDE_STEPS.length - 1; // 排除complete步骤
  return Math.min(100, Math.round((completedSteps / totalSteps) * 100));
}

// 判断是否应该显示引导气泡
export function shouldShowGuideBubble(state: GameState): boolean {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
  // 空值检查
  if (!state.guide) {
    return false;
  }
>>>>>>> origin/main
>>>>>>> origin/main
>>>>>>> origin/main
  return state.guide.isActive && state.guide.currentStep !== 'complete';
}

// 提示配置
export interface TipConfig {
  id: string;
  message: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  targetElement?: string;  // CSS选择器
  condition?: (state: GameState) => boolean;
}

// 游戏内提示配置
export const GAME_TIPS: TipConfig[] = [
  {
    id: 'pause_button',
    message: '点击这里暂停/继续游戏',
    position: 'bottom',
    targetElement: '[data-speed-control]',
    condition: (state) => state.guide.isActive,
  },
  {
    id: 'time_display',
    message: '当前时间是 {time}，营业时间为 9:00-21:00',
    position: 'top',
    targetElement: '[data-time-display]',
  },
  {
    id: 'gold_display',
    message: '这是您的金币余额',
    position: 'bottom',
    targetElement: '[data-gold-display]',
  },
  {
    id: 'maid_energy',
    message: '女仆体力过低时记得让她休息',
    position: 'top',
    targetElement: '[data-maid-stamina]',
    condition: (state) => state.maids.some(m => m.stamina < 30),
  },
  {
    id: 'customer_patience',
    message: '顾客耐心有限，尽快服务可以获得更多小费',
    position: 'right',
    targetElement: '[data-customer-patience]',
    condition: (state) => state.customers.some(c => c.patience < 50),
  },
];

// 获取当前应该显示的提示
export function getActiveTip(state: GameState): TipConfig | null {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> origin/main
>>>>>>> origin/main
  if (!state.guide.isActive) return null;
  
  for (const tip of GAME_TIPS) {
    // 检查是否已经显示过
    if (state.guide.shownTips.includes(tip.id)) continue;
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
  // 空值检查
  if (!state.guide || !state.guide.isActive) return null;
  
  for (const tip of GAME_TIPS) {
    // 检查是否已经显示过
    if (state.guide.shownTips?.includes(tip.id)) continue;
>>>>>>> origin/main
>>>>>>> origin/main
>>>>>>> origin/main
    
    // 检查条件
    if (tip.condition && !tip.condition(state)) continue;
    
    return tip;
  }
  
  return null;
}

// 引导通知消息
export function getGuideNotification(step: GuideStep): Notification {
  const config = GUIDE_STEPS.find(s => s.step === step);
  if (!config) {
    return {
      id: generateNotificationId('guide'),
      type: 'info',
      message: '引导开始',
      timestamp: Date.now(),
    };
  }
  
  return {
    id: generateNotificationId('guide'),
    type: 'info',
    message: config.title,
    timestamp: Date.now(),
  };
}
