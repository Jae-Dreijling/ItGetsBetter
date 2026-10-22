// Every companion keeps its own clock (asked 2026-10-22): after it asks you
// something, brings a surprise, makes a small request or knocks for a visit,
// it waits 2 or 3 days before doing that again, so each one feels like its
// own person. Different companions can come by on the same day, up to
// PER_DAY of a kind a day; the rest simply wait their turn.

export type TurnKind = 'question' | 'surprise' | 'request' | 'visit'

export const PER_DAY = 2
const KEY = 'igb_companion_turns'

interface TurnState {
  // companion id → kind → logical date of its last turn
  last: Record<string, Partial<Record<TurnKind, string>>>
  // How many turns of each kind happened today.
  day: { date: string; count: Partial<Record<TurnKind, number>> }
}

function read(): TurnState {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (s && typeof s === 'object' && s.last && s.day) return s
  } catch { /* start fresh */ }
  return { last: {}, day: { date: '', count: {} } }
}
function write(s: TurnState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* fine, it may come again */ }
}

export function hashText(text: string): number {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(h)
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000)
}

// 2 or 3 days, decided per companion and per turn, so they don't fall into
// a fixed rhythm together.
export function gapDays(companionId: number, kind: TurnKind, last: string): number {
  return 2 + (hashText(`${companionId}:${kind}:${last}`) % 2)
}

export function lastTurn(companionId: number, kind: TurnKind, state = read()): string | undefined {
  return state.last[companionId]?.[kind]
}

export function isDue(companionId: number, kind: TurnKind, today: string, state = read()): boolean {
  const last = lastTurn(companionId, kind, state)
  return !last || daysBetween(last, today) >= gapDays(companionId, kind, last)
}

export function turnsToday(kind: TurnKind, today: string, state = read()): number {
  return state.day.date === today ? state.day.count[kind] ?? 0 : 0
}

// Whose turn it is now, if anyone: the companion with you goes first when
// it's due, then whoever has waited longest (never-had-a-turn first). Null
// once today's PER_DAY are used.
export function nextTurn<T extends { id?: number }>(kind: TurnKind, today: string, candidates: T[], preferId?: number | null, state = read()): T | null {
  if (turnsToday(kind, today, state) >= PER_DAY) return null
  const due = candidates.filter(c => c.id !== undefined && isDue(c.id, kind, today, state))
  if (due.length === 0) return null
  const preferred = due.find(c => c.id === preferId)
  if (preferred) return preferred
  return [...due].sort((a, b) => {
    const la = lastTurn(a.id!, kind, state) ?? ''
    const lb = lastTurn(b.id!, kind, state) ?? ''
    return la === lb ? hashText(`${today}:${a.id}`) - hashText(`${today}:${b.id}`) : la < lb ? -1 : 1
  })[0]
}

// Marks a turn as used, whether you took it or said "not now".
export function markTurn(companionId: number, kind: TurnKind, today: string) {
  const s = read()
  s.last[companionId] = { ...s.last[companionId], [kind]: today }
  s.day = s.day.date === today ? s.day : { date: today, count: {} }
  s.day.count[kind] = (s.day.count[kind] ?? 0) + 1
  write(s)
  window.dispatchEvent(new Event('igb-turns'))
}
