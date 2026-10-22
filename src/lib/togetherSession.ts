// "Do this together" (ROADMAP 2.3): body doubling for one task. The
// companion keeps you company while you work on it, checking in quietly now
// and then, until you're done, stop, or two hours have passed. Kept in
// localStorage so it survives moving between pages and a reload.

export const CHECK_IN_MS = 8 * 60 * 1000
export const MAX_MS = 2 * 60 * 60 * 1000
export const TOGETHER_CLOSENESS = 2
const KEY = 'igb_together'
const EVENT = 'igb-together'

export interface TogetherSession {
  taskId: number
  companionId: number | null
  startedAt: number
}

export function readTogether(now = Date.now()): TogetherSession | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as TogetherSession | null
    return s && now - s.startedAt < MAX_MS ? s : null
  } catch { return null }
}

export function startTogether(taskId: number, companionId: number | null, now = Date.now()): TogetherSession {
  const session = { taskId, companionId, startedAt: now }
  try { localStorage.setItem(KEY, JSON.stringify(session)) } catch { /* only lasts this page then */ }
  window.dispatchEvent(new Event(EVENT))
  return session
}

export function endTogether() {
  try { localStorage.removeItem(KEY) } catch { /* fine */ }
  window.dispatchEvent(new Event(EVENT))
}

export function onTogetherChange(fn: () => void): () => void {
  window.addEventListener(EVENT, fn)
  return () => window.removeEventListener(EVENT, fn)
}

// "12 min", "1 h 5 min".
export function togetherDuration(startedAt: number, now = Date.now()): string {
  const mins = Math.max(0, Math.floor((now - startedAt) / 60_000))
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`
}
