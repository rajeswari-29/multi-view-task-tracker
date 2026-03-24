import { useEffect, useMemo, useState } from 'react'
import type { Task } from '../types/task'

type SimUser = {
  id: string
  name: string
  color: string // tailwind class-friendly hex
  taskId: string | null
}

type LeavingToken = {
  id: string
  userId: string
  userName: string
  color: string
  taskId: string
  expiresAt: number
}

const COLORS = ['#60a5fa', '#34d399', '#f472b6', '#a78bfa'] // blue/green/pink/purple

const ENTER_MS = 320
const LEAVE_MS = 320

export function usePresenceSimulation(
  tasks: Task[],
  options?: { animate?: boolean },
) {
  return usePresenceSimulationInternal(tasks, { animate: options?.animate ?? true })
}

export function usePresenceSimulationInternal(
  tasks: Task[],
  options: { animate: boolean },
) {
  const animate = options.animate
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks])
  const [otherUsers, setOtherUsers] = useState<SimUser[]>([])
  const [leavingTokens, setLeavingTokens] = useState<LeavingToken[]>([])
  const [justMovedAt, setJustMovedAt] = useState<Record<string, number>>({})
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    setNowMs(Date.now())
    if (!taskIds.length) return

    const count = 2 + Math.floor(Math.random() * 3) // 2..4
    const users: SimUser[] = Array.from({ length: count }).map((_, i) => {
      const taskId = taskIds[Math.floor(Math.random() * taskIds.length)]
      return {
        id: `other_${i + 1}`,
        name: `User ${i + 1}`,
        color: COLORS[i % COLORS.length],
        taskId,
      }
    })
    setOtherUsers(users)
    setLeavingTokens([])
    setJustMovedAt({})

    // Keep time moving so CSS animations can be applied by age (only needed when avatars are visible).
    const nowInterval = animate ? window.setInterval(() => setNowMs(Date.now()), 150) : null

    const movementInterval = window.setInterval(() => {
      const now = Date.now()
      setOtherUsers((prevUsers) => {
        const taskIdList = taskIds
        const nextUsers = prevUsers.map((u) => {
          const shouldMove = Math.random() < 0.7
          if (!shouldMove) return u
          const toIdle = Math.random() < 0.1
          const nextTaskId = toIdle ? null : taskIdList[Math.floor(Math.random() * taskIdList.length)]
          if (nextTaskId !== u.taskId) {
            if (u.taskId) {
              if (animate) {
                setLeavingTokens((tokens) => [
                  ...tokens,
                  {
                    id: `leave_${u.id}_${now}`,
                    userId: u.id,
                    userName: u.name,
                    color: u.color,
                    taskId: u.taskId as string,
                    expiresAt: now + LEAVE_MS,
                  },
                ])
              }
            }
            if (animate) setJustMovedAt((m) => ({ ...m, [u.id]: now }))
            return { ...u, taskId: nextTaskId }
          }
          return u
        })
        return nextUsers
      })

      if (animate) setLeavingTokens((tokens) => tokens.filter((t) => t.expiresAt > now))
    }, 2500)

    return () => {
      if (nowInterval) window.clearInterval(nowInterval)
      window.clearInterval(movementInterval)
    }
  }, [taskIds, animate])

  // Leaving tokens already expire; we also filter by expiration here for safety.
  const liveLeavingTokens = useMemo(() => {
    if (!animate) return []
    return leavingTokens.filter((t) => t.expiresAt > nowMs)
  }, [animate, leavingTokens, nowMs])

  const activeUserCount = otherUsers.filter((u) => u.taskId).length

  return {
    otherUsers,
    leavingTokens: liveLeavingTokens,
    justMovedAt: animate ? justMovedAt : {},
    nowMs: animate ? nowMs : Date.now(),
    enterMs: ENTER_MS,
    leaveMs: LEAVE_MS,
    activeUserCount,
  }
}

