import * as XLSX from 'xlsx'
import { db } from '../db'

export async function exportToExcel() {
  const wb = XLSX.utils.book_new()

  const weights = await db.weightEntries.orderBy('date').toArray()
  if (weights.length) {
    const ws = XLSX.utils.json_to_sheet(weights.map(w => ({
      Date: w.date,
      'Weight (kg)': w.value_kg,
      'Logged At': w.logged_at,
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Weight')
  }

  const meals = await db.mealEntries.orderBy('date').toArray()
  if (meals.length) {
    const ws = XLSX.utils.json_to_sheet(meals.map(m => ({
      Date: m.date,
      Slot: m.meal_slot,
      Name: m.name ?? '',
      'Health Score': m.health_score,
      'Logged At': m.logged_at,
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Meals')
  }

  const measurements = await db.measurements.orderBy('date').toArray()
  if (measurements.length) {
    const ws = XLSX.utils.json_to_sheet(measurements.map(m => ({
      Date: m.date,
      Neck: m.neck_cm ?? '',
      Chest: m.chest_cm ?? '',
      Hips: m.hips_cm ?? '',
      Waist: m.waist_cm ?? '',
      Arms: m.arms_cm ?? '',
      Thighs: m.thighs_cm ?? '',
      Ankles: m.ankles_cm ?? '',
      Wrists: m.wrists_cm ?? '',
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Measurements')
  }

  const water = await db.waterEntries.orderBy('date').toArray()
  if (water.length) {
    const byDate = new Map<string, number>()
    for (const w of water) byDate.set(w.date, (byDate.get(w.date) ?? 0) + w.amount_ml)
    const ws = XLSX.utils.json_to_sheet(Array.from(byDate).map(([date, ml]) => ({
      Date: date,
      'Total (ml)': ml,
      'Total (L)': Math.round(ml / 100) / 10,
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Water')
  }

  const moods = await db.moodEntries.orderBy('date').toArray()
  if (moods.length) {
    const ws = XLSX.utils.json_to_sheet(moods.map(m => ({
      Date: m.date,
      Score: m.score,
      Tags: m.tags.join(', '),
      'Logged At': m.logged_at,
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Mood')
  }

  const sleep = await db.sleepEntries.orderBy('date').toArray()
  if (sleep.length) {
    const ws = XLSX.utils.json_to_sheet(sleep.map(s => ({
      Date: s.date,
      Hours: s.hours_slept,
      Quality: s.quality_rating,
      'Wake Feeling': s.wake_feeling ?? '',
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Sleep')
  }

  const exercises = await db.exerciseEntries.orderBy('date').toArray()
  if (exercises.length) {
    const ws = XLSX.utils.json_to_sheet(exercises.map(e => ({
      Date: e.date,
      Type: e.exercise_type,
      Sets: e.sets ?? '',
      Reps: e.reps ?? '',
      'Weight (kg)': e.weight_used_kg ?? '',
      'Duration (min)': e.duration_minutes ?? '',
      'Distance (km)': e.distance_km ?? '',
      Notes: e.notes ?? '',
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Exercise')
  }

  const habits = await db.habits.toArray()
  const completions = await db.habitCompletions.orderBy('date').toArray()
  if (habits.length) {
    const habitMap = new Map(habits.map(h => [h.id!, h.title]))
    const ws = XLSX.utils.json_to_sheet(completions.map(c => ({
      Date: c.date,
      Habit: habitMap.get(c.habit_id) ?? 'Unknown',
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Habits')
  }

  const points = await db.pointsTransactions.orderBy('date').toArray()
  if (points.length) {
    const ws = XLSX.utils.json_to_sheet(points.map(p => ({
      Date: p.date,
      Amount: p.amount,
      Source: p.source_type,
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Points')
  }

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `itgetsbetter-export-${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportPhotosAsZip() {
  const photos = await db.progressPhotos.orderBy('date').toArray()
  if (photos.length === 0) throw new Error('No progress photos to export')

  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()

  for (const photo of photos) {
    const ext = photo.photo.type?.includes('png') ? 'png' : 'jpg'
    const filename = `${photo.date}_${photo.pose_type}.${ext}`
    zip.file(filename, photo.photo)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `itgetsbetter-photos-${new Date().toISOString().slice(0, 10)}.zip`
  a.click()
  URL.revokeObjectURL(url)
}
