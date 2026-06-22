import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'

export function useActiveMedicines() {
  return useLiveQuery(() =>
    db.medicines.filter(m => m.is_active === true).toArray()
  )
}

export function isMedicineDueToday(medicine: { id?: number; frequency: string; created_at: string }): boolean {
  const freq = medicine.frequency
  if (freq === 'daily') return true
  if (freq === 'as needed') return true

  if (freq === 'every other day') {
    const created = new Date(medicine.created_at)
    const today = new Date(getLogicalDate() + 'T12:00:00')
    const daysDiff = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff % 2 === 0
  }

  if (freq === 'weekly') {
    const created = new Date(medicine.created_at)
    const today = new Date(getLogicalDate() + 'T12:00:00')
    return today.getDay() === created.getDay()
  }

  return true
}

export function useTodaysMedicines() {
  const active = useActiveMedicines()
  if (!active) return undefined
  return active.filter(m => isMedicineDueToday(m))
}

export function useAllMedicines() {
  return useLiveQuery(() => db.medicines.toArray())
}

export function useTodaysMedicineLogs() {
  const today = getLogicalDate()
  return useLiveQuery(
    () => db.medicineLogs.where('date').equals(today).toArray(),
    [today]
  )
}

export function useMedicineHistory(medicineId: number, limit: number = 14) {
  return useLiveQuery(() =>
    db.medicineLogs
      .where('medicine_id').equals(medicineId)
      .reverse()
      .limit(limit)
      .toArray()
  , [medicineId, limit])
}

export async function addMedicine(name: string, frequency: string) {
  await db.medicines.add({
    name,
    frequency,
    is_active: true,
    created_at: nowISO(),
  })
}

export async function updateMedicine(id: number, changes: Partial<{ name: string; frequency: string; is_active: boolean }>) {
  await db.medicines.update(id, changes)
}

export async function deleteMedicine(id: number) {
  await db.transaction('rw', [db.medicines, db.medicineLogs], async () => {
    await db.medicineLogs.where('medicine_id').equals(id).delete()
    await db.medicines.delete(id)
  })
}

export async function toggleMedicineLog(medicineId: number) {
  const today = getLogicalDate()
  const existing = await db.medicineLogs
    .where('medicine_id').equals(medicineId)
    .and(l => l.date === today)
    .first()

  if (existing) {
    await db.medicineLogs.delete(existing.id!)
  } else {
    await db.medicineLogs.add({
      medicine_id: medicineId,
      date: today,
      taken: true,
      logged_at: nowISO(),
    })
    await awardPoints('medicine_taken', medicineId)
  }
}
