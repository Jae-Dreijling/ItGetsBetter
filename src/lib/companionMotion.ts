// The floating companion's idle wandering: now and then it drifts a little,
// peeks towards the middle, or walks off one side and back on the other.
// Pure choices here (testable); FloatingCompanion animates them.

export type CompanionMovement = 'still' | 'calm' | 'lively'

export interface Bounds {
  left: number
  right: number
  top: number
  bottom: number
}

export type Move =
  | { type: 'drift'; y: number }
  | { type: 'peek'; x: number }
  | { type: 'wrap'; exitX: number; enterX: number; endX: number }

// Random gaps between moves (ms), so it never feels like a metronome.
const DELAYS: Record<Exclude<CompanionMovement, 'still'>, [number, number]> = {
  calm: [30_000, 120_000],
  lively: [15_000, 45_000],
}

export function nextDelay(movement: CompanionMovement, random: number): number | null {
  if (movement === 'still') return null
  const [min, max] = DELAYS[movement]
  return Math.round(min + random * (max - min))
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

// `size` is the companion's full size; offscreen means fully out of view.
export function pickMove(at: { x: number; y: number }, bounds: Bounds, size: number, random: () => number): Move {
  const roll = random()
  if (roll < 0.45) {
    // Drift 40-120px up or down, turning around at the edges.
    const distance = 40 + random() * 80
    const up = random() < 0.5
    let y = at.y + (up ? -distance : distance)
    if (y < bounds.top || y > bounds.bottom) y = at.y + (up ? distance : -distance)
    return { type: 'drift', y: clamp(y, bounds.top, bounds.bottom) }
  }
  const onLeft = at.x + size / 2 < (bounds.left + bounds.right + size) / 2
  if (roll < 0.7) {
    // A short look towards the middle of the screen.
    return { type: 'peek', x: clamp(at.x + (onLeft ? 28 : -28), bounds.left, bounds.right) }
  }
  // Off the nearest side, back on from the other one.
  return onLeft
    ? { type: 'wrap', exitX: bounds.left - size, enterX: bounds.right + size, endX: bounds.right }
    : { type: 'wrap', exitX: bounds.right + size, enterX: bounds.left - size, endX: bounds.left }
}
