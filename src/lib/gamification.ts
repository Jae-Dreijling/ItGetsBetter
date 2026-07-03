// ─── Types ────────────────────────────────────────────────────────────────────

export type StatKey = 'strength' | 'vitality' | 'clarity' | 'discipline' | 'endurance' | 'wisdom'

export type CharacterClass =
  | 'adventurer'
  | 'athlete'
  | 'nurturer'
  | 'sage'
  | 'guardian'
  | 'wanderer'
  | 'scholar'

export interface StatDef {
  key: StatKey
  emoji: string
  name: string
  description: string
  color: string // Tailwind bg class for progress bar
}

export interface ClassDef {
  emoji: string
  name: string
  tagline: string
}

export interface LevelInfo {
  level: number
  progress: number  // 0–1 within the current level band
  toNext: number    // raw score needed to reach next level
}

export interface CharacterStats {
  strength: number
  vitality: number
  clarity: number
  discipline: number
  endurance: number
  wisdom: number
}

export interface CharacterData {
  xp: number
  xpLevel: LevelInfo
  stats: CharacterStats
  statLevels: Record<StatKey, LevelInfo>
  characterClass: CharacterClass
}

// ─── Stat definitions ─────────────────────────────────────────────────────────

export const STAT_DEFS: StatDef[] = [
  { key: 'strength',   emoji: '💪', name: 'Strength',   description: 'Exercise & physical activity',   color: 'bg-red-400'     },
  { key: 'vitality',   emoji: '💚', name: 'Vitality',   description: 'Meals, water & medicine',        color: 'bg-emerald-400' },
  { key: 'clarity',    emoji: '🧘', name: 'Clarity',    description: 'Mood, sleep & meditation',       color: 'bg-sky-400'     },
  { key: 'discipline', emoji: '🔥', name: 'Discipline', description: 'Habits & tasks completed',       color: 'bg-primary-400' },
  { key: 'endurance',  emoji: '⚡', name: 'Endurance',  description: 'Days you showed up',             color: 'bg-amber-400'   },
  { key: 'wisdom',     emoji: '📚', name: 'Wisdom',     description: 'Books finished & achievements',  color: 'bg-violet-400'  },
]

// ─── Class definitions ────────────────────────────────────────────────────────

export const CLASS_DEFS: Record<CharacterClass, ClassDef> = {
  adventurer: { emoji: '⚔️',  name: 'Adventurer', tagline: 'A bit of everything, every day'       },
  athlete:    { emoji: '🏃',  name: 'Athlete',    tagline: 'Action is your answer'                },
  nurturer:   { emoji: '🌿',  name: 'Nurturer',   tagline: 'You nourish yourself first'           },
  sage:       { emoji: '🧘',  name: 'Sage',       tagline: 'Mind and rest are your foundation'    },
  guardian:   { emoji: '🛡️', name: 'Guardian',   tagline: 'Discipline is your superpower'        },
  wanderer:   { emoji: '🗺️', name: 'Wanderer',   tagline: 'You show up, every single day'        },
  scholar:    { emoji: '📖',  name: 'Scholar',    tagline: 'Growth never stops'                   },
}

// ─── Level formulas ───────────────────────────────────────────────────────────
//
// Stat level  : level = floor(sqrt(score))
//   Scores are calibrated so ~6 months of regular use → level 8–10
//   Scoring weights documented in GAMIFICATION.md
//
// Global XP level: level = floor(sqrt(xp / 50))
//   Uses the same curve but divided by 50 because XP accumulates faster
//   than individual stat scores. After 6 months of regular use → level 10–14.
//
// Numbers never go down — scores only accumulate.

function computeLevelInfo(rawScore: number, divisor: number): LevelInfo {
  if (rawScore <= 0) return { level: 0, progress: 0, toNext: divisor }
  const scaled = rawScore / divisor
  const level = Math.floor(Math.sqrt(scaled))
  const currentStart = level * level * divisor
  const nextStart = (level + 1) * (level + 1) * divisor
  return {
    level,
    progress: (rawScore - currentStart) / (nextStart - currentStart),
    toNext: Math.ceil(nextStart - rawScore),
  }
}

export function xpLevelInfo(xp: number): LevelInfo {
  return computeLevelInfo(xp, 50)
}

export function statLevelInfo(score: number): LevelInfo {
  return computeLevelInfo(score, 1)
}

export function statLevel(score: number): number {
  return score <= 0 ? 0 : Math.floor(Math.sqrt(score))
}

// ─── Class derivation ─────────────────────────────────────────────────────────

export function deriveClass(stats: CharacterStats): CharacterClass {
  const levels: Record<StatKey, number> = {
    strength:   statLevel(stats.strength),
    vitality:   statLevel(stats.vitality),
    clarity:    statLevel(stats.clarity),
    discipline: statLevel(stats.discipline),
    endurance:  statLevel(stats.endurance),
    wisdom:     statLevel(stats.wisdom),
  }

  const values = Object.values(levels)
  const maxLevel = Math.max(...values)

  if (maxLevel === 0) return 'adventurer'

  const average = values.reduce((a, b) => a + b, 0) / values.length

  // If no stat dominates (max within 2 of average) → balanced Adventurer
  if (maxLevel - average <= 2) return 'adventurer'

  const leader = (Object.keys(levels) as StatKey[]).find(k => levels[k] === maxLevel)!

  const CLASS_MAP: Record<StatKey, CharacterClass> = {
    strength:   'athlete',
    vitality:   'nurturer',
    clarity:    'sage',
    discipline: 'guardian',
    endurance:  'wanderer',
    wisdom:     'scholar',
  }

  return CLASS_MAP[leader]
}
