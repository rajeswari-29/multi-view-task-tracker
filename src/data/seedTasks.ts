import type { PriorityId, StatusId, Task, User } from '../types/task'
import { addDaysUTC, isoTodayUTC } from '../lib/date'

const FIRST_NAMES = ['Ravi', 'Srinu', 'Salma', 'Deena', 'Rajesh', 'Suresh']
const LAST_NAMES = ['Kumar', 'Vas', 'SK', 'Reddy', 'Konne', 'Kumar']

export const ASSIGNEES: User[] = FIRST_NAMES.map((first, i) => ({
  id: `u${i + 1}`,
  name: `${first} ${LAST_NAMES[i] ?? 'Team'}`,
}))

const PRIORITIES: PriorityId[] = ['critical', 'high', 'medium', 'low']
const STATUSES: StatusId[] = ['todo', 'inprogress', 'inreview', 'done']

const TITLE_TEMPLATES = [
  'Finalize {thing} for client',
  'Design {thing} workflow',
  'Resolve {thing} regression',
  'Review {thing} pull request',
  'Implement {thing} improvements',
  'Prepare {thing} release notes',
  'Fix {thing} performance issue',
  'Audit {thing} security checks',
  'Update {thing} documentation',
  'Coordinate {thing} handoff',
]

const THINGS = [
  'authentication',
  'dashboard',
  'billing',
  'onboarding',
  'search',
  'notifications',
  'reporting',
  'inventory',
  'integrations',
  'export',
  'permissions',
  'rate limiting',
]

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min
}

function pick<T>(rng: () => number, arr: T[]) {
  return arr[Math.floor(rng() * arr.length)]
}

function titleForIndex(rng: () => number, i: number) {
  const tpl = pick(rng, TITLE_TEMPLATES)
  const thing = pick(rng, THINGS)
  // Make titles unique but stable
  return tpl.replace('{thing}', thing) + ` #${i + 1}`
}

export function generateTasks(count = 500, seed = 42): Task[] {
  const rng = mulberry32(seed)
  const today = isoTodayUTC()

  const tasks: Task[] = []
  for (let i = 0; i < count; i++) {
    // Force edge cases:
    // - Some tasks overdue > 7 days
    // - Some due today
    // - Some missing start dates
    let dueOffsetDays: number
    if (i % 50 === 0) dueOffsetDays = -randInt(rng, 15, 55)
    else if (i % 37 === 0) dueOffsetDays = 0
    else if (i % 29 === 0) dueOffsetDays = -randInt(rng, 1, 7)
    else if (i % 23 === 0) dueOffsetDays = randInt(rng, -8, -1)
    else dueOffsetDays = randInt(rng, -45, 30)

    const dueDate = addDaysUTC(today, dueOffsetDays)

    const assignee = pick(rng, ASSIGNEES)
    const priority = pick(rng, PRIORITIES)

    const hasStart = i % 13 !== 0 && rng() > 0.18
    const startDate = hasStart
      ? addDaysUTC(dueDate, -randInt(rng, 0, 20))
      : null

    // Status: bias done tasks to older due dates, others spread
    const isLate = dueOffsetDays < 0
    let status: StatusId
    if (isLate && rng() > 0.78) status = 'done'
    else if (!isLate && rng() > 0.74) status = 'todo'
    else status = pick(rng, STATUSES)

    // Ensure the four-column Kanban still has a mix.
    if (i % 97 === 0) status = 'inreview'
    if (i % 81 === 0) status = 'inprogress'
    if (i % 63 === 0) status = 'todo'

    tasks.push({
      id: `t_${i + 1}`,
      title: titleForIndex(rng, i),
      assigneeId: assignee.id,
      priority,
      status,
      startDate,
      dueDate,
    })
  }

  return tasks
}

