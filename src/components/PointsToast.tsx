import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { slideFromRight } from '../lib/animations'
import { setPointsListener, type PointsEvent } from '../lib/pointsEvents'

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
  daily_check: 'daily check',
}

export default function PointsToast() {
  const [events, setEvents] = useState<PointsEvent[]>([])

  useEffect(() => {
    setPointsListener((event) => {
      setEvents(prev => [...prev, event])
      setTimeout(() => {
        setEvents(prev => prev.filter(e => e.id !== event.id))
      }, 2500)
    })
    return () => setPointsListener(null)
  }, [])

  return (
    <div className="pointer-events-none fixed top-16 right-4 z-50 space-y-2">
      <AnimatePresence>
        {events.map(event => (
          <m.div
            key={event.id}
            variants={slideFromRight}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2 text-white shadow-lg"
          >
            <Star className="h-4 w-4" />
            <span className="text-sm font-bold">+{event.amount}</span>
            <span className="text-xs opacity-80">{SOURCE_LABELS[event.source] ?? event.source}</span>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
