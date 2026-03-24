import { useMemo, useRef } from 'react'
import { STATUS_META, STATUS_ORDER } from '../../types/task'
import type { Task } from '../../types/task'
import { useKanbanDnd } from '../../hooks/useKanbanDnd'
import { useTasksStore } from '../../store/tasksStore'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'

type PresenceData = {
  otherUsers: Array<{ id: string; name: string; color: string; taskId: string | null }>
  leavingTokens: Array<{ userId: string; userName: string; color: string; taskId: string; expiresAt: number }>
  justMovedAt: Record<string, number>
  nowMs: number
  enterMs: number
}

export function KanbanBoard(props: {
  tasks: Task[]
  assigneeNamesById: Record<string, string>
  presence: PresenceData
}) {
  const { tasks, assigneeNamesById, presence } = props
  const { updateTaskStatus } = useTasksStore()

  const tasksByStatus = useMemo(() => {
    const map = {
      todo: [] as Task[],
      inprogress: [] as Task[],
      inreview: [] as Task[],
      done: [] as Task[],
    }
    for (const t of tasks) map[t.status].push(t)
    return map
  }, [tasks])

  const columnBodyRefs = {
    todo: useRef<HTMLDivElement>(null),
    inprogress: useRef<HTMLDivElement>(null),
    inreview: useRef<HTMLDivElement>(null),
    done: useRef<HTMLDivElement>(null),
  }

  const dnd = useKanbanDnd({
    statuses: STATUS_ORDER,
    columnBodyRefs,
    onMoveTask: (taskId, toStatus) => updateTaskStatus(taskId, toStatus),
  })

  const dragTask = useMemo(() => {
    if (!dnd.drag) return null
    return tasks.find((t) => t.id === dnd.drag?.taskId) ?? null
  }, [dnd.drag, tasks])

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status]
        return (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            statusLabel={meta.label}
            statusColumnClass={meta.columnClass}
            assigneeNamesById={assigneeNamesById}
            columnBodyRef={columnBodyRefs[status]}
            activeDropStatus={dnd.activeDropStatus}
            drag={dnd.drag ? dnd.drag : null}
            enterMs={presence.enterMs}
            otherUsers={presence.otherUsers}
            leavingTokens={presence.leavingTokens}
            justMovedAt={presence.justMovedAt}
            nowMs={presence.nowMs}
            onStartDrag={({ task, fromStatus, fromIndex, cardEl, clientX, clientY }) => {
              dnd.startDrag({
                task,
                fromStatus,
                fromIndex,
                cardEl,
                clientX,
                clientY,
              })
            }}
          />
        )
      })}

      {dnd.drag && dragTask ? (
        <div
          className="fixed z-50 pointer-events-none shadow-2xl"
          style={{
            left: 0,
            top: 0,
            width: dnd.ghostStyle?.width,
            height: dnd.ghostStyle?.height,
            opacity: dnd.ghostStyle?.opacity,
            transform: dnd.ghostStyle?.transform,
            transition: dnd.ghostStyle?.transition,
          }}
        >
          <TaskCard
            task={dragTask}
            assigneeName={assigneeNamesById[dragTask.assigneeId] ?? 'Unknown'}
            onPointerDownDrag={() => {}}
            otherUsers={presence.otherUsers}
            leavingTokens={presence.leavingTokens}
            justMovedAt={presence.justMovedAt}
            nowMs={presence.nowMs}
            enterMs={presence.enterMs}
          />
        </div>
      ) : null}
    </div>
  )
}

