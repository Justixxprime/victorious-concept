import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps Tab focus inside a container while `active` is true, closes on
 * Escape via `onClose`, and returns focus to whatever was focused right
 * before the trap activated (typically the trigger button) once it
 * deactivates.
 *
 * Usage:
 *   const trapRef = useFocusTrap(open, () => setOpen(false))
 *   <div ref={trapRef}>...</div>
 */
export function useFocusTrap(active, onClose) {
  const containerRef = useRef(null)
  const previouslyFocusedRef = useRef(null)

  useEffect(() => {
    if (!active) return undefined

    previouslyFocusedRef.current = document.activeElement

    const container = containerRef.current
    if (container) {
      const firstFocusable = container.querySelector(FOCUSABLE_SELECTOR)
      // Only steal focus if nothing inside the container already has it
      // (e.g. an input with autoFocus already claimed it).
      if (firstFocusable && !container.contains(document.activeElement)) {
        firstFocusable.focus()
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }

      if (e.key !== 'Tab' || !containerRef.current) return

      const focusable = Array.from(
        containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      const toRestore = previouslyFocusedRef.current
      if (toRestore && typeof toRestore.focus === 'function') {
        toRestore.focus()
      }
    }
  }, [active, onClose])

  return containerRef
}
