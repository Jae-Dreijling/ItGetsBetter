import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { db } from '../../db'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'

interface TimelineEntry {
  id: string
  time: string
  emoji: string
  label: string
  detail: string
}

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function timeLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

const MEAL_SLOT: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

const STARS = ['', '★', '★★', '★★★', '★★★★', '★★★★★']

const MEASURE_FIELDS = [
  'neck_cm', 'chest_cm', 'hips_cm', 'waist_cm',
  'arms_cm', 'thighs_cm', 'ankles_cm', 'wrists_cm',
] as const

export default function TimelinePage() {
  const navigate = useNavigate()
  const today = toDateStr(new Date())
  const [date, setDate] = useState(today)

  const isToday = date === today

  function shiftDay(delta: number) {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() + delta)
    setDate(toDateStr(d))
  }

  const entries = useLiveQuery(async () => {
    const [habits, medicines] = await Promise.all([
      db.habits.toArray(),
      db.medicines.toArray(),
    ])
    const habitMap = new Map(habits.map(h => [h.id!, h.title]))
    const medMap = new Map(medicines.map(m => [m.id!, m.name]))

    const [weights, meals, waters, exercises, moods, sleeps, medLogs, habitDone, measurements, tasks] =
      await Promise.all([
        db.weightEntries.where('date').equals(date).toArray(),
        db.mealEntries.where('date').equals(date).toArray(),
        db.waterEntries.where('date').equals(date).toArray(),
        db.exerciseEntries.where('date').equals(date).toArray(),
        db.moodEntries.where('date').equals(date).toArray(),
        db.sleepEntries.where('date').equals(date).toArray(),
        db.medicineLogs.where('date').equals(date).toArray(),
        db.habitCompletions.where('date').equals(date).toArray(),
        db.measurements.where('date').equals(date).toArray(),
        db.tasks.filter(t => t.is_completed && !!t.completed_at && t.completed_at.startsWith(date)).toArray(),
      ])

    const items: TimelineEntry[] = []

    for (const w of weights) {
      items.push({ id: `w-${w.id}`, time: w.logged_at, emoji: '⚖️', label: 'Weight', detail: `${w.value_kg} kg` })
    }

    for (const m of meals) {
      const slot = MEAL_SLOT[m.meal_slot] ?? m.meal_slot
      const name = m.name ? ` · ${m.name}` : ''
      const stars = STARS[m.health_score] ?? ''
      items.push({ id: `m-${m.id}`, time: m.logged_at, emoji: '🍽️', label: slot, detail: `${stars}${name}`.trim() })
    }

    for (const w of waters) {
      items.push({ id: `wa-${w.id}`, time: w.logged_at, emoji: '💧', label: 'Water', detail: `${w.amount_ml} ml` })
    }

    for (const e of exercises) {
      const parts = [e.exercise_type]
      if (e.duration_minutes) parts.push(`${e.duration_minutes} min`)
      if (e.distance_km) parts.push(`${e.distance_km} km`)
      if (e.sets && e.reps) parts.push(`${e.sets}×${e.reps}`)
      items.push({ id: `e-${e.id}`, time: e.logged_at, emoji: '💪', label: 'Exercise', detail: parts.join(' · ') })
    }

    for (const mo of moods) {
      const tags = mo.tags.length ? ` · ${mo.tags.join(', ')}` : ''
      items.push({ id: `mo-${mo.id}`, time: mo.logged_at, emoji: '😊', label: 'Mood', detail: `${mo.score}/5${tags}` })
    }

    for (const s of sleeps) {
      const quality = s.quality_rating ? ` · ${STARS[s.quality_rating]}` : ''
      const feeling = s.wake_feeling ? ` · ${s.wake_feeling}` : ''
      items.push({ id: `sl-${s.id}`, time: s.logged_at, emoji: '😴', label: 'Sleep', detail: `${s.hours_slept}h${quality}${feeling}` })
    }

    for (const ml of medLogs) {
      if (!ml.taken) continue
      const name = medMap.get(ml.medicine_id) ?? 'Medicine'
      items.push({ id: `med-${ml.id}`, time: ml.logged_at, emoji: '💊', label: 'Medicine', detail: name })
    }

    for (const hc of habitDone) {
      const title = habitMap.get(hc.habit_id) ?? 'Habit'
      const tag = hc.is_cant_fail ? " · can't fail" : ''
      items.push({ id: `hc-${hc.id}`, time: hc.logged_at, emoji: '🔥', label: 'Habit', detail: `${title}${tag}` })
    }

    for (const ms of measurements) {
      const filled = MEASURE_FIELDS.filter(f => ms[f] != null).length
      if (filled === 0) continue
      items.push({ id: `ms-${ms.id}`, time: ms.logged_at, emoji: '📏', label: 'Measurements', detail: `${filled} measurement${filled !== 1 ? 's' : ''} logged` })
    }

    for (const t of tasks) {
      if (!t.completed_at) continue
      items.push({ id: `t-${t.id}`, time: t.completed_at, emoji: '✅', label: 'Task', detail: t.title })
    }

    items.sort((a, b) => a.time.localeCompare(b.time))
    return items
  }, [date])

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-NL', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <>
      <TopBar title="My Day" onBack={() => navigate(-1)} />
      <PageContainer>
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => shiftDay(-1)}
            className="rounded-xl bg-card p-2 shadow-sm text-muted active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">{displayDate}</p>
            {isToday && <p className="text-xs text-primary-500 mt-0.5">Today</p>}
          </div>
          <button
            onClick={() => shiftDay(1)}
            disabled={isToday}
            className="rounded-xl bg-card p-2 shadow-sm text-muted active:scale-95 transition-transform disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {entries === undefined ? (
          <div className="py-8 text-center text-sm text-muted">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-4xl mb-3">🌿</p>
            <p className="text-sm font-medium text-text-primary">Nothing logged yet</p>
            <p className="text-xs text-muted mt-1">Your logs for this day will appear here.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-4 bottom-4 left-[69px] w-px bg-primary-100 dark:bg-primary-900" />
            <div className="space-y-2">
              {entries.map(entry => (
                <div key={entry.id} className="flex items-start gap-2">
                  <div className="w-14 shrink-0 pt-2 text-right">
                    <span className="text-[11px] font-mono tabular-nums text-muted">{timeLabel(entry.time)}</span>
                  </div>
                  <div className="relative z-10 mt-[0.65rem] h-2.5 w-2.5 shrink-0 rounded-full bg-primary-400 ring-2 ring-surface" />
                  <div className="flex-1 rounded-xl bg-card px-3 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{entry.emoji}</span>
                      <span className="text-sm font-semibold text-text-primary">{entry.label}</span>
                    </div>
                    {entry.detail && (
                      <p className="mt-0.5 text-xs text-muted leading-snug">{entry.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}
