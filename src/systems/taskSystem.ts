import { Task, TaskReward } from '@/types';
import { createInitialTasks } from '@/data/tasks';

export type TaskEvent =
  | { type: 'serve_customers'; amount: number }
  | { type: 'earn_gold'; amount: number }
  | { type: 'hire_maids'; amount: number }
  | { type: 'unlock_menu_items'; amount: number }
  | { type: 'upgrade_cafe'; level: number };

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

    if (task.condition.type !== event.type && !(task.condition.type === 'upgrade_cafe' && event.type === 'upgrade_cafe')) {
      return task;
    }

    let nextProgress = task.progress;
    if (event.type === 'upgrade_cafe') {
      nextProgress = Math.max(nextProgress, event.level);
    } else {
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

export function claimTaskReward(tasks: Task[], taskId: string): { tasks: Task[]; reward: TaskReward | null } {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.completed || task.claimed) {
    return { tasks, reward: null };
  }

  const nextTasks = tasks.map(t => t.id === taskId ? { ...t, claimed: true } : t);
  return { tasks: nextTasks, reward: task.reward };
}

