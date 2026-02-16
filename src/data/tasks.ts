import { Task } from '@/types';

const taskTemplates: Omit<Task, 'progress' | 'completed' | 'claimed' | 'dayAssigned'>[] = [
  // 每日任务 - 服务类
  {
    id: 'daily_serve_5',
    name: '今日招待',
    description: '服务 5 位顾客',
    type: 'daily',
    condition: { type: 'serve_customers', target: 5 },
    reward: { gold: 200, reputation: 1 },
  },
  {
    id: 'daily_serve_10',
    name: '生意兴隆',
    description: '服务 10 位顾客',
    type: 'daily',
    condition: { type: 'serve_customers', target: 10 },
    reward: { gold: 400, reputation: 2 },
  },
  // 每日任务 - 收入类
  {
    id: 'daily_gold_500',
    name: '营业额目标',
    description: '赚取 500 金币',
    type: 'daily',
    condition: { type: 'earn_gold', target: 500 },
    reward: { gold: 250, reputation: 1 },
  },
  {
    id: 'daily_gold_1000',
    name: '日进斗金',
    description: '赚取 1000 金币',
    type: 'daily',
    condition: { type: 'earn_gold', target: 1000 },
    reward: { gold: 500, reputation: 2 },
  },
  // 每日任务 - 小费类
  {
    id: 'daily_tips_100',
    name: '小费达人',
    description: '获得 100 金币小费',
    type: 'daily',
    condition: { type: 'earn_tips', target: 100 },
    reward: { gold: 150, reputation: 1 },
  },
  // 每日任务 - 满意度类
  {
    id: 'daily_satisfaction_80',
    name: '顾客至上',
    description: '服务满意度达到 80% 以上',
    type: 'daily',
    condition: { type: 'maintain_satisfaction', target: 80 },
    reward: { gold: 300, reputation: 2 },
  },
  // 每日任务 - VIP服务
  {
    id: 'daily_serve_vip',
    name: 'VIP服务',
    description: '服务 2 位 VIP 顾客',
    type: 'daily',
    condition: { type: 'serve_vip', target: 2 },
    reward: { gold: 400, reputation: 3 },
  },
  // 成长任务 - 女仆招募
  {
    id: 'growth_hire_3',
    name: '扩充团队',
    description: '累计雇佣 3 名女仆',
    type: 'growth',
    condition: { type: 'hire_maids', target: 3 },
    reward: { gold: 600, reputation: 2 },
  },
  {
    id: 'growth_hire_5',
    name: '女仆军团',
    description: '累计雇佣 5 名女仆',
    type: 'growth',
    condition: { type: 'hire_maids', target: 5 },
    reward: { gold: 1200, reputation: 4 },
  },
  // 成长任务 - 菜单解锁
  {
    id: 'growth_unlock_5',
    name: '丰富菜单',
    description: '累计解锁 5 个菜单项',
    type: 'growth',
    condition: { type: 'unlock_menu_items', target: 5 },
    reward: { gold: 800, reputation: 3 },
  },
  {
    id: 'growth_unlock_10',
    name: 'Menu Master',
    description: '累计解锁 10 个菜单项',
    type: 'growth',
    condition: { type: 'unlock_menu_items', target: 10 },
    reward: { gold: 1500, reputation: 5 },
  },
  // 成长任务 - 店铺升级
  {
    id: 'growth_upgrade_3',
    name: '升级店铺',
    description: '将咖啡厅升级到 3 级',
    type: 'growth',
    condition: { type: 'upgrade_cafe', target: 3 },
    reward: { gold: 1200, reputation: 4 },
  },
  {
    id: 'growth_upgrade_5',
    name: '知名咖啡厅',
    description: '将咖啡厅升级到 5 级',
    type: 'growth',
    condition: { type: 'upgrade_cafe', target: 5 },
    reward: { gold: 2500, reputation: 6 },
  },
  // 成长任务 - 累计收入
  {
    id: 'growth_total_revenue_10000',
    name: '万元户',
    description: '累计收入达到 10000 金币',
    type: 'growth',
    condition: { type: 'total_revenue', target: 10000 },
    reward: { gold: 2000, reputation: 5 },
  },
  // 成长任务 - 累计顾客
  {
    id: 'growth_total_customers_50',
    name: '人气咖啡厅',
    description: '累计服务 50 位顾客',
    type: 'growth',
    condition: { type: 'total_customers', target: 50 },
    reward: { gold: 1500, reputation: 4 },
  },
];

export function createInitialTasks(day: number): Task[] {
  return taskTemplates.map(t => ({
    ...t,
    progress: 0,
    completed: false,
    claimed: false,
    dayAssigned: day,
  }));
}

export const defaultTasks = createInitialTasks(1);

