import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { triggerCompanionMessage } from '../lib/companionMessenger'
import { compressImage } from '../lib/compressImage'

export function useProgressPhotos() {
  return useLiveQuery(() =>
    db.progressPhotos.orderBy('date').reverse().toArray()
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
  triggerCompanionMessage('photo_taken')
}

export async function deleteProgressPhoto(id: number) {
  await db.progressPhotos.delete(id)
}
