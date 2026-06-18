import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import type { MeasurementEntry } from '../types'

export function useLatestMeasurement() {
  return useLiveQuery(() =>
    db.measurements.orderBy('date').last()
  )
}

export function useMeasurements() {
  return useLiveQuery(() =>
    db.measurements.orderBy('date').reverse().toArray()
  )
}

type MeasurementFields = Omit<MeasurementEntry, 'id' | 'date' | 'logged_at'>

export async function addMeasurement(
  data: Partial<MeasurementFields> & { date?: string }
) {
  await db.measurements.add({
    date: data.date ?? getLogicalDate(),
    neck_cm: data.neck_cm ?? null,
    chest_cm: data.chest_cm ?? null,
    hips_cm: data.hips_cm ?? null,
    waist_cm: data.waist_cm ?? null,
    arms_cm: data.arms_cm ?? null,
    thighs_cm: data.thighs_cm ?? null,
    ankles_cm: data.ankles_cm ?? null,
    wrists_cm: data.wrists_cm ?? null,
    logged_at: nowISO(),
  })
}
