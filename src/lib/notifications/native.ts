import { addDays, format, parseISO } from 'date-fns'
import { db } from '../../db'
import { getLogicalDate } from '../date'
import { isNativeApp } from '../platform'
import { floorHabits, floorProgress } from '../floor'
import { getWeeklyDefaults, type DayConfig, type ScheduleProfile } from '../../hooks/useSchedule'
import { isTodayScheduled } from '../../hooks/useHabits'
import { isTodaysCheckDone } from '../../hooks/useDailyCheck'
import { planReminders, minutesOf, type DayWindow, type NotificationPrefs } from './plan'
import { voiceFor, speakerFor } from './voice'
import { socialReminders } from '../social'
import { isSpotlight } from '../features'

// Connects the notification plan to Android (Capacitor LocalNotifications).
// Everything is re-planned on every app open and after relevant changes, so
// already-done reminders get cancelled and nothing goes stale.

const PLAN_DAYS = 7
// Our reminder ids live in this range (see reminderId in plan.ts).
const OUR_IDS = { min: 1000, max: 1999 }
const TEST_ID = 999

// Resolves to the module, never to the plugin itself: a Capacitor plugin
// answers every property, `then` included, so a promise that resolves to it
// calls LocalNotifications.then() and fails ("not implemented on android").
function pluginModule() {
  return import('@capacitor/local-notifications')
}

export async function notificationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!isNativeApp()) return 'denied'
  const { display } = await (await pluginModule()).LocalNotifications.checkPermissions()
  return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'prompt'
}

// Asks Android for permission (shows the system dialog the first time).
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNativeApp()) return false
  const { display } = await (await pluginModule()).LocalNotifications.requestPermissions()
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
  const notifications = (await pluginModule()).LocalNotifications
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
  const windows = await dayWindows(today)
  // Social reminders only while Social is in the spotlight (Rulebook 2.4).
  const social = prefs?.social?.on && isSpotlight(profile?.feature_tiers, 'social')
    ? socialReminders(await db.people.toArray(), await db.socialContacts.toArray(), windows.map(w => w.date))
    : new Map<string, string[]>()
  const plan = planReminders(new Date(), windows, prefs, await todayStatus(today), new Set(social.keys()))
  if (plan.length === 0) return

  const userName = profile?.display_name ?? 'friend'
  const notifications = await Promise.all(plan.map(async p => {
    const voice = p.kind === 'social'
      ? { title: (await speakerFor(p.date))?.name ?? 'ItGetsBetter', body: social.get(p.date)!.join(' ') }
      : await voiceFor(p.kind, p.date, userName)
    // Inexact on purpose: exact alarms would make Android open a settings
    // screen, and a reminder a few minutes late is fine.
    return { id: p.id, title: voice.title, body: voice.body, isExactNotification: false, schedule: { at: p.at, allowWhileIdle: true } }
  }))
  await (await pluginModule()).LocalNotifications.schedule({ notifications })
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

// A sample from today's companion. Without a delay it's shown right away (no
// alarm involved); with one it goes through an alarm like real reminders.
export async function sendTestNotification(userName: string, delayMs = 0) {
  const voice = await voiceFor('daily_check', getLogicalDate(), userName)
  const schedule = delayMs > 0 ? { at: new Date(Date.now() + delayMs), allowWhileIdle: true } : undefined
  await (await pluginModule()).LocalNotifications.schedule({
    notifications: [{ id: TEST_ID, title: voice.title, body: voice.body, isExactNotification: false, schedule }],
  })
}

export interface NotificationDiagnostics {
  permission: string
  enabled: boolean
  exactAlarms: string
  // Importance 0 means the channel was switched off in Android's settings.
  channels: { id: string; name: string; importance: number | null }[]
  pending: { id: number; at: string | null }[]
}

// Everything that can silently stop a notification, for the settings page.
export async function getNotificationDiagnostics(): Promise<NotificationDiagnostics> {
  const n = (await pluginModule()).LocalNotifications
  const [permission, enabled, exact, channels, pending] = await Promise.all([
    n.checkPermissions().then(r => r.display, () => 'unknown'),
    n.areEnabled().then(r => r.value, () => false),
    n.checkExactNotificationSetting().then(r => r.exact_alarm, () => 'unknown'),
    n.listChannels().then(r => r.channels, () => []),
    n.getPending().then(r => r.notifications, () => []),
  ])
  return {
    permission,
    enabled,
    exactAlarms: exact,
    channels: channels.map(c => ({ id: c.id, name: c.name, importance: c.importance ?? null })),
    pending: pending
      .map(p => ({ id: p.id, at: p.schedule?.at ? new Date(p.schedule.at).toISOString() : null }))
      .sort((a, b) => (a.at ?? '').localeCompare(b.at ?? '')),
  }
}
