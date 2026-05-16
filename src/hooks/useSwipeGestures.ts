"use client"

import { useEffect, useRef } from "react"

interface SwipeCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

export function useSwipeGestures(
  elementRef: React.RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 60 }: SwipeCallbacks
) {
  const startX = useRef<number>(0)
  const startY = useRef<number>(0)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX.current
      const dy = e.changedTouches[0].clientY - startY.current
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      if (absDx < threshold && absDy < threshold) return

      if (absDx > absDy) {
        if (dx > 0) onSwipeRight?.()
        else onSwipeLeft?.()
      } else {
        if (dy > 0) onSwipeDown?.()
        else onSwipeUp?.()
      }
    }

    el.addEventListener("touchstart", handleTouchStart, { passive: true })
    el.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener("touchstart", handleTouchStart)
      el.removeEventListener("touchend", handleTouchEnd)
    }
  }, [elementRef, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])
}
