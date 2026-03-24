import { useMemo } from 'react'

type SimUserLike = {
  id: string
  name: string
  color: string
  taskId: string | null
}

type LeavingTokenLike = {
  userId: string
  userName: string
  color: string
  taskId: string
  expiresAt: number
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const a = parts[0]?.[0] ?? ''
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (a + b).toUpperCase()
}

export function PresenceAvatars(props: {
  taskId: string
  otherUsers: SimUserLike[]
  leavingTokens: LeavingTokenLike[]
  justMovedAt: Record<string, number>
  nowMs: number
  enterMs: number
}) {
  const { taskId, otherUsers, leavingTokens, justMovedAt, nowMs, enterMs } = props

  const usersOnTask = useMemo(() => {
    const current = otherUsers.filter((u) => u.taskId === taskId)
    const leaving = leavingTokens.filter((t) => t.taskId === taskId)
    return {
      current,
      leaving,
      total: current.length + leaving.length,
    }
  }, [enterMs, leavingTokens, nowMs, otherUsers, taskId])

  const visible = 1
  const total = usersOnTask.total

  if (total === 0) return null

  const first =
    usersOnTask.current[0] ??
    (usersOnTask.leaving[0]
      ? {
          id: usersOnTask.leaving[0].userId,
          name: usersOnTask.leaving[0].userName,
          color: usersOnTask.leaving[0].color,
          taskId,
        }
      : null)

  if (!first) return null

  const inEnterWindow = Boolean(justMovedAt[first.id]) && nowMs - justMovedAt[first.id] <= enterMs

  return (
    <div className="pointer-events-none flex items-center">
      <div className="relative h-5 w-5">
        <div
          className={[
            'absolute inset-0 rounded-full text-[10px] font-semibold flex items-center justify-center border border-white/60',
            inEnterWindow ? 'presence-avatar-enter' : '',
          ].join(' ')}
          style={{ background: first.color }}
        >
          {initials(first.name)}
        </div>
        {usersOnTask.leaving.length > 0 && (
          <div
            className="absolute inset-0 rounded-full text-[10px] font-semibold flex items-center justify-center border border-white/60 presence-avatar-leave"
            style={{ background: usersOnTask.leaving[0].color }}
          >
            {initials(usersOnTask.leaving[0].userName)}
          </div>
        )}
      </div>
      {total > visible && (
        <span className="ml-1 inline-flex h-5 items-center rounded-full bg-black/25 px-1 text-[11px] font-medium text-white">
          +{total - visible}
        </span>
      )}
    </div>
  )
}

