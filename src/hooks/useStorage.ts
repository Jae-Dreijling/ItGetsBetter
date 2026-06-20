import { useState, useEffect } from 'react'

export interface StorageEstimate {
  used: number
  total: number
  percent: number
  persisted: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(1)} GB`
}

export function useStorageEstimate() {
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null)

  useEffect(() => {
    async function check() {
      if (!navigator.storage?.estimate) return
      const est = await navigator.storage.estimate()
      const persisted = await navigator.storage.persisted?.() ?? false
      setEstimate({
        used: est.usage ?? 0,
        total: est.quota ?? 0,
        percent: est.quota ? Math.round(((est.usage ?? 0) / est.quota) * 100) : 0,
        persisted,
      })
    }
    check()
  }, [])

  return estimate
}

export { formatBytes }
