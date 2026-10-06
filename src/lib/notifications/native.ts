import { addDays, format, parseISO } from 'date-fns'
import { db } from '../../db'
import { getLogicalDate } from '../date'
import { isNativeApp } from '../platform'
import { floorHabits, floorProgress } from '../floor'
import { getWeeklyDefaults, type DayConfig, type ScheduleProfile } from '../../hooks/useSchedule'
import { isTodayScheduled } from '../../hooks/useHabits'
import { isTodaysCheckDone } from '../../hooks/useDailyCheck'
import { planReminders, minutesOf, type DayWindow, type NotificationPrefs } from './plan'
import { voiceFor } from './voice'

// Connects the notification plan to Android (Capacitor LocalNotifications).
// Everything is re-planned on every app open and after relevant changes, so
// already-done reminders get cancelled and nothing goes stale.

const PLAN_DAYS = 7
// Our reminder ids live in this range (see reminderId in plan.ts).
const OUR_IDS = { min: 1000, max: 1999 }
const TEST_ID = 999

async function plugin() {
  return (await import('@capacitor/local-notifications')).LocalNotifications
}

export async function notificationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!isNativeApp()) return 'denied'
  const { display } = await (await plugin()).checkPermissions()
  return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'prompt'
}

// Asks Android for permission (shows the system dialog the first time).
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNativeApp()) return false
  const { display } = await (await plugin()).requestPermissions()
  return display === 'granted'
}

// Allowed hours per day: from an hour after waking until an hour before the
// target sleep time (the inverse of the phone-free window). Quiet mode = none.
async function dayWindows(today: string): Promise<DayWindow[]> {
  const profiles = await db.table('scheduleProfiles').toArray() as ScheduleProfile[]
  const configs = await db.table('dayConfigs').toArray() as DayConfig[]
  const weekly = getWeeklyDefaults()

  return Array.from({ length: PLAN_DAYS }, (_, i) => {
    const date = format(addDays(parseISO(today), i), 'yyyy-MM-dd')
    const config = configs.find(c => c.date === date)
    const profileName = config?.schedule_profile ?? weekly[parseISO(date).getDay()] ?? 'free_day'
    const profile = profiles.find(p => p.profile_name === profileName)
    const start = profile ? minutesOf(profile.wake_time) + 60 : 9 * 60
    const sleep = profile ? minutesOf(profile.target_sleep_time) : 23 * 60
    // A sleep time after midnight still allows reminders until late evening.
    const end = sleep - 60 > start ? sleep - 60 : 23 * 60
    return { date, startMinute: Math.min(start, 23 * 60), endMinute: end, quiet: config?.active_mode === 'quiet' }
  })
}

async function todayStatus(today: string) {
  const habits = await db.habits.toArray()
  const floor = floorHabits(habits).filter(isTodayScheduled)
  const completions = await db.habitCompletions.where('date').equals(today).toArray()
  return {
    dailyCheckDone: await isTodaysCheckDone(),
    hasFloor: floorHabits(habits).length > 0,
    floorComplete: floorProgress(floor, new Set(completions.map(c => c.habit_id))).complete,
  }
}

async function cancelOurs() {
  const notifications = await plugin()
  const { notifications: pending } = await notifications.getPending()
  const ours = pending.filter(n => n.id >= OUR_IDS.min && n.id <= OUR_IDS.max)
  if (ours.length > 0) await notifications.cancel({ notifications: ours.map(n => ({ id: n.id })) })
}

async function reschedule() {
  if (!isNativeApp()) return
  const profile = await db.userProfile.toCollection().first()
  const prefs: NotificationPrefs | undefined = profile?.notification_prefs
  const anyOn = !!prefs && Object.values(prefs).some(p => p?.on)

  await cancelOurs()
  if (!anyOn || (await notificationPermission()) !== 'granted') return

  const today = getLogicalDate()
  const plan = planReminders(new Date(), await dayWindows(today), prefs, await todayStatus(today))
  if (plan.length === 0) return

  const userName = profile?.display_name ?? 'friend'
  const notifications = await Promise.all(plan.map(async p => {
    const voice = await voiceFor(p.kind, p.date, userName)
    // Inexact on purpose: exact alarms would make Android open a settings
    // screen, and a reminder a few minutes late is fine.
    return { id: p.id, title: voice.title, body: voice.body, isExactNotification: false, schedule: { at: p.at, allowWhileIdle: true } }
  }))
  await (await plugin()).schedule({ notifications })
}

let timer: ReturnType<typeof setTimeout> | null = null

// Re-plans shortly after being called; several calls in a row plan once.
export function requestReschedule() {
  if (!isNativeApp()) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    reschedule().catch(err => console.warn('Could not schedule notifications', err))
  }, 800)
}

// A sample from today's companion, a few seconds from now.
export async function sendTestNotification(userName: string) {
  const voice = await voiceFor('daily_check', getLogicalDate(), userName)
  await (await plugin()).schedule({
    notifications: [{ id: TEST_ID, title: voice.title, body: voice.body, isExactNotification: false, schedule: { at: new Date(Date.now() + 3000), allowWhileIdle: true } }],
  })
}
