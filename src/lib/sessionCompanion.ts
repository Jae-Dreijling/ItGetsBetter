import { getLogicalDate } from './date'

// The companion speaking this session. Stored in sessionStorage (so the next
// app open picks again) and observable, so tapping a companion on the
// Companions page switches the floating companion immediately.
const SESSION_COMPANION_KEY = 'igb_session_companion_id'

const listeners = new Set<() => void>()

export function getSessionCompanionId(): number | null {
  try {
    const stored = sessionStorage.getItem(SESSION_COMPANION_KEY)
    return stored === null ? null : Number(stored)
  } catch {
    return null
  }
}

export function setSessionCompanionId(id: number | null) {
  if (id === getSessionCompanionId()) return
  if (id === null) sessionStorage.removeItem(SESSION_COMPANION_KEY)
  else sessionStorage.setItem(SESSION_COMPANION_KEY, String(id))
  listeners.forEach(listener => listener())
}

export function subscribeSessionCompanion(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// On its birthday a companion is the one with you all day. Otherwise a
// tapped (or earlier auto-picked) companion stays current for the session,
// or a random active companion is picked, falling back to the default one
// when none are active.
export function pickSessionCompanion<T extends { id?: number; is_active: boolean; is_default: boolean; birthday?: string | null }>(
  companions: T[],
  storedId: number | null,
  random: () => number = Math.random,
  today: string = getLogicalDate(),
): T | undefined {
  const birthday = companions.find(c => c.birthday && c.birthday === today.slice(5))
  if (birthday) return birthday
  if (storedId !== null) {
    const current = companions.find(c => c.id === storedId)
    if (current) return current
  }
  const active = companions.filter(c => c.is_active)
  if (active.length === 0) return companions.find(c => c.is_default)
  return active[Math.floor(random() * active.length)]
}
