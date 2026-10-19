import { useLayoutEffect, useRef, useState } from 'react'

/** True when the measured header content is wider than its container. */
export function useCompactHeader(deps: unknown[]) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [compact, setCompact] = useState(true)

  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return

    const update = () => {
      // The row starts after the left padding and spills past the viewport once it
      // is wider than the remaining width. Comparing against the full clientWidth
      // leaves a band where the links are still shown and the page scrolls.
      const available = container.clientWidth - parseFloat(getComputedStyle(container).paddingLeft)
      setCompact(measure.scrollWidth > available)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(container)
    observer.observe(measure)

    return () => observer.disconnect()
    // Re-measure when nav labels or other header content changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps supplied by caller
  }, deps)

  return { containerRef, measureRef, compact }
}
