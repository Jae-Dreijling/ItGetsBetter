import { db } from '../db'
import { RESET_AREAS, storageKeysFor, type ResetArea } from './resetArea'

// Start fresh (Settings → Start fresh, V2-PLAN step 10f): you tick every part
// of the app that should be deleted; everything unticked stays. The parts are
// the same as "Reset parts of the app", plus your profile and settings, which
// also take any table no other part covers. So every table always belongs to
// some part, and nothing can be deleted (or kept) without being listed.

export const PROFILE_AREA_ID = 'profile'

export function freshAreas(): ResetArea[] {
  const covered = new Set(RESET_AREAS.flatMap(a => a.tables))
  // Folders belong to the list they're in (ResetArea.folders).
  covered.add('folders')
  const rest = db.tables.map(t => t.name).filter(name => !covered.has(name))
  return [
    ...RESET_AREAS,
    {
      id: PROFILE_AREA_ID, name: 'Profile, settings & labels', emoji: '👤',
      removes: 'your name and body details, theme, features, notifications, labels, schedule and every other setting; first-time setup starts again',
      tables: rest,
    },
  ]
}

// What a table holds, in words, for the list of what would be deleted.
const NOUNS: Record<string, [string, string]> = {
  userProfile: ['profile', 'profiles'], weightEntries: ['weigh-in', 'weigh-ins'], mealEntries: ['meal', 'meals'],
  measurements: ['measurement', 'measurements'], appOpenLog: ['day the app was opened', 'days the app was opened'],
  labels: ['label', 'labels'], habits: ['habit', 'habits'], habitCompletions: ['habit tick', 'habit ticks'],
  tasks: ['task', 'tasks'], projects: ['project', 'projects'], waterEntries: ['water entry', 'water entries'],
  exerciseEntries: ['workout', 'workouts'], moodEntries: ['mood entry', 'mood entries'], moodTags: ['mood tag', 'mood tags'],
  sleepEntries: ['night of sleep', 'nights of sleep'], medicines: ['medicine', 'medicines'], medicineLogs: ['dose taken', 'doses taken'],
  pointsTransactions: ['points entry', 'points entries'], rewards: ['reward', 'rewards'], rewardClaims: ['claimed reward', 'claimed rewards'],
  achievements: ['achievement', 'achievements'], progressPhotos: ['photo', 'photos'], groceryLists: ['grocery list', 'grocery lists'],
  groceryItems: ['grocery item', 'grocery items'], books: ['book', 'books'], companions: ['companion', 'companions'],
  motivationNotes: ['vault note', 'vault notes'], gameState: ['game save', 'game saves'], gameQuests: ['quest', 'quests'],
  gameCompanionAffinity: ['companion bond', 'companion bonds'], gameCustomQuestions: ['custom question', 'custom questions'],
  fastingRecords: ['fast', 'fasts'], companionMemories: ['thing a companion remembers', 'things companions remember'], companionGifts: ['gift in the gift safe', 'gifts in the gift safe'], personalityGroups: ['personality group', 'personality groups'], wins: ['win', 'wins'],
  recipes: ['recipe', 'recipes'], mealPlanItems: ['planned meal', 'planned meals'], abstinenceCounters: ['counter', 'counters'],
  abstinenceEvents: ['slip or craving', 'slips and cravings'], people: ['person', 'people'], socialContacts: ['catch-up', 'catch-ups'],
  goalTracks: ['goal', 'goals'], goalMilestones: ['goal step', 'goal steps'], nonScaleChecks: ['non-scale check-in', 'non-scale check-ins'],
  cravingEvents: ['craving check-in', 'craving check-ins'], futureLetters: ['letter', 'letters'], scheduleProfiles: ['schedule', 'schedules'],
}

export function describeCount(table: string, count: number): string {
  const [one, many] = NOUNS[table] ?? [table, table]
  return `${count} ${count === 1 ? one : many}`
}

export interface AreaContents {
  area: ResetArea
  // Only tables with something in them, e.g. [{ table: 'weightEntries', count: 214 }].
  counts: { table: string; count: number }[]
  folders: number
}

export async function areaContents(): Promise<AreaContents[]> {
  return Promise.all(freshAreas().map(async area => ({
    area,
    counts: (await Promise.all(area.tables.map(async table => ({ table, count: await db.table(table).count() })))).filter(c => c.count > 0),
    folders: area.folders ? await db.folders.where('area').equals(area.folders).count() : 0,
  })))
}

// Deletes every ticked part. A table shared by two parts (companion bonds
// are both Journey and Companions) goes when either is ticked.
export async function startFresh(deleteIds: Set<string>): Promise<void> {
  const areas = freshAreas()
  const ticked = areas.filter(a => deleteIds.has(a.id))
  const kept = areas.filter(a => !deleteIds.has(a.id))
  const tables = new Set(ticked.flatMap(a => a.tables))

  await db.transaction('rw', db.tables, async () => {
    for (const name of tables) await db.table(name).clear()
    for (const area of ticked) if (area.folders) await db.folders.where('area').equals(area.folders).delete()
  })

  try {
    if (deleteIds.has(PROFILE_AREA_ID)) {
      // Every setting goes, except those that belong to a part you keep.
      const keep = storageKeysFor(kept.flatMap(a => a.storage ?? [])).map(key => [key, localStorage.getItem(key)] as const)
      localStorage.clear()
      for (const [key, value] of keep) if (value !== null) localStorage.setItem(key, value)
    } else {
      for (const key of storageKeysFor(ticked.flatMap(a => a.storage ?? []))) localStorage.removeItem(key)
    }
  } catch { /* storage unavailable: nothing stored to clear */ }
}
