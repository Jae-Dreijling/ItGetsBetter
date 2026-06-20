import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate } from '../lib/date'

export type ActiveMode = 'none' | 'exam' | 'social' | 'quiet'

export interface ScheduleProfile {
  id?: number
  profile_name: string
  wake_time: string
  phone_free_until: string
  expected_first_meal: string
  expected_dinner: string
  phone_away_at: string
  target_sleep_time: string
}

export interface DayConfig {
  date: string
  schedule_profile: string
  active_mode: ActiveMode
}

export function useScheduleProfiles() {
  return useLiveQuery(() =>
    db.table('scheduleProfiles').toArray() as Promise<ScheduleProfile[]>
  )
}

export function useTodayConfig() {
  const today = getLogicalDate()
  return useLiveQuery(
    () => db.table('dayConfigs').get(today) as Promise<DayConfig | undefined>,
    [today]
  )
}

export function useTodaySchedule() {
  const profiles = useScheduleProfiles()
  const config = useTodayConfig()

  const profileName = config?.schedule_profile ?? 'free_day'
  const profile = profiles?.find(p => p.profile_name === profileName) ?? null
  const mode: ActiveMode = config?.active_mode ?? 'none'

  return { profile, mode, profileName }
}

export async function setDayProfile(date: string, profileName: string) {
  const existing = await db.table('dayConfigs').get(date)
  if (existing) {
    await db.table('dayConfigs').update(date, { schedule_profile: profileName })
  } else {
    await db.table('dayConfigs').add({ date, schedule_profile: profileName, active_mode: 'none' })
  }
}

export async function setDayMode(date: string, mode: ActiveMode) {
  const existing = await db.table('dayConfigs').get(date)
  if (existing) {
    await db.table('dayConfigs').update(date, { active_mode: mode })
  } else {
    await db.table('dayConfigs').add({ date, schedule_profile: 'free_day', active_mode: mode })
  }
}

export async function updateScheduleProfile(id: number, changes: Partial<ScheduleProfile>) {
  await db.table('scheduleProfiles').update(id, changes)
}
