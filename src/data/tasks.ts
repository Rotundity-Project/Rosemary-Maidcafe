import { Task } from '@/types';

const taskTemplates: Omit<Task, 'progress' | 'completed' | 'claimed' | 'dayAssigned'>[] = [
  {
    id: 'daily_serve_5',
    name: '今日招待',
    description: '服务 5 位顾客',
    type: 'daily',
    condition: { type: 'serve_customers', target: 5 },
    reward: { gold: 200, reputation: 1 },
  },
  {
    id: 'daily_gold_500',
    name: '营业额目标',
    description: '赚取 500 金币',
    type: 'daily',
    condition: { type: 'earn_gold', target: 500 },
    reward: { gold: 250, reputation: 1 },
  },
  {
    id: 'growth_hire_3',
    name: '扩充团队',
    description: '累计雇佣 3 名女仆',
    type: 'growth',
    condition: { type: 'hire_maids', target: 3 },
    reward: { gold: 600, reputation: 2 },
  },
  {
    id: 'growth_unlock_5',
    name: '丰富菜单',
    description: '累计解锁 5 个菜单项',
    type: 'growth',
    condition: { type: 'unlock_menu_items', target: 5 },
    reward: { gold: 800, reputation: 3 },
  },
  {
    id: 'growth_upgrade_3',
    name: '升级店铺',
    description: '将咖啡厅升级到 3 级',
    type: 'growth',
    condition: { type: 'upgrade_cafe', target: 3 },
    reward: { gold: 1200, reputation: 4 },
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

