import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import { getRandomMessage } from '../lib/supportiveMessages'
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
  idle: [],
}

export type CompanionEvent = keyof CompanionMessages

export function useCompanions() {
  return useLiveQuery(() => db.companions.toArray())
}

const SESSION_COMPANION_KEY = 'igb_session_companion_id'

// Multiple companions can be marked active; one is randomly picked to speak
// for the current session (persisted in sessionStorage so it stays the same
// companion across navigations, and re-randomizes next time the app is opened).
export function useSessionCompanion() {
  return useLiveQuery(async () => {
    const active = await db.companions.filter(c => c.is_active === true).toArray()

    if (active.length === 0) {
      return db.companions.filter(c => c.is_default === true).first()
    }

    const storedId = sessionStorage.getItem(SESSION_COMPANION_KEY)
    if (storedId) {
      const match = active.find(c => c.id === Number(storedId))
      if (match) return match
    }

    const picked = active[Math.floor(Math.random() * active.length)]
    sessionStorage.setItem(SESSION_COMPANION_KEY, String(picked.id))
    return picked
  })
}

export function getCompanionMessage(companion: Companion | undefined, event: CompanionEvent, name: string): string {
  if (!companion) return getRandomMessage(name)

  const pool = companion.messages[event]
  if (pool && pool.length > 0) {
    const msg = pool[Math.floor(Math.random() * pool.length)]
    return msg.replace('{name}', name)
  }

  const general = companion.messages.general
  if (general && general.length > 0) {
    const msg = general[Math.floor(Math.random() * general.length)]
    return msg.replace('{name}', name)
  }

  return getRandomMessage(name)
}

export async function addCompanion(data: {
  name: string
  avatar: Blob | null
  messages?: Partial<CompanionMessages>
}) {
  return db.companions.add({
    name: data.name,
    avatar: data.avatar,
    is_default: false,
    is_active: true,
    messages: { ...EMPTY_MESSAGES, ...data.messages },
    created_at: nowISO(),
  })
}

export async function updateCompanion(id: number, changes: Partial<{
  name: string
  avatar: Blob | null
  messages: CompanionMessages
}>) {
  await db.companions.update(id, changes)
}

export async function deleteCompanion(id: number) {
  await db.companions.delete(id)
}

export async function setCompanionActive(id: number, isActive: boolean) {
  await db.companions.update(id, { is_active: isActive })
}

export async function ensureDefaultCompanion() {
  const count = await db.companions.filter(c => c.is_default === true).count()
  if (count > 0) return

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

  await db.companions.add({
    name: 'ItGetsBetter',
    avatar: null,
    is_default: true,
    is_active: true,
    messages: defaultMessages,
    created_at: nowISO(),
  })
}
