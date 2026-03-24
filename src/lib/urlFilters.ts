import type { PriorityId, StatusId } from '../types/task'

export type FiltersState = {
  status: StatusId[]
  priority: PriorityId[]
  assignees: string[]
  dueFrom: string | null // ISO YYYY-MM-DD
  dueTo: string | null // ISO YYYY-MM-DD
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function splitCsv(value: string | null) {
  if (!value) return []
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

export function filtersToQueryParams(filters: FiltersState) {
  const params = new URLSearchParams()
  if (filters.status.length) params.set('status', filters.status.join(','))
  if (filters.priority.length) params.set('priority', filters.priority.join(','))
  if (filters.assignees.length) params.set('assignee', filters.assignees.join(','))
  if (filters.dueFrom) params.set('from', filters.dueFrom)
  if (filters.dueTo) params.set('to', filters.dueTo)
  return params
}

export function parseFiltersFromQueryParams(sp: URLSearchParams): FiltersState {
  const rawStatus = splitCsv(sp.get('status'))
  const rawPriority = splitCsv(sp.get('priority'))
  const rawAssignees = splitCsv(sp.get('assignee'))
  const dueFrom = sp.get('from')
  const dueTo = sp.get('to')

  const validStatus = new Set<StatusId>(['todo', 'inprogress', 'inreview', 'done'])
  const validPriority = new Set<PriorityId>([
    'critical',
    'high',
    'medium',
    'low',
  ])

  return {
    status: rawStatus.filter((s) => validStatus.has(s as StatusId)) as StatusId[],
    priority: rawPriority.filter((p) => validPriority.has(p as PriorityId)) as PriorityId[],
    assignees: rawAssignees,
    dueFrom: dueFrom && ISO_DATE_RE.test(dueFrom) ? dueFrom : null,
    dueTo: dueTo && ISO_DATE_RE.test(dueTo) ? dueTo : null,
  }
}

export function hasAnyFilter(filters: FiltersState) {
  return (
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.assignees.length > 0 ||
    Boolean(filters.dueFrom) ||
    Boolean(filters.dueTo)
  )
}

