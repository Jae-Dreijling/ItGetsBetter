import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import {
  xpLevelInfo,
  statLevelInfo,
  deriveClass,
  type CharacterData,
  type CharacterStats,
  type StatKey,
} from '../lib/gamification'

// ─── Stat score weights ───────────────────────────────────────────────────────
// Calibrated so a consistent user after 6 months reaches level 8–10 per stat.
// See DOCUMENTATION/GAMIFICATION.md for the reasoning behind each divisor.

function buildStats(raw: {
  exerciseCount: number
  mealCount: number
  waterCount: number
  medicineTakenCount: number
  moodCount: number
  sleepCount: number
  habitCount: number
  taskCount: number
  activeDays: number
  booksFinished: number
  achievementsUnlocked: number
}): CharacterStats {
  return {
    // 1 exercise session = 1 Strength point → level 8 after ~64 sessions (~3×/week for 5 months)
    strength: raw.exerciseCount,

    // 13 nutrition events (meals + water + meds) = 1 Vitality point
    vitality: Math.floor((raw.mealCount + raw.waterCount + raw.medicineTakenCount) / 13),

    // 4 mind/rest entries (mood + sleep) = 1 Clarity point
    clarity: Math.floor((raw.moodCount + raw.sleepCount) / 4),

    // 6 habit or task completions = 1 Discipline point
    discipline: Math.floor((raw.habitCount + raw.taskCount) / 6),

    // Each active day = 0.4 Endurance points (level 7 after 150 active days in 6 months)
    endurance: Math.floor(raw.activeDays * 0.4),

    // Books are rare and high-value (×8); achievements are steady (×2)
    wisdom: raw.booksFinished * 8 + raw.achievementsUnlocked * 2,
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCharacter(): CharacterData | undefined {
  return useLiveQuery(async () => {
    // Single pass over pointsTransactions for XP + active-day count
    const transactions = await db.pointsTransactions.toArray()
    const xp = transactions.reduce((sum, t) => sum + t.amount, 0)
    const activeDays = new Set(transactions.map(t => t.date)).size

    const [
      exerciseCount,
      mealCount,
      waterCount,
      medicineTakenCount,
      moodCount,
      sleepCount,
      habitCount,
      taskCount,
      booksFinished,
      achievementsUnlocked,
    ] = await Promise.all([
      db.exerciseEntries.count(),
      db.mealEntries.count(),
      db.waterEntries.count(),
      db.medicineLogs.filter(l => l.taken).count(),
      db.moodEntries.count(),
      db.sleepEntries.count(),
      db.habitCompletions.count(),
      db.tasks.filter(t => t.is_completed).count(),
      db.books.where('status').equals('finished').count(),
      db.achievements.filter(a => a.is_unlocked).count(),
    ])

    const stats = buildStats({
      exerciseCount, mealCount, waterCount, medicineTakenCount,
      moodCount, sleepCount, habitCount, taskCount,
      activeDays, booksFinished, achievementsUnlocked,
    })

    const statLevels = (Object.keys(stats) as StatKey[]).reduce(
      (acc, key) => ({ ...acc, [key]: statLevelInfo(stats[key]) }),
      {} as Record<StatKey, ReturnType<typeof statLevelInfo>>,
    )

    return {
      xp,
      xpLevel: xpLevelInfo(xp),
      stats,
      statLevels,
      characterClass: deriveClass(stats),
    } satisfies CharacterData
  })
}
