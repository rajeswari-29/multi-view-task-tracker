import type { RefObject } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StatusId, Task } from '../types/task'

type DragState = {
  taskId: string
  fromStatus: StatusId
  fromIndex: number
  cardHeight: number
  cardWidth: number
  pointerOffsetX: number
  pointerOffsetY: number
  ghostLeft: number
  ghostTop: number
  originalRect: { left: number; top: number }
  activeDropStatus: StatusId | null
  ghostTransitionMs: number | null
}

export function useKanbanDnd(params: {
  statuses: StatusId[]
  columnBodyRefs: Record<StatusId, RefObject<HTMLDivElement | null>>
  onMoveTask: (taskId: string, toStatus: StatusId) => void
}) {
  const { statuses, columnBodyRefs, onMoveTask } = params
  const [drag, setDrag] = useState<DragState | null>(null)
  const [ghostPointerEventsNone, setGhostPointerEventsNone] = useState(true)

  const cleanupRef = useRef<{
    removeMove: (() => void) | null
    removeUp: (() => void) | null
  }>({ removeMove: null, removeUp: null })

  const detectDropStatus = useCallback(
    (clientX: number, clientY: number): StatusId | null => {
      for (const status of statuses) {
        const el = columnBodyRefs[status]?.current
        if (!el) continue
        const rect = el.getBoundingClientRect()
        const withinX = clientX >= rect.left && clientX <= rect.right
        const withinY = clientY >= rect.top && clientY <= rect.bottom
        if (withinX && withinY) return status
      }
      return null
    },
    [columnBodyRefs, statuses],
  )

  const endDrag = useCallback(
    (clientX: number, clientY: number) => {
      const state = drag
      setGhostPointerEventsNone(true)
      if (!state) return

      // Snapshot drop status at pointer up time
      const dropStatus = detectDropStatus(clientX, clientY)
      const from = state.fromStatus
      const to = dropStatus

      if (to && to !== from) {
        onMoveTask(state.taskId, to)
        setDrag(null)
        return
      }

      // Invalid drop: snap ghost back to its original position smoothly.
      const { left, top } = state.originalRect
      setDrag((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          ghostLeft: left,
          ghostTop: top,
          ghostTransitionMs: 180,
          activeDropStatus: null,
        }
      })

      window.setTimeout(() => {
        setDrag(null)
      }, 200)
    },
    [detectDropStatus, drag, onMoveTask],
  )

  useEffect(() => {
    return () => {
      // safety cleanup
      cleanupRef.current.removeMove?.()
      cleanupRef.current.removeUp?.()
    }
  }, [])

  const startDrag = useCallback(
    (args: {
      task: Task
      fromStatus: StatusId
      fromIndex: number
      cardEl: HTMLElement
      clientX: number
      clientY: number
    }) => {
      const { task, fromStatus, fromIndex, cardEl, clientX, clientY } = args
      const rect = cardEl.getBoundingClientRect()
      const pointerOffsetX = clientX - rect.left
      const pointerOffsetY = clientY - rect.top

      setGhostPointerEventsNone(true)
      setDrag({
        taskId: task.id,
        fromStatus,
        fromIndex,
        cardHeight: rect.height,
        cardWidth: rect.width,
        pointerOffsetX,
        pointerOffsetY,
        ghostLeft: clientX - pointerOffsetX,
        ghostTop: clientY - pointerOffsetY,
        originalRect: { left: rect.left, top: rect.top },
        activeDropStatus: null,
        ghostTransitionMs: null,
      })

      // Disable scrolling while dragging on touch
      cardEl.style.touchAction = 'none'

      const onMove = (e: PointerEvent) => {
        if (!e.isPrimary) return
        setDrag((prev) => {
          if (!prev) return prev
          const ghostLeft = e.clientX - prev.pointerOffsetX
          const ghostTop = e.clientY - prev.pointerOffsetY
          const activeDropStatus = detectDropStatus(e.clientX, e.clientY)
          return { ...prev, ghostLeft, ghostTop, activeDropStatus, ghostTransitionMs: null }
        })
      }

      const onUp = (e: PointerEvent) => {
        if (!e.isPrimary) return
        endDrag(e.clientX, e.clientY)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerup', onUp)
      cleanupRef.current.removeMove = () => window.removeEventListener('pointermove', onMove)
      cleanupRef.current.removeUp = () => window.removeEventListener('pointerup', onUp)
    },
    [detectDropStatus, endDrag],
  )

  // Expose drag state and helpers for rendering
  const isDragging = Boolean(drag)
  const activeDropStatus = drag?.activeDropStatus ?? null

  const ghostStyle = useMemo(() => {
    if (!drag) return undefined
    return {
      width: drag.cardWidth,
      height: drag.cardHeight,
      opacity: 0.85,
      transform: `translate(${drag.ghostLeft}px, ${drag.ghostTop}px)`,
      transition:
        drag.ghostTransitionMs != null
          ? `transform ${drag.ghostTransitionMs}ms ease, opacity 140ms ease`
          : undefined,
      pointerEvents: ghostPointerEventsNone ? ('none' as const) : ('auto' as const),
    }
  }, [drag, ghostPointerEventsNone])

  return {
    drag,
    isDragging,
    activeDropStatus,
    startDrag,
    ghostStyle,
  }
}

