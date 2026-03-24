import type { RefObject } from 'react'
import { useEffect } from 'react'

export function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return

    const onPointerDown = (e: PointerEvent | MouseEvent | TouchEvent) => {
      const el = ref.current
      const target = e.target as Node | null
      if (!el || !target) return
      if (!el.contains(target)) onOutside()
    }

    document.addEventListener('pointerdown', onPointerDown, { capture: true })
    document.addEventListener('mousedown', onPointerDown, { capture: true })
    document.addEventListener('touchstart', onPointerDown, { capture: true })

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, { capture: true } as any)
      document.removeEventListener('mousedown', onPointerDown, { capture: true } as any)
      document.removeEventListener('touchstart', onPointerDown, { capture: true } as any)
    }
  }, [enabled, onOutside, ref])
}

