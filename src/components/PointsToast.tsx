import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

interface PointsEvent {
  amount: number
  source: string
  id: number
}

let listener: ((event: PointsEvent) => void) | null = null

export function emitPointsEarned(amount: number, source: string) {
  if (listener) {
    listener({ amount, source, id: Date.now() })
  }
}

const SOURCE_LABELS: Record<string, string> = {
  meal_logged: 'logging a meal',
  weight_logged: 'logging weight',
  habit_completed: 'completing a habit',
  habit_cant_fail: "can't fail — still counts!",
  task_completed: 'completing a task',
  water_goal_met: 'hitting water goal',
  exercise_logged: 'logging exercise',
  fasting_goal_met: 'fasting goal met',
  sleep_logged: 'logging sleep',
  mood_logged: 'logging mood',
  medicine_taken: 'taking medicine',
  streak_bonus_per_day: 'streak bonus',
}

export default function PointsToast() {
  const [events, setEvents] = useState<PointsEvent[]>([])

  useEffect(() => {
    listener = (event) => {
      setEvents(prev => [...prev, event])
      setTimeout(() => {
        setEvents(prev => prev.filter(e => e.id !== event.id))
      }, 2500)
    }
    return () => { listener = null }
  }, [])

  if (events.length === 0) return null

  return (
    <div className="fixed top-16 right-4 z-50 space-y-2">
      {events.map(event => (
        <div
          key={event.id}
          className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2 text-white shadow-lg animate-in fade-in slide-in-from-right"
        >
          <Star className="h-4 w-4" />
          <span className="text-sm font-bold">+{event.amount}</span>
          <span className="text-xs opacity-80">{SOURCE_LABELS[event.source] ?? event.source}</span>
        </div>
      ))}
    </div>
  )
}
