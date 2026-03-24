import { useMemo, useRef, useState } from 'react'
import { useTasksStore } from '../../store/tasksStore'
import { formatDueLabel, isDueOverdue } from '../../lib/date'
import { AssigneeAvatar } from '../common/AssigneeAvatar'
import { PriorityBadge } from '../common/PriorityBadge'
import { PRIORITY_META } from '../../types/task'
import type { PriorityId, StatusId, Task } from '../../types/task'
import { StatusDropdown } from './StatusDropdown'
import { useVirtualList } from '../../hooks/useVirtualList'
import { EmptyState } from '../common/EmptyState'
import { cn } from '../../lib/classNames'

type SortKey = 'title' | 'priority' | 'due'
type SortDir = 'asc' | 'desc'

function comparePriority(a: PriorityId, b: PriorityId) {
  return PRIORITY_META[a].sortRank - PRIORITY_META[b].sortRank
}

export function ListView(props: {
  tasks: Task[]
  assigneeNamesById: Record<string, string>
  rowHeight?: number
  bufferRows?: number
  canClearFilters: boolean
  onClearFilters: () => void
}) {
  const { tasks, assigneeNamesById, canClearFilters, onClearFilters } = props
  const { updateTaskStatus } = useTasksStore()

  const rowHeight = props.rowHeight ?? 56
  const bufferRows = props.bufferRows ?? 5

  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const sorted = useMemo(() => {
    const copy = [...tasks]
    const dir = sortDir === 'asc' ? 1 : -1

    copy.sort((a, b) => {
      if (sortKey === 'title') return a.title.localeCompare(b.title) * dir
      if (sortKey === 'priority') return comparePriority(a.priority, b.priority) * dir
      return a.dueDate.localeCompare(b.dueDate) * dir
    })
    return copy
  }, [tasks, sortDir, sortKey])

  const containerRef = useRef<HTMLDivElement>(null)
  const virtual = useVirtualList({
    count: sorted.length,
    rowHeight,
    overscan: bufferRows,
    containerRef,
  })

  const visible = sorted.length
    ? sorted.slice(virtual.startIndex, virtual.endIndex + 1)
    : []

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <EmptyState
          title="No tasks match your filters"
          description="Try widening the filters or clearing them."
          actionLabel={canClearFilters ? 'Clear filters' : undefined}
          onAction={canClearFilters ? onClearFilters : undefined}
        />
      </div>
    )
  }

  const headerCell = (props: { label: string; k: SortKey; align?: 'left' | 'right' | 'center' }) => {
    const active = props.k === sortKey
    const arrow = active ? (sortDir === 'asc' ? '▲' : '▼') : '↕'
    return (
      <button
        type="button"
        onClick={() => {
          if (props.k === sortKey) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
          } else {
            setSortKey(props.k)
            setSortDir('asc')
          }
        }}
        className={cn(
          'flex w-full items-center justify-between gap-2 text-left text-sm font-semibold',
          'hover:text-slate-900',
          active ? 'text-slate-900' : 'text-slate-600',
        )}
      >
        <span>{props.label}</span>
        <span className="text-xs text-slate-500">{arrow}</span>
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="grid grid-cols-[minmax(220px,1fr)_150px_150px_170px_220px] gap-2 border-b bg-slate-50 px-3 py-3">
        <div>{headerCell({ label: 'Title', k: 'title' })}</div>
        <div>{headerCell({ label: 'Priority', k: 'priority' })}</div>
        <div>{headerCell({ label: 'Due Date', k: 'due' })}</div>
        <div className="text-sm font-semibold text-slate-600">Assignee</div>
        <div className="text-sm font-semibold text-slate-600">Status</div>
      </div>

      <div ref={containerRef} className="h-[620px] overflow-y-auto">
        <div style={{ height: virtual.totalHeight, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              transform: `translateY(${virtual.startIndex * rowHeight}px)`,
            }}
          >
            {visible.map((task) => {
              const overdue = isDueOverdue(task.dueDate)
              const dueLabel = formatDueLabel(task.dueDate)
              return (
                <div
                  key={task.id}
                  className="grid grid-cols-[minmax(220px,1fr)_150px_150px_170px_220px] items-center gap-2 border-b px-3"
                  style={{ height: rowHeight }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{task.title}</div>
                  </div>
                  <div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <div className={cn('text-sm font-semibold', overdue ? 'text-red-600' : 'text-slate-700')}>
                    {dueLabel}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <AssigneeAvatar name={assigneeNamesById[task.assigneeId] ?? 'Unknown'} />
                    <span className="truncate text-sm text-slate-700">
                      {assigneeNamesById[task.assigneeId] ?? 'Unknown'}
                    </span>
                  </div>
                  <div className="px-0.5">
                    <StatusDropdown
                      value={task.status}
                      onChange={(next: StatusId) => updateTaskStatus(task.id, next)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

