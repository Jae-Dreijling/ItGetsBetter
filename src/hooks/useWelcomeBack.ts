import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate } from '../lib/date'

export function useIsReturningAfterAbsence(thresholdDays: number = 2): boolean | undefined {
  return useLiveQuery(async () => {
    const today = getLogicalDate()
    const logs = await db.appOpenLog
      .orderBy('date')
      .reverse()
      .limit(10)
      .toArray()

    if (logs.length < 2) return false

    const uniqueDates = [...new Set(logs.map(l => l.date))].sort().reverse()

    if (uniqueDates[0] !== today) return false
    if (uniqueDates.length < 2) return false

    const lastDate = new Date(uniqueDates[1] + 'T12:00:00')
    const todayDate = new Date(today + 'T12:00:00')
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    return diffDays >= thresholdDays
  })
}

const welcomeBackMessages = [
  "Welcome back, {name}. I missed you. No questions, no guilt — just glad you're here.",
  "Hey {name}. You came back, and that takes courage. I'm proud of you.",
  "{name}, welcome home. Pick up wherever feels right — no pressure.",
  "You're back, {name}. That's all that matters. Let's take it easy today.",
  "Hi {name}. Life happens. You're here now, and that's enough.",
  "{name}, I saved your spot. Nothing was lost while you were away.",
  "Welcome back, {name}. Fresh start, same warmth. Let's go gently.",
]

export function getWelcomeBackMessage(name: string): string {
  const index = Math.floor(Math.random() * welcomeBackMessages.length)
  return welcomeBackMessages[index].replace('{name}', name)
}
