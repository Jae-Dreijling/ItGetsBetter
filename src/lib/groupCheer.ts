// Group cheers (ROADMAP 2.2): on a big moment, every switched-on companion
// cheers, not only the ones on screen. They show up as a short row of
// portraits that bounce in one after another, with one cheer line.

export const MAX_SHOWN = 6
export const COOLDOWN_MS = 20 * 60 * 1000
const KEY = 'igb_group_cheer_at'

// Who cheers: the switched-on companions that aren't already on screen.
export function groupCheerers<T extends { id?: number; is_active: boolean }>(companions: T[], onScreen: (number | undefined)[]): T[] {
  return companions.filter(c => c.is_active && c.id !== undefined && !onScreen.includes(c.id))
}

// Not more than once every 20 minutes, so a busy day doesn't get noisy.
export function groupCheerCooledDown(now = Date.now()): boolean {
  try {
    const last = localStorage.getItem(KEY)
    return last === null || now - Number(last) >= COOLDOWN_MS
  } catch { return true }
}

export function markGroupCheer(now = Date.now()) {
  try { localStorage.setItem(KEY, String(now)) } catch { /* it may cheer again sooner */ }
}
