import { useEffect, useState } from 'react'

// A short "thanks" that stays for a moment after logging, even when the
// person it was about has already dropped off the list.
export function useThanks(ms = 2500): [boolean, () => void] {
  const [shownAt, setShownAt] = useState<number | null>(null)
  useEffect(() => {
    if (shownAt === null) return
    const t = setTimeout(() => setShownAt(null), ms)
    return () => clearTimeout(t)
  }, [shownAt, ms])
  return [shownAt !== null, () => setShownAt(Date.now())]
}
