import { useEffect, useState } from 'react'
import { db } from './db'
import { getLogicalDate, nowISO } from './lib/date'
import { Heart } from 'lucide-react'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function init() {
      if (navigator.storage?.persist) {
        await navigator.storage.persist()
      }

      await db.appOpenLog.add({
        date: getLogicalDate(),
        opened_at: nowISO(),
      })

      setReady(true)
    }

    init()
  }, [])

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface">
        <Heart className="h-8 w-8 animate-pulse text-primary-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-surface px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
        <Heart className="h-10 w-10 text-primary-500" />
      </div>

      <h1 className="mb-2 text-3xl font-bold text-text-primary">
        ItGetsBetter
      </h1>

      <p className="mb-8 max-w-sm text-lg text-muted">
        Your personal Health Operating System.
        Phase 0 complete — the foundation is ready.
      </p>

      <div className="rounded-xl bg-card p-6 shadow-sm">
        <p className="text-sm text-muted">
          PWA installed &bull; Offline ready &bull; Database initialized
        </p>
      </div>
    </div>
  )
}
