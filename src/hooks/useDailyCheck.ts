import { useCallback, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { CHECKS, pickCheck, type CheckKind } from '../lib/dailyCheck'
import { isOn } from '../lib/features'
import { getFeatureTiers } from './useFeatures'
import { awardPoints } from './usePoints'
import { requestReschedule } from '../lib/notifications/native'

const STORAGE_KEY = 'igb_daily_check'

type CheckStatus = 'pending' | 'answered' | 'dismissed'

interface StoredCheck {
  date: string
  kind: CheckKind | null
  status: CheckStatus
  // When it was answered on the card (ms); drives the short "done" message.
  answeredAt?: number
}

// The table each check kind is logged in; all are indexed by date.
const TABLE_FOR: Record<CheckKind, string> = {
  weight: 'weightEntries',
  sleep: 'sleepEntries',
  mood: 'moodEntries',
  water: 'waterEntries',
  measurements: 'measurements',
  photo: 'progressPhotos',
  win: 'wins',
}

function readStored(): StoredCheck | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as StoredCheck | null
  } catch {
    return null
  }
}

function writeStored(check: StoredCheck) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(check))
}

async function daysSinceLast(kind: CheckKind, today: string): Promise<number | null> {
  const last = await db.table(TABLE_FOR[kind]).orderBy('date').last() as { date: string } | undefined
  return last ? differenceInCalendarDays(parseISO(today), parseISO(last.date)) : null
}

// Today's check, picked once per (logical) day and then kept as-is.
export async function getTodaysCheck(): Promise<StoredCheck> {
  const today = getLogicalDate()
  const stored = readStored()
  if (stored?.date === today) return stored

  const tiers = await getFeatureTiers()
  const eligible = CHECKS.filter(c => c.feature === null || isOn(tiers, c.feature)).map(c => c.kind)
  const daysSince: Partial<Record<CheckKind, number | null>> = {}
  for (const kind of eligible) daysSince[kind] = await daysSinceLast(kind, today)

  const check: StoredCheck = { date: today, kind: pickCheck(today, eligible, daysSince), status: 'pending' }
  writeStored(check)
  return check
}

export function useDailyCheck() {
  const [check, setCheck] = useState<StoredCheck | null>(null)

  useEffect(() => {
    getTodaysCheck().then(setCheck)
  }, [])

  // Logged elsewhere today (e.g. on the Weight page)? Then it's done, and
  // the Daily Check doesn't ask again (and has nothing to confirm).
  const loggedToday = useLiveQuery(async () => {
    if (!check?.kind) return false
    return (await db.table(TABLE_FOR[check.kind]).where('date').equals(check.date).count()) > 0
  }, [check?.kind, check?.date])

  const update = useCallback((status: CheckStatus) => {
    setCheck(prev => {
      if (!prev) return prev
      const next = { ...prev, status, ...(status === 'answered' ? { answeredAt: Date.now() } : {}) }
      writeStored(next)
      return next
    })
    // Today's reminder isn't needed anymore.
    requestReschedule()
  }, [])

  const markAnswered = useCallback(async () => {
    update('answered')
    await awardPoints('daily_check')
  }, [update])

  const dismiss = useCallback(() => update('dismissed'), [update])

  const status: CheckStatus | null = !check
    ? null
    : check.status === 'pending' && loggedToday ? 'answered' : check.status

  return { kind: check?.kind ?? null, status, answeredAt: check?.answeredAt ?? null, markAnswered, dismiss }
}

export async function addWin(text: string) {
  await db.wins.add({ date: getLogicalDate(), text: text.trim(), source: 'daily_check', logged_at: nowISO() })
}

// For the notification planner: answered, skipped or already logged today.
export async function isTodaysCheckDone(): Promise<boolean> {
  const check = await getTodaysCheck()
  if (!check.kind || check.status !== 'pending') return true
  return (await db.table(TABLE_FOR[check.kind]).where('date').equals(check.date).count()) > 0
}
