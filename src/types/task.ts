export type StatusId = 'todo' | 'inprogress' | 'inreview' | 'done'

export const STATUS_META: Record<
  StatusId,
  { label: string; columnClass: string }
> = {
  todo: { label: 'To Do', columnClass: 'bg-slate-50' },
  inprogress: { label: 'In Progress', columnClass: 'bg-amber-50' },
  inreview: { label: 'In Review', columnClass: 'bg-fuchsia-50' },
  done: { label: 'Done', columnClass: 'bg-emerald-50' },
}

export const STATUS_ORDER: StatusId[] = [
  'todo',
  'inprogress',
  'inreview',
  'done',
]

export type PriorityId = 'critical' | 'high' | 'medium' | 'low'

export const PRIORITY_META: Record<
  PriorityId,
  { label: string; color: string; border: string; text: string; sortRank: number }
> = {
  critical: {
    label: 'Critical',
    color: 'bg-red-500',
    border: 'border-red-600',
    text: 'text-red-900',
    sortRank: 0,
  },
  high: {
    label: 'High',
    color: 'bg-orange-500',
    border: 'border-orange-600',
    text: 'text-orange-900',
    sortRank: 1,
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500',
    border: 'border-yellow-600',
    text: 'text-yellow-900',
    sortRank: 2,
  },
  low: {
    label: 'Low',
    color: 'bg-sky-500',
    border: 'border-sky-600',
    text: 'text-sky-900',
    sortRank: 3,
  },
}

export interface User {
  id: string
  name: string
}

export interface Task {
  id: string
  title: string
  assigneeId: string
  priority: PriorityId
  status: StatusId
  startDate: string | null // ISO date: YYYY-MM-DD
  dueDate: string // ISO date: YYYY-MM-DD
}

