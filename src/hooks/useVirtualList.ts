import type { RefObject } from 'react'
import { useEffect, useMemo, useState } from 'react'

type VirtualListRange = {
  startIndex: number
  endIndex: number // inclusive
  totalHeight: number
}

export function useVirtualList(
  params: {
    count: number
    rowHeight: number
    overscan: number
    containerRef: RefObject<HTMLElement | null>
  },
) {
  const { count, rowHeight, overscan, containerRef } = params
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      setViewportHeight(el.clientHeight)
      setScrollTop(el.scrollTop)
    }

    update()
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(() => update())
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [containerRef])

  const range: VirtualListRange = useMemo(() => {
    const totalHeight = count * rowHeight
    if (count === 0) {
      return { startIndex: 0, endIndex: -1, totalHeight: 0 }
    }
    const firstVisible = Math.floor(scrollTop / rowHeight)
    const visibleCount = Math.ceil(viewportHeight / rowHeight)

    const startIndex = Math.max(0, firstVisible - overscan)
    const endIndex = Math.min(count - 1, firstVisible + visibleCount + overscan - 1)
    return { startIndex, endIndex, totalHeight }
  }, [count, overscan, rowHeight, scrollTop, viewportHeight])

  return range
}

