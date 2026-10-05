import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { compressImage } from '../lib/compressImage'

export function useProgressPhotos() {
  return useLiveQuery(() =>
    db.progressPhotos.orderBy('date').reverse().toArray()
  )
}

export function useProgressPhotosByDate(date: string) {
  return useLiveQuery(
    () => db.progressPhotos.where('date').equals(date).toArray(),
    [date]
  )
}

export async function addProgressPhoto(file: File, poseType: string, date?: string) {
  const compressed = await compressImage(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  })

  await db.progressPhotos.add({
    date: date ?? getLogicalDate(),
    photo: compressed,
    pose_type: poseType,
    logged_at: nowISO(),
  })
}

export async function deleteProgressPhoto(id: number) {
  await db.progressPhotos.delete(id)
}
