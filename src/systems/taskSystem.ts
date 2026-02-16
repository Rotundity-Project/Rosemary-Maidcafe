import { Task, TaskReward } from '@/types';
import { createInitialTasks } from '@/data/tasks';

export type TaskEvent =
  | { type: 'serve_customers'; amount: number }
  | { type: 'serve_vip'; amount: number }
  | { type: 'earn_gold'; amount: number }
  | { type: 'earn_tips'; amount: number }
  | { type: 'hire_maids'; amount: number }
  | { type: 'unlock_menu_items'; amount: number }
  | { type: 'upgrade_cafe'; level: number }
  | { type: 'maintain_satisfaction'; value: number }
  | { type: 'total_revenue'; amount: number }
  | { type: 'total_customers'; amount: number };

export function refreshDailyTasks(existing: Task[], day: number): Task[] {
  const growthTasks = existing.filter(t => t.type === 'growth');
  const fresh = createInitialTasks(day).filter(t => t.type === 'daily');
  return [...fresh, ...growthTasks];
}

export function applyTaskEvent(tasks: Task[], event: TaskEvent): Task[] {
  return tasks.map(task => {
    if (task.completed) {
      return task;
    }

    // 检查事件类型是否匹配任务条件类型
    const isMatch = checkEventMatch(task.condition.type, event.type);
    if (!isMatch) {
      return task;
    }

    let nextProgress = task.progress;
    
    switch (event.type) {
      case 'upgrade_cafe':
        nextProgress = Math.max(nextProgress, event.level);
        break;
      case 'maintain_satisfaction':
        // 满意度任务：取最高值
        nextProgress = Math.max(nextProgress, event.value);
        break;
      case 'total_revenue':
      case 'total_customers':
        // 累计任务：取最高值
        nextProgress = Math.max(nextProgress, event.amount);
        break;
      default:
        nextProgress = task.progress + event.amount;
    }

    const clamped = Math.min(nextProgress, task.condition.target);
    const completed = clamped >= task.condition.target;
    return {
      ...task,
      progress: clamped,
      completed,
    };
  });
}

// 检查事件类型是否与任务条件匹配
function checkEventMatch(conditionType: string, eventType: string): boolean {
  // 精确匹配
  if (conditionType === eventType) {
    return true;
  }
  
  // 特殊条件类型的匹配逻辑
  const conditionMappings: Record<string, string[]> = {
    total_revenue: ['earn_gold'], // 赚钱时也计入累计收入
    total_customers: ['serve_customers', 'serve_vip'], // 服务顾客时也计入累计顾客
  };
  
  return conditionMappings[conditionType]?.includes(eventType) ?? false;
}

export function claimTaskReward(tasks: Task[], taskId: string): { tasks: Task[]; reward: TaskReward | null } {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.completed || task.claimed) {
    return { tasks, reward: null };
  }

  const nextTasks = tasks.map(t => t.id === taskId ? { ...t, claimed: true } : t);
  return { tasks: nextTasks, reward: task.reward };
}

