import { useState, useEffect, useRef } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useDebouncedSave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  delay: number = 800
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const isFirstRender = useRef(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Skip the very first render (don't save on mount)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)

    setStatus('saving')

    timerRef.current = setTimeout(async () => {
      try {
        await saveFn(value)
        setStatus('saved')
        // Reset to idle after 2s
        setTimeout(() => setStatus('idle'), 2000)
      } catch (e) {
        setStatus('error')
      }
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return { status }
}
