import { db } from '../../db'
import { seededRandom } from '../dailyCheck'
import type { Companion, CompanionMessages } from '../../types'
import type { ReminderKind } from './plan'

// Notifications are spoken by a companion: its name is the title, the text
// comes from its own reminder lines (or its personality group's), falling
// back to these defaults. One companion speaks for a whole day.

const CATEGORY: Record<ReminderKind, keyof CompanionMessages> = {
  daily_check: 'reminder_daily_check',
  floor: 'reminder_floor',
}

export const DEFAULT_LINES: Record<ReminderKind, string[]> = {
  daily_check: [
    "{name}, today's little check is waiting for you. No rush.",
    "One quick question for you today, {name}, whenever you're ready.",
    'Got a minute, {name}? Your daily check is one tap.',
  ],
  floor: [
    'Your floor is still open, {name}. Even one counts.',
    '{name}, a tiny bit of your floor before bed? Only if it feels okay.',
    "Hey {name}, your floor's waiting. Small is enough today.",
  ],
}

export interface Voice {
  title: string
  body: string
}

async function effectiveMessages(companion: Companion): Promise<Partial<CompanionMessages>> {
  if (companion.personality_group_id == null) return companion.messages
  const group = await db.personalityGroups.get(companion.personality_group_id)
  if (!group) return companion.messages
  const merged: Partial<CompanionMessages> = { ...companion.messages }
  for (const key of Object.keys(CATEGORY).map(k => CATEGORY[k as ReminderKind])) {
    merged[key] = [...(companion.messages[key] ?? []), ...(group.messages[key] ?? [])]
  }
  return merged
}

// The companion speaking on a given day: a seeded pick among active
// companions, falling back to the default one.
export async function speakerFor(date: string): Promise<Companion | undefined> {
  const companions = await db.companions.toArray()
  const active = companions.filter(c => c.is_active)
  const pool = active.length > 0 ? active : companions.filter(c => c.is_default)
  if (pool.length === 0) return undefined
  return pool[Math.floor(seededRandom(`speaker:${date}`) * pool.length)]
}

export async function voiceFor(kind: ReminderKind, date: string, userName: string): Promise<Voice> {
  const companion = await speakerFor(date)
  const own = companion ? (await effectiveMessages(companion))[CATEGORY[kind]] ?? [] : []
  const lines = own.length > 0 ? own : DEFAULT_LINES[kind]
  const line = lines[Math.floor(seededRandom(`line:${kind}:${date}`) * lines.length)]
  return {
    title: companion?.name ?? 'ItGetsBetter',
    body: line.replaceAll('{name}', userName),
  }
}
