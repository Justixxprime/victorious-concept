import { useState, useEffect } from 'react'

export function useTheme() {
  const [mode, setMode] = useState(
    () => localStorage.getItem('vc-theme') || 'auto'
  )

  useEffect(() => {
    const root = document.documentElement
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const isDark = mode === 'dark' || (mode === 'auto' && systemDark)
    root.classList.toggle('dark', isDark)

    localStorage.setItem('vc-theme', mode)
  }, [mode])

  return [mode, setMode]
}