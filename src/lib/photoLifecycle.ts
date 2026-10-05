import { db } from '../db'
import { compressImage } from './compressImage'
import { subMonths } from 'date-fns'

export interface LifecycleReport {
  foodPhotosCompressed: number
  foodPhotosDeleted: number
  progressPhotoReminders: number
  progressPhotosCompressed: number
}

export async function runPhotoLifecycle(): Promise<LifecycleReport> {
  const now = new Date()
  const threeMonthsAgo = subMonths(now, 3).toISOString().slice(0, 10)
  const oneYearAgo = subMonths(now, 12).toISOString().slice(0, 10)
  const sixMonthsAgo = subMonths(now, 6).toISOString().slice(0, 10)

  const report: LifecycleReport = {
    foodPhotosCompressed: 0,
    foodPhotosDeleted: 0,
    progressPhotoReminders: 0,
    progressPhotosCompressed: 0,
  }

  const meals = await db.mealEntries.toArray()
  for (const meal of meals) {
    if (!meal.photo) continue

    if (meal.date < oneYearAgo) {
      await db.mealEntries.update(meal.id!, { photo: null })
      report.foodPhotosDeleted++
    } else if (meal.date < threeMonthsAgo && meal.photo.size > 60000) {
      try {
        const compressed = await compressImage(new File([meal.photo], 'photo.jpg', { type: meal.photo.type }), {
          maxSizeMB: 0.05,
          maxWidthOrHeight: 512,
          useWebWorker: true,
        })
        await db.mealEntries.update(meal.id!, { photo: compressed })
        report.foodPhotosCompressed++
      } catch {
        // skip if compression fails
      }
    }
  }

  const photos = await db.progressPhotos.toArray()
  for (const photo of photos) {
    if (photo.date < oneYearAgo && photo.photo.size > 120000) {
      try {
        const compressed = await compressImage(new File([photo.photo], 'photo.jpg', { type: photo.photo.type }), {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        })
        await db.progressPhotos.update(photo.id!, { photo: compressed })
        report.progressPhotosCompressed++
      } catch {
        // skip
      }
    }

    if (photo.date < sixMonthsAgo && photo.date >= oneYearAgo) {
      report.progressPhotoReminders++
    }
  }

  return report
}

const LIFECYCLE_KEY = 'igb_last_photo_lifecycle'

export function shouldRunLifecycle(): boolean {
  const last = localStorage.getItem(LIFECYCLE_KEY)
  if (!last) return true
  const daysSince = (Date.now() - parseInt(last)) / (1000 * 60 * 60 * 24)
  return daysSince >= 7
}

export function markLifecycleRun() {
  localStorage.setItem(LIFECYCLE_KEY, String(Date.now()))
}
