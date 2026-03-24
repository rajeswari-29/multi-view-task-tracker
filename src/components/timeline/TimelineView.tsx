import { useMemo, useRef } from 'react'
import type { PriorityId, Task } from '../../types/task'
import {
  addDaysUTC,
  diffInDaysUTC,
  endOfMonthUTC,
  formatDueLabel,
  isoTodayUTC,
  isIsoAfterUTC,
  isIsoBeforeUTC,
  parseIsoDateUTC,
  startOfMonthUTC,
  toIsoDateUTC,
} from '../../lib/date'
import { PresenceAvatars } from '../common/PresenceAvatars'
import { useVirtualList } from '../../hooks/useVirtualList'

import { EmptyState } from '../common/EmptyState'

type PresenceData = {
  otherUsers: Array<{ id: string; name: string; color: string; taskId: string | null }>
  leavingTokens: Array<{ userId: string; userName: string; color: string; taskId: string; expiresAt: number }>
  justMovedAt: Record<string, number>
  nowMs: number
  enterMs: number
}

const dayWidth = 28
const rowHeight = 26
const barHeight = 14

function clampIso(d: string, min: string, max: string) {
  if (isIsoBeforeUTC(d, min)) return min
  if (isIsoAfterUTC(d, max)) return max
  return d
}

function barColor(priority: PriorityId) {
  switch (priority) {
    case 'critical':
      return '#ef4444'
    case 'high':
      return '#f97316'
    case 'medium':
      return '#eab308'
    case 'low':
      return '#38bdf8'
  }
}

export function TimelineView(props: {
  tasks: Task[]
  presence: PresenceData
  canClearFilters: boolean
  onClearFilters: () => void
}) {
  const { tasks, presence, canClearFilters, onClearFilters } = props

  const monthAxis = useMemo(() => {
    const now = parseIsoDateUTC(isoTodayUTC())
    const monthStart = startOfMonthUTC(now)
    const monthEnd = endOfMonthUTC(now)
    const monthStartIso = toIsoDateUTC(monthStart)
    const monthEndIso = toIsoDateUTC(monthEnd)

    const totalDays = diffInDaysUTC(monthStartIso, monthEndIso) + 1
    const todayIndex = diffInDaysUTC(monthStartIso, isoTodayUTC())

    return { monthStartIso, monthEndIso, totalDays, todayIndex }
  }, [])

  const containerRef = useRef<HTMLDivElement>(null)
  const virtual = useVirtualList({
    count: tasks.length,
    rowHeight,
    overscan: 5,
    containerRef,
  })

  const visibleTasks = tasks.slice(virtual.startIndex, virtual.endIndex + 1)

  if (tasks.length === 0) {
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

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b bg-slate-50 px-4 py-3">
        <div className="text-sm font-semibold text-slate-800">
          Timeline (this month)
        </div>
        <div className="text-xs font-medium text-slate-500">
          Today: {formatDueLabel(isoTodayUTC())}
        </div>
      </div>

      <div className="max-h-[640px] overflow-x-auto overflow-y-auto" ref={containerRef}>
        <div
          className="relative"
          style={{
            width: monthAxis.totalDays * dayWidth,
            minWidth: monthAxis.totalDays * dayWidth,
            height: virtual.totalHeight,
          }}
        >
          {/* Day axis */}
          <div className="sticky left-0 top-0 z-10 h-10 border-b bg-slate-50">
            {Array.from({ length: monthAxis.totalDays }).map((_, i) => {
              // Label weekly to avoid clutter
              const showLabel = i % 7 === 0 || i === monthAxis.totalDays - 1
              return (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-slate-200"
                  style={{ left: i * dayWidth, width: 1 }}
                >
                  {showLabel ? (
                    <span
                      className="absolute left-1 top-2 text-[10px] font-semibold text-slate-600"
                      style={{ width: dayWidth }}
                    >
                      {new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(
                        parseIsoDateUTC(addDaysUTC(monthAxis.monthStartIso, i)),
                      )}
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>

          {/* Today marker */}
          <div
            className="absolute top-10 z-20 h-[20px] w-px bg-red-500"
            style={{ left: monthAxis.todayIndex * dayWidth }}
          />
          <div
            className="absolute top-10 z-10 bottom-0 w-px bg-red-500/20"
            style={{ left: monthAxis.todayIndex * dayWidth }}
          />

          <div
            className="relative"
            style={{
              height: virtual.totalHeight,
            }}
          >
            <div
              style={{
                transform: `translateY(${virtual.startIndex * rowHeight}px)`,
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
              }}
            >
              {visibleTasks.map((task, visibleIndex) => {
                const absoluteIndex = virtual.startIndex + visibleIndex
                const startIso = task.startDate ?? task.dueDate
                const endIso = task.dueDate
                const startClamped = clampIso(startIso, monthAxis.monthStartIso, monthAxis.monthEndIso)
                const endClamped = clampIso(endIso, monthAxis.monthStartIso, monthAxis.monthEndIso)

                const leftDays = diffInDaysUTC(monthAxis.monthStartIso, startClamped)
                const widthDays = Math.max(0, diffInDaysUTC(startClamped, endClamped)) + 1
                const leftPx = leftDays * dayWidth
                const widthPx = Math.max(dayWidth, widthDays * dayWidth)

                const topPx = absoluteIndex * rowHeight + (rowHeight - barHeight) / 2

                return (
                  <div
                    key={task.id}
                    className="absolute z-10"
                    style={{ left: leftPx, top: topPx, width: widthPx, height: barHeight }}
                  >
                    <div
                      className="h-full rounded-md"
                      style={{
                        background: barColor(task.priority),
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                      }}
                      title={`${task.title}\nDue: ${formatDueLabel(task.dueDate)}`}
                    />

                    <div className="absolute -top-5 right-0">
                      <PresenceAvatars
                        taskId={task.id}
                        otherUsers={presence.otherUsers}
                        leavingTokens={presence.leavingTokens}
                        justMovedAt={presence.justMovedAt}
                        nowMs={presence.nowMs}
                        enterMs={presence.enterMs}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

