// Alone time (asked 2026-10-22): drag the companion onto the ✕ at the bottom
// and it says goodbye in character and leaves. For 3 minutes no companion
// shows up, says anything or knocks; then a (usually different) one is back.
// Kept in localStorage, so reloading the app doesn't cut it short.

export const ALONE_MS = 3 * 60 * 1000
const KEY = 'igb_alone_until'

export function aloneUntil(): number {
  try { return Number(localStorage.getItem(KEY) ?? 0) || 0 } catch { return 0 }
}

export function isAloneTime(now = Date.now()): boolean {
  return aloneUntil() > now
}

export function startAloneTime(now = Date.now()): number {
  const until = now + ALONE_MS
  try { localStorage.setItem(KEY, String(until)) } catch { /* it just comes back sooner */ }
  return until
}

// Whether the companion, centred at (x, y), was let go over the ✕.
export function overAloneZone(x: number, y: number, zone: { x: number; y: number; radius: number }): boolean {
  return Math.hypot(x - zone.x, y - zone.y) <= zone.radius
}
