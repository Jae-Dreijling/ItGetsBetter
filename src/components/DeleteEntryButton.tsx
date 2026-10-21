import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

// A small ✕ that asks once ("Delete?") before deleting, so a stray tap can't
// remove anything. The question goes away again after a few seconds.
export default function DeleteEntryButton({ onDelete, label }: { onDelete: () => void | Promise<void>; label: string }) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(t)
  }, [armed])

  if (armed) {
    return (
      <button
        onClick={e => { e.stopPropagation(); setArmed(false); void onDelete() }}
        className="shrink-0 rounded-md bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
      >
        Delete?
      </button>
    )
  }
  return (
    <button
      onClick={e => { e.stopPropagation(); setArmed(true) }}
      className="shrink-0 rounded-md p-1 text-muted hover:text-text-primary"
      aria-label={`Delete ${label}`}
    >
      <X className="h-4 w-4" />
    </button>
  )
}
