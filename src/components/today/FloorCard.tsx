import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Check, Pencil } from 'lucide-react'
import { fadeUp, pop } from '../../lib/animations'
import { FLOOR_MAX, floorHabits, floorProgress, toggleFloorPick } from '../../lib/floor'
import { useActiveHabits, useTodaysCompletions, toggleHabitCompletion, isTodayScheduled, setFloorHabits } from '../../hooks/useHabits'
import { awardPoints } from '../../hooks/usePoints'
import { requestReschedule } from '../../lib/notifications/native'
import type { Habit } from '../../types'

// The daily floor on Today: the 2–3 habits that make a day count. Finishing
// them is a full day; everything else is a bonus.
export default function FloorCard() {
  const habits = useActiveHabits()
  const completions = useTodaysCompletions()
  const [editing, setEditing] = useState(false)

  const floor = floorHabits(habits ?? []).filter(isTodayScheduled)
  const completedIds = new Set((completions ?? []).map(c => c.habit_id))
  const { done, total, complete } = floorProgress(floor, completedIds)

  // A full day earns a small bonus, once per day (deduplicated in awardPoints).
  useEffect(() => {
    if (complete) void awardPoints('floor_complete')
    // A done floor doesn't need tonight's reminder (and an undone one does).
    requestReschedule()
  }, [complete])

  if (!habits || habits.length === 0) return null

  if (editing || floorHabits(habits).length === 0) {
    return <FloorPicker habits={habits} editing={editing} onDone={() => setEditing(false)} onStart={() => setEditing(true)} />
  }

  return (
    <m.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      aria-label="Your floor"
      className={`mb-4 rounded-2xl p-4 shadow-sm transition-colors duration-300 ${complete ? 'bg-secondary-50 dark:bg-secondary-900/30' : 'bg-card'}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Your floor</p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted">{done} of {total}</span>
          <button onClick={() => setEditing(true)} aria-label="Change your floor" className="p-1 text-muted">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {complete && (
          <m.p
            key="complete"
            variants={pop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mt-1 font-semibold text-secondary-700 dark:text-secondary-300"
          >
            That's a full day ✨ Everything else is a bonus.
          </m.p>
        )}
      </AnimatePresence>

      <div className="mt-2 space-y-1.5">
        {floor.map(habit => {
          const checked = completedIds.has(habit.id!)
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabitCompletion(habit.id!)}
              aria-pressed={checked}
              className="flex w-full items-center gap-3 rounded-xl px-1 py-1.5 text-left transition-transform duration-100 active:scale-[0.98]"
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                checked ? 'border-secondary-500 bg-secondary-500' : 'border-primary-200'
              }`}>
                <AnimatePresence>
                  {checked && (
                    <m.span key="check" variants={pop} initial="hidden" animate="visible" exit="exit">
                      <Check className="h-4 w-4 text-white" />
                    </m.span>
                  )}
                </AnimatePresence>
              </span>
              <span className={`font-medium transition-colors ${checked ? 'text-muted line-through decoration-1' : 'text-text-primary'}`}>
                {habit.title}
              </span>
            </button>
          )
        })}
        {floor.length === 0 && (
          <p className="py-1 text-sm text-muted">Nothing on your floor today. Enjoy the day.</p>
        )}
      </div>
    </m.section>
  )
}

function FloorPicker({ habits, editing, onDone, onStart }: {
  habits: Habit[]
  editing: boolean
  onDone: () => void
  onStart: () => void
}) {
  const [picked, setPicked] = useState<number[]>(() => floorHabits(habits).map(h => h.id!))

  async function save() {
    await setFloorHabits(picked)
    requestReschedule()
    onDone()
  }

  if (!editing) {
    return (
      <m.section variants={fadeUp} initial="hidden" animate="visible" aria-label="Your floor" className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Your floor</p>
        <p className="mt-1 font-semibold text-text-primary">Pick 2–3 tiny habits that make a day count.</p>
        <p className="text-sm text-muted">On a hard day, just these is a full day.</p>
        <button
          onClick={onStart}
          className="mt-3 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
        >
          Choose my floor
        </button>
      </m.section>
    )
  }

  return (
    <m.section variants={fadeUp} initial="hidden" animate="visible" aria-label="Choose your floor" className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-text-primary">Choose your floor</p>
        <span className="text-xs font-semibold text-muted">{picked.length} / {FLOOR_MAX}</span>
      </div>
      <p className="text-sm text-muted">Small and doable on your worst day.</p>
      <div className="mt-3 space-y-1.5">
        {habits.map(habit => {
          const on = picked.includes(habit.id!)
          const full = !on && picked.length >= FLOOR_MAX
          return (
            <button
              key={habit.id}
              onClick={() => setPicked(p => toggleFloorPick(p, habit.id!))}
              disabled={full}
              aria-pressed={on}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-100 active:scale-[0.98] disabled:opacity-40 ${
                on ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'border-primary-100'
              }`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${on ? 'border-primary-500 bg-primary-500' : 'border-primary-200'}`}>
                {on && <Check className="h-3.5 w-3.5 text-white" />}
              </span>
              <span className="font-medium text-text-primary">{habit.title}</span>
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={save} className="flex-1 rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95">
          Save
        </button>
        <button onClick={onDone} className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted">
          Cancel
        </button>
      </div>
    </m.section>
  )
}
