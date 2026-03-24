import type { Task } from '../../types/task'
import { formatDueLabel, isDueOverdue } from '../../lib/date'
import { AssigneeAvatar } from '../common/AssigneeAvatar'
import { PriorityBadge } from '../common/PriorityBadge'
import { PresenceAvatars } from '../common/PresenceAvatars'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { memo } from 'react'

export const TaskCard = memo(function TaskCard(props: {
  task: Task
  assigneeName: string
  onPointerDownDrag: (e: ReactPointerEvent<HTMLDivElement>) => void
  otherUsers: Array<{ id: string; name: string; color: string; taskId: string | null }>
  leavingTokens: Array<{ userId: string; userName: string; color: string; taskId: string; expiresAt: number }>
  justMovedAt: Record<string, number>
  nowMs: number
  enterMs: number
}) {
  const { task } = props
  const overdue = isDueOverdue(task.dueDate)
  const dueLabel = formatDueLabel(task.dueDate)

  return (
    <div
      role="button"
      tabIndex={0}
      className="relative cursor-grab select-none rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
      style={{ touchAction: 'none' }}
      onPointerDown={(e) => {
        // Prevent iOS/Android from interpreting the gesture as scroll.
        e.preventDefault()
        props.onPointerDownDrag(e)
      }}
    >
      <div className="absolute right-2 top-2">
        <PresenceAvatars
          taskId={task.id}
          otherUsers={props.otherUsers}
          leavingTokens={props.leavingTokens}
          justMovedAt={props.justMovedAt}
          nowMs={props.nowMs}
          enterMs={props.enterMs}
        />
      </div>

      <div className="pr-10">
        <div className="text-sm font-semibold text-slate-900 line-clamp-2">
          {task.title}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AssigneeAvatar name={props.assigneeName} />
            <span className="text-xs font-medium text-slate-700">{props.assigneeName.split(' ')[0]}</span>
          </div>
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <div className={`mt-2 text-xs font-semibold ${overdue ? 'text-red-600' : 'text-slate-600'}`}>
        {dueLabel}
      </div>
    </div>
  )
})

