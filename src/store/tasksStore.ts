import { create } from 'zustand'
import type { StatusId, Task } from '../types/task'
import { generateTasks } from '../data/seedTasks'

const INITIAL_TASKS = generateTasks(500, 42)

type TasksState = {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  updateTaskStatus: (taskId: string, status: StatusId) => void
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: INITIAL_TASKS,
  setTasks: (tasks) => set({ tasks }),
  updateTaskStatus: (taskId, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),
}))

