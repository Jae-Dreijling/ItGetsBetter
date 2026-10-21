// "No repeats" (COMPANION-PLAN 11a): the lines the companions said most
// recently, so the next pick can avoid them. Remembered across app starts.

const KEY = 'igb_recent_lines'
const REMEMBER = 40

function read(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[] } catch { return [] }
}

export function rememberLine(line: string) {
  const next = [line, ...read().filter(l => l !== line)].slice(0, REMEMBER)
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* not remembered, fine */ }
}

// A line not said recently, or else the one said longest ago.
export function pickFresh(pool: string[], random: () => number = Math.random, recent: string[] = read()): string {
  const fresh = pool.filter(l => !recent.includes(l))
  if (fresh.length) return fresh[Math.floor(random() * fresh.length)]
  return [...pool].sort((a, b) => recent.indexOf(b) - recent.indexOf(a))[0]
}
