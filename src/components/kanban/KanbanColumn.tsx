import type { RefObject } from 'react'
import type { StatusId, Task } from '../../types/task'
import { EmptyState } from '../common/EmptyState'
import { TaskCard } from './TaskCard'
import { useVirtualList } from '../../hooks/useVirtualList'
import { memo } from 'react'

type DragStateLike = {
  taskId: string
  fromStatus: StatusId
  fromIndex: number
  cardHeight: number
  activeDropStatus: StatusId | null
} | null

export const KanbanColumn = memo(function KanbanColumn(props: {
  status: StatusId
  tasks: Task[]
  statusLabel: string
  statusColumnClass: string
  assigneeNamesById: Record<string, string>
  columnBodyRef: RefObject<HTMLDivElement | null>
  activeDropStatus: StatusId | null
  drag: DragStateLike
  enterMs: number
  otherUsers: Array<{ id: string; name: string; color: string; taskId: string | null }>
  leavingTokens: Array<{ userId: string; userName: string; color: string; taskId: string; expiresAt: number }>
  justMovedAt: Record<string, number>
  nowMs: number
  onStartDrag: (args: { task: Task; fromStatus: StatusId; fromIndex: number; cardEl: HTMLElement; clientX: number; clientY: number }) => void
}) {
  const {
    status,
    tasks,
    statusLabel,
    statusColumnClass,
    assigneeNamesById,
    columnBodyRef,
    activeDropStatus,
    drag,
    onStartDrag,
  } = props

  const isDragOver = activeDropStatus === status
  const showPlaceholder = Boolean(drag && drag.fromStatus === status)

  // Estimate card height (can be made dynamic if needed)
  const cardHeight = 88 // px, based on TaskCard content
  const gap = 8 // gap-2 = 8px
  const rowHeight = cardHeight + gap

  // Use virtualization for performance
  const virtual = useVirtualList({
    count: tasks.length,
    rowHeight,
    overscan: 3,
    containerRef: columnBodyRef,
  })

  const visibleTasks = tasks.slice(virtual.startIndex, virtual.endIndex + 1)

  return (
    <section className="flex min-w-[260px] flex-col rounded-lg border border-slate-200 bg-white">
      <header
        className={[
          'flex items-center justify-between gap-3 rounded-t-lg border-b px-3 py-2',
          isDragOver ? 'bg-slate-50' : statusColumnClass,
        ].join(' ')}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{statusLabel}</span>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {tasks.length}
        </span>
      </header>

      <div
        ref={columnBodyRef}
        className={['flex-1 overflow-y-auto p-2', isDragOver ? 'bg-slate-50/60' : ''].join(' ')}
      >
        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks"
            description="Drag a card here to change its status."
          />
        ) : (
          <div
            className="flex flex-col gap-2"
            style={{ height: virtual.totalHeight, position: 'relative' }}
          >
            <div
              style={{
                transform: `translateY(${virtual.startIndex * rowHeight}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              {visibleTasks.map((task, visibleIndex) => {
                const absoluteIndex = virtual.startIndex + visibleIndex
                const isDragged = Boolean(drag && drag.taskId === task.id)
                if (isDragged) {
                  if (showPlaceholder && drag && absoluteIndex === drag.fromIndex) {
                    return (
                      <div
                        key={`ph_${task.id}`}
                        className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"
                        style={{ height: drag.cardHeight }}
                      />
                    )
                  }
                  return null
                }

                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assigneeName={assigneeNamesById[task.assigneeId] ?? 'Unknown'}
                    onPointerDownDrag={(e) => {
                      onStartDrag({
                        task,
                        fromStatus: status,
                        fromIndex: absoluteIndex,
                        cardEl: e.currentTarget,
                        clientX: e.clientX,
                        clientY: e.clientY,
                      })
                    }}
                    otherUsers={props.otherUsers}
                    leavingTokens={props.leavingTokens}
                    justMovedAt={props.justMovedAt}
                    nowMs={props.nowMs}
                    enterMs={props.enterMs}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
})

