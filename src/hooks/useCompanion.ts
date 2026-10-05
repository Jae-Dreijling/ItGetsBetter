import { useSyncExternalStore } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import { getRandomMessage } from '../lib/supportiveMessages'
import { getSessionCompanionId, setSessionCompanionId, subscribeSessionCompanion, pickSessionCompanion } from '../lib/sessionCompanion'
import type { Companion, CompanionMessages } from '../types'

const EMPTY_MESSAGES: CompanionMessages = {
  general: [],
  morning_greeting: [],
  welcome_back: [],
  achievement_unlocked: [],
  habit_completed: [],
  task_completed: [],
  mood_low: [],
  fasting_goal: [],
  streak_milestone: [],
  phone_free: [],
  points_earned: [],
  weight_loss: [],
  weight_gain: [],
  exercise_logged: [],
  water_goal_met: [],
  sleep_logged: [],
  personal_best: [],
  level_up: [],
  boss_defeated: [],
  goodnight: [],
  first_milestone: [],
  idle: [],
}

export type CompanionEvent = keyof CompanionMessages

export function useCompanions() {
  return useLiveQuery(() => db.companions.toArray())
}

export function useSessionCompanionId(): number | null {
  return useSyncExternalStore(subscribeSessionCompanion, getSessionCompanionId)
}

// Multiple companions can be marked active; one is randomly picked to speak
// for the current session, unless the user taps one on the Companions page.
// The pick lives in sessionStorage (lib/sessionCompanion), so it stays the same
// across navigations and re-randomizes next time the app is opened.
export function useSessionCompanion() {
  const storedId = useSessionCompanionId()
  return useLiveQuery(async () => {
    const picked = pickSessionCompanion(await db.companions.toArray(), storedId)
    if (picked?.id !== undefined && picked.is_active && picked.id !== storedId) {
      setSessionCompanionId(picked.id)
    }
    return picked
  }, [storedId])
}

// Merges a companion's own messages with its personality group's shared pool
// (if any) — see PersonalityGroup in types/entities.ts. Live: editing the
// group's messages updates every companion using it immediately.
export function useEffectiveMessages(companion: Companion | undefined): CompanionMessages | undefined {
  return useLiveQuery(async () => {
    if (!companion) return undefined
    if (companion.personality_group_id == null) return companion.messages

    const group = await db.personalityGroups.get(companion.personality_group_id)
    if (!group) return companion.messages

    const merged = { ...EMPTY_MESSAGES }
    for (const key of Object.keys(EMPTY_MESSAGES) as CompanionEvent[]) {
      merged[key] = [...(companion.messages[key] ?? []), ...(group.messages[key] ?? [])]
    }
    return merged
  }, [companion?.id, companion?.personality_group_id, companion?.messages])
}

export function getCompanionMessage(messages: CompanionMessages | undefined, event: CompanionEvent, name: string): string {
  if (!messages) return getRandomMessage(name)

  const pool = messages[event]
  if (pool && pool.length > 0) {
    const msg = pool[Math.floor(Math.random() * pool.length)]
    return msg.replace('{name}', name)
  }

  const general = messages.general
  if (general && general.length > 0) {
    const msg = general[Math.floor(Math.random() * general.length)]
    return msg.replace('{name}', name)
  }

  return getRandomMessage(name)
}

export async function addCompanion(data: {
  name: string
  avatar: Blob | null
  personality_group_id?: number | null
  messages?: Partial<CompanionMessages>
}) {
  return db.companions.add({
    name: data.name,
    avatar: data.avatar,
    is_default: false,
    is_active: true,
    personality_group_id: data.personality_group_id ?? null,
    messages: { ...EMPTY_MESSAGES, ...data.messages },
    created_at: nowISO(),
  })
}

export async function updateCompanion(id: number, changes: Partial<{
  name: string
  avatar: Blob | null
  messages: CompanionMessages
  personality_group_id: number | null
}>) {
  await db.companions.update(id, changes)
}

export async function deleteCompanion(id: number) {
  await db.companions.delete(id)
}

export async function setCompanionActive(id: number, isActive: boolean) {
  await db.companions.update(id, { is_active: isActive })
}

// Called from more than one place on app start (App and FloatingCompanion),
// so the check and the add share one transaction: otherwise two concurrent
// calls both see "no default yet" and the app gets two default companions.
//
// Installs from before that fix can already have duplicates, and default
// companions can't be deleted in the UI. Extras become normal companions
// named "... (copy)", so nothing is lost and the user can delete them.
export async function ensureDefaultCompanion() {
  await db.transaction('rw', db.companions, async () => {
    const defaults = await db.companions.filter(c => c.is_default === true).sortBy('id')
    if (defaults.length === 0) {
      await db.companions.add(createDefaultCompanion())
      return
    }
    for (const extra of defaults.slice(1)) {
      await db.companions.update(extra.id!, { is_default: false, name: `${extra.name} (copy)` })
    }
  })
}

function createDefaultCompanion(): Companion {
  const defaultMessages: CompanionMessages = {
    general: [
      "Good to see you, {name}. You're doing great.",
      "Welcome back, {name}. I'm proud of you for showing up.",
      "{name}, you're building something beautiful — one day at a time.",
      "You showed up today, {name}. That matters more than you think.",
      "Hey {name}, you don't have to be perfect. You just have to try.",
      "{name}, even on hard days, you're still moving forward.",
      "Welcome, {name}. This is your space. No judgment, no pressure.",
      "{name}, small wins add up to big changes. Keep going.",
    ],
    morning_greeting: [
      "Good morning, {name}. Today is a fresh start.",
      "Rise and shine, {name}. Whatever today brings, you can handle it.",
      "Hey {name}, new day, new chances. Let's go gently.",
    ],
    welcome_back: [
      "Welcome back, {name}. I missed you. No questions, no guilt — just glad you're here.",
      "Hey {name}. You came back, and that takes courage. I'm proud of you.",
      "{name}, welcome home. Pick up wherever feels right — no pressure.",
    ],
    achievement_unlocked: [
      "Look at you, {name}! You earned that! 🎉",
      "{name}, you just unlocked something awesome!",
      "Achievement unlocked! {name}, you're incredible.",
    ],
    habit_completed: [
      "Nice one, {name}! Keep that momentum going.",
      "Checked off! {name}, consistency is your superpower.",
      "Done! Every small step counts, {name}.",
    ],
    task_completed: [
      "One more thing off your plate, {name}!",
      "Task done! {name}, look at you getting things sorted.",
      "Checked off the list, {name}. Nice work.",
    ],
    mood_low: [
      "It's okay, {name}. Log when you're ready. Even imperfect is progress.",
      "{name}, bad days happen. You're not alone in this.",
      "Be gentle with yourself today, {name}. You deserve it.",
    ],
    fasting_goal: [
      "Fasting goal hit! {name}, your discipline is showing.",
      "{name}, you made it through. That takes real strength.",
    ],
    streak_milestone: [
      "{name}, look at that streak! You're unstoppable.",
      "Streak milestone! {name}, consistency is everything.",
    ],
    phone_free: [
      "Hey {name}, this is your phone-free time. Take a break! 📵",
      "{name}, put the phone down. You earned this rest.",
    ],
    points_earned: [
      "Points earned, {name}! Every action counts.",
      "Cha-ching! {name}, you're building up rewards.",
    ],
    weight_loss: [
      "{name}, you're making progress! The trend is going the right way.",
      "Weight coming down, {name}! Your body thanks you.",
    ],
    weight_gain: [
      "Numbers move both ways, {name}. This doesn't undo your progress.",
      "{name}, one entry isn't the whole story. Keep going.",
    ],
    exercise_logged: [
      "Nice work moving today, {name}!",
      "Logged and done, {name}. Your body thanks you.",
    ],
    water_goal_met: [
      "Water goal hit, {name}! Nicely hydrated.",
      "{name}, that's your water goal for today. Well done.",
    ],
    sleep_logged: [
      "Rest logged, {name}. Taking care of yourself counts too.",
      "{name}, thanks for tracking that. Sleep matters.",
    ],
    personal_best: [
      "{name}, that's a new personal best! Incredible.",
      "New record, {name}! You just outdid yourself.",
    ],
    level_up: [
      "Level up, {name}! Look how far you've come.",
      "{name}, you've grown. That's not nothing.",
    ],
    boss_defeated: [
      "Victory, {name}! That boss didn't stand a chance.",
      "{name}, you did it! On to the next chapter.",
    ],
    goodnight: [
      "Getting close to bedtime, {name}. Start winding down.",
      "{name}, good night's coming up. Take it easy from here.",
    ],
    first_milestone: [
      "{name}, that's your first one! Here's to many more.",
      "First time's always special, {name}. Nicely done.",
    ],
    idle: [
      "Still here, {name}? Need anything?",
      "Hey {name}, just checking in. You good?",
      "Take your time, {name}. I'm not going anywhere.",
      "{name}, remember to stay hydrated! 💧",
      "Just vibing here with you, {name}.",
      "You know what would be nice? A glass of water.",
      "{name}, don't forget to breathe. In... and out.",
    ],
  }

  return {
    name: 'ItGetsBetter',
    avatar: null,
    is_default: true,
    is_active: true,
    personality_group_id: null,
    messages: defaultMessages,
    created_at: nowISO(),
  }
}
