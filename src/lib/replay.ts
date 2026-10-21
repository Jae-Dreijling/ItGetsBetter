import { addDays, format, parseISO, subDays, subMonths, subYears } from 'date-fns'
import { getLogicalDate } from './date'
import { MILESTONES } from './abstinence'
import { trendSeries, trendOn } from './weightTrend'

// The progress walk (V2-PLAN §8, step 10d): your companion walks a trail on a
// little map and stops at the good things since a date. Only progress shows:
// empty kinds are skipped, and weight only appears when the trend went down.

export type ReplayPeriod = 'start' | '3_months' | 'month'

export const PERIODS: { id: ReplayPeriod; label: string }[] = [
  { id: 'month', label: 'Last month' },
  { id: '3_months', label: '3 months' },
  { id: 'start', label: 'Since the start' },
]

export function periodStart(period: ReplayPeriod, today: string, firstDay: string): string {
  const from = period === 'month' ? subMonths(parseISO(today), 1) : period === '3_months' ? subMonths(parseISO(today), 3) : parseISO(firstDay)
  const date = format(from, 'yyyy-MM-dd')
  return date < firstDay ? firstDay : date
}

export type StopKind = 'start' | 'goal' | 'abstinence' | 'achievement' | 'weight' | 'win' | 'craving' | 'letter' | 'people' | 'habit' | 'photo'

export interface ReplayStop {
  date: string
  kind: StopKind
  emoji: string
  // Short label on the map.
  title: string
  // What the companion says there.
  line: string
  photoId?: number
}

export interface ReplayInput {
  since: string
  today: string
  milestones: { text: string; emoji: string; done_at: string }[]
  counters: { name: string; emoji: string; started_at: string; slips: string[] }[]
  achievements: { name: string; unlocked_at: string }[]
  weights: { date: string; value_kg: number }[]
  // All wins, cravings ridden out, catch-ups and habit check-ins ever, so
  // "your 50th" counts from the very first one.
  wins: { date: string; text: string }[]
  cravingsPassed: string[]
  lettersOpened: string[]
  contacts: { date: string; name: string }[]
  habitCheckIns: string[]
  photos: { id: number; date: string }[]
}

const ordinal = (n: number) => n === 1 ? 'first' : `${n}${n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`
const dayOf = (iso: string) => getLogicalDate(new Date(iso))

// Nth items worth a stop: the 1st, 10th, 25th, ...
function countStops<T>(items: T[], steps: number[], dateOf: (item: T) => string, make: (n: number, item: T) => Omit<ReplayStop, 'date'>): ReplayStop[] {
  const sorted = [...items].sort((a, b) => dateOf(a).localeCompare(dateOf(b)))
  return steps.filter(n => n <= sorted.length).map(n => ({ date: dateOf(sorted[n - 1]), ...make(n, sorted[n - 1]) }))
}

// The first moment each abstinence milestone was reached, over all runs.
// Milestones stay once reached (lib/abstinence), so a later slip changes nothing.
export function abstinenceReached(startedAt: string, slips: string[], now: Date): { days: number; label: string; at: string }[] {
  const bounds = [startedAt, ...slips.filter(s => s > startedAt).sort()]
  const reached: { days: number; label: string; at: string }[] = []
  bounds.forEach((runStart, i) => {
    const end = i + 1 < bounds.length ? new Date(bounds[i + 1]) : now
    for (const m of MILESTONES) {
      if (reached.some(r => r.days === m.days)) continue
      const at = addDays(new Date(runStart), m.days)
      if (at <= end) reached.push({ ...m, at: at.toISOString() })
    }
  })
  return reached
}

export function buildStops(input: ReplayInput, now = new Date()): ReplayStop[] {
  const { since, today } = input
  const stops: ReplayStop[] = []

  for (const m of input.milestones) {
    stops.push({ date: dayOf(m.done_at), kind: 'goal', emoji: m.emoji, title: m.text, line: `You reached “${m.text}”. That one took real steps.` })
  }

  for (const c of input.counters) {
    for (const r of abstinenceReached(c.started_at, c.slips, now)) {
      if (r.days < 7) continue
      stops.push({ date: dayOf(r.at), kind: 'abstinence', emoji: c.emoji, title: `${r.label} free`, line: `${r.label} free from ${c.name}. Look at you.` })
    }
  }

  for (const a of input.achievements) {
    stops.push({ date: dayOf(a.unlocked_at), kind: 'achievement', emoji: '🏆', title: a.name, line: `You unlocked “${a.name}” here!` })
  }

  // Every 2 kg the trend went down from where this walk starts. Never a gain.
  const series = trendSeries(input.weights)
  const base = trendOn(series, format(subDays(parseISO(since), 1), 'yyyy-MM-dd')) ?? series.find(p => p.date >= since)?.trend
  if (base !== undefined) {
    let next = 2
    for (const p of series) {
      if (p.date < since) continue
      while (p.trend <= base - next) {
        stops.push({ date: p.date, kind: 'weight', emoji: '⚖️', title: `−${next} kg`, line: `Your trend went ${next} kg down by here. Slow and real.` })
        next += 2
      }
    }
  }

  stops.push(...countStops(input.wins, [1, 10, 25, 50, 100, 200, 500], w => w.date, (n, w) => ({
    kind: 'win', emoji: '🫙', title: `${ordinal(n)} win`, line: `Your ${ordinal(n)} win in the jar: “${w.text}”`,
  })))
  stops.push(...countStops(input.cravingsPassed, [1, 5, 10, 25, 50, 100], d => d, n => ({
    kind: 'craving', emoji: '🌊', title: n === 1 ? 'Rode one out' : `${n} cravings passed`,
    line: n === 1 ? 'The first craving you rode out. It passed, and you were still here.' : `That's ${n} cravings you watched pass.`,
  })))
  for (const opened of input.lettersOpened) {
    stops.push({ date: dayOf(opened), kind: 'letter', emoji: '💌', title: 'A letter opened', line: 'Here you opened a letter from past you.' })
  }
  stops.push(...countStops(input.contacts, [1, 10, 25, 50, 100, 200], c => c.date, (n, c) => ({
    kind: 'people', emoji: '🫂', title: n === 1 ? `Saw ${c.name}` : `${n} catch-ups`,
    line: n === 1 ? `Your first catch-up here was with ${c.name}.` : `Your ${ordinal(n)} catch-up, this one with ${c.name}.`,
  })))
  stops.push(...countStops(input.habitCheckIns, [50, 100, 250, 500, 1000, 2000], d => d, n => ({
    kind: 'habit', emoji: '✅', title: `${n} check-ins`, line: `${n} habit check-ins. Small things, done ${n} times.`,
  })))

  const photos = [...input.photos].filter(p => p.date >= since && p.date <= today).sort((a, b) => a.date.localeCompare(b.date))
  for (const p of photos.length > 1 ? [photos[0], photos[photos.length - 1]] : photos) {
    stops.push({ date: p.date, kind: 'photo', emoji: '📸', title: 'A photo', line: `A photo from ${format(parseISO(p.date), 'd MMMM')}.`, photoId: p.id })
  }

  const inRange = stops.filter(s => s.date >= since && s.date <= today).sort((a, b) => a.date.localeCompare(b.date))
  return [
    { date: since, kind: 'start', emoji: '🚩', title: format(parseISO(since), 'd MMM yyyy'), line: 'This is where our walk starts. Come on!' },
    ...bundleOld(inRange, today),
  ]
}

// ─── Bundling older stops ─────────────────────────────────────────────────────

// The further back, the bigger the bundles, so "since the start" stays a walk
// and not a hike: the last 6 months stop one by one, then one stop per kind
// per month (to a year back), per quarter (to two years) and per year.
function bucketOf(date: string, today: string): { key: string; label: string } | null {
  const d = parseISO(date)
  const now = parseISO(today)
  if (d >= subMonths(now, 6)) return null
  if (d >= subYears(now, 1)) return { key: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') }
  if (d >= subYears(now, 2)) {
    const q = Math.floor(d.getMonth() / 3)
    const first = new Date(d.getFullYear(), q * 3, 1)
    return { key: `${d.getFullYear()}-Q${q}`, label: `${format(first, 'MMM')}–${format(new Date(d.getFullYear(), q * 3 + 2, 1), 'MMM yyyy')}` }
  }
  return { key: format(d, 'yyyy'), label: format(d, 'yyyy') }
}

const BUNDLE_NAMES: Partial<Record<StopKind, string>> = {
  goal: 'goal steps',
  abstinence: 'free-day milestones',
  achievement: 'achievements',
  win: 'win milestones',
  craving: 'craving milestones',
  people: 'catch-up milestones',
  habit: 'check-in milestones',
  letter: 'letters opened',
}

const listed = (titles: string[]) => {
  const shown = titles.slice(0, 3)
  const more = titles.length - shown.length
  if (more > 0) return `${shown.join(', ')} and ${more} more`
  return shown.length > 1 ? `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}` : shown[0]
}

function bundle(group: ReplayStop[], label: string): ReplayStop {
  const first = group[0]
  const lastStop = group[group.length - 1]
  if (first.kind === 'weight') {
    return { ...lastStop, title: `${first.title} → ${lastStop.title}`, line: `${label}: your trend kept going down, ${first.title} → ${lastStop.title}.` }
  }
  const name = BUNDLE_NAMES[first.kind] ?? 'moments'
  return { ...lastStop, emoji: first.emoji, title: `${group.length} ${name}`, line: `${label}: ${listed(group.map(s => s.title))}.` }
}

export function bundleOld(stops: ReplayStop[], today: string): ReplayStop[] {
  type Group = { label: string; stops: ReplayStop[] }
  // Each group sits where its first stop was.
  const out: (ReplayStop | Group)[] = []
  const groups = new Map<string, Group>()
  for (const stop of stops) {
    const bucket = stop.kind === 'photo' ? null : bucketOf(stop.date, today)
    if (!bucket) { out.push(stop); continue }
    const key = `${bucket.key}:${stop.kind}`
    const group = groups.get(key)
    if (group) { group.stops.push(stop); continue }
    const fresh = { label: bucket.label, stops: [stop] }
    groups.set(key, fresh)
    out.push(fresh)
  }
  return out
    .map(item => ('stops' in item ? (item.stops.length === 1 ? item.stops[0] : bundle(item.stops, item.label)) : item))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Said at the end, under the finish flag.
export function closingLine(stopCount: number, name: string): string {
  if (stopCount === 0) return `The trail is still short, ${name}, and that's fine. Every step you log grows it.`
  return `${stopCount} ${stopCount === 1 ? 'stop' : 'stops'}, ${name}. Look how far you've come. I'm proud to walk it with you.`
}

// ─── The trail on the map ─────────────────────────────────────────────────────

export const STOP_GAP = 190
export const TRAIL_TOP = 110

export interface Point { x: number; y: number }

// A tiny seeded random, so the same walk always draws the same map.
export function seeded(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

// Stops zig-zag down the map, each a little off from a strict left/right.
export function layoutTrail(count: number, width: number, seed = 7): Point[] {
  const random = seeded(seed)
  return Array.from({ length: count }, (_, i) => {
    const side = i === 0 ? 0.5 : i % 2 ? 0.28 : 0.72
    return { x: Math.round(width * (side + (random() - 0.5) * 0.12)), y: TRAIL_TOP + i * STOP_GAP }
  })
}

// One curve between two stops: it leaves straight down and arrives from above.
function controls(a: Point, b: Point): [Point, Point] {
  const half = (b.y - a.y) / 2
  return [{ x: a.x, y: a.y + half }, { x: b.x, y: b.y - half }]
}

export function trailPath(points: Point[]): string {
  if (!points.length) return ''
  return points.slice(1).reduce((d, b, i) => {
    const [c1, c2] = controls(points[i], b)
    return `${d} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`
  }, `M ${points[0].x} ${points[0].y}`)
}

// Points along one curve, for the companion's walk.
export function curvePoints(a: Point, b: Point, steps = 16): Point[] {
  const [c1, c2] = controls(a, b)
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const u = 1 - t
    return {
      x: u ** 3 * a.x + 3 * u ** 2 * t * c1.x + 3 * u * t ** 2 * c2.x + t ** 3 * b.x,
      y: u ** 3 * a.y + 3 * u ** 2 * t * c1.y + 3 * u * t ** 2 * c2.y + t ** 3 * b.y,
    }
  })
}

export interface Scenery { emoji: string; x: number; y: number; size: number }

const SCENERY = ['🌲', '🌳', '🌲', '🌷', '🌼', '🍄', '🪨', '🌾', '🌳', '🦋', '🐇', '🌻']

// Trees and flowers on the side of each stretch the trail isn't on.
export function layoutScenery(points: Point[], width: number, seed = 11): Scenery[] {
  const random = seeded(seed)
  const items: Scenery[] = []
  for (let i = 0; i < points.length; i++) {
    const count = 2 + Math.floor(random() * 2)
    for (let k = 0; k < count; k++) {
      const pathLeft = points[i].x < width / 2
      const x = pathLeft ? width * (0.62 + random() * 0.3) : width * (0.06 + random() * 0.3)
      items.push({
        emoji: SCENERY[Math.floor(random() * SCENERY.length)],
        x: Math.round(x),
        y: Math.round(points[i].y - STOP_GAP * 0.35 + random() * STOP_GAP * 0.8),
        size: 18 + Math.round(random() * 14),
      })
    }
  }
  return items
}
