import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import type { AbstinenceCounter, AbstinenceEvent } from '../types'

export type CounterInput = Pick<AbstinenceCounter, 'name' | 'emoji' | 'started_at' | 'why' | 'cost_per_day'>

export function useCounters() {
  return useLiveQuery(() => db.abstinenceCounters.orderBy('created_at').filter(c => !c.archived).toArray())
}

// undefined while loading, null when it doesn't exist.
export function useCounter(id: number) {
  return useLiveQuery(async () => (await db.abstinenceCounters.get(id)) ?? null, [id])
}

export function useCounterEvents(counterId?: number) {
  return useLiveQuery(
    () => counterId === undefined
      ? db.abstinenceEvents.toArray()
      : db.abstinenceEvents.where('counter_id').equals(counterId).sortBy('at'),
    [counterId]
  ) ?? []
}

// The current time, refreshed every `intervalMs`, for live timers.
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

export async function saveCounter(data: CounterInput, id?: number): Promise<number> {
  if (id !== undefined) {
    await db.abstinenceCounters.update(id, data)
    return id
  }
  return await db.abstinenceCounters.add({ ...data, archived: false, created_at: nowISO() }) as number
}

export async function archiveCounter(id: number) {
  await db.abstinenceCounters.update(id, { archived: true })
}

export async function deleteCounter(id: number) {
  await db.transaction('rw', db.abstinenceCounters, db.abstinenceEvents, async () => {
    await db.abstinenceEvents.where('counter_id').equals(id).delete()
    await db.abstinenceCounters.delete(id)
  })
}

export async function logEvent(counterId: number, kind: AbstinenceEvent['kind'], context: string | null = null, at = nowISO()) {
  await db.abstinenceEvents.add({ counter_id: counterId, kind, at, context })
}

export async function deleteEvent(id: number) {
  await db.abstinenceEvents.delete(id)
}
