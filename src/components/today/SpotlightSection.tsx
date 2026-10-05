import { useNavigate } from 'react-router'
import { addDays, format, parseISO } from 'date-fns'
import { Scale, UtensilsCrossed, Droplets, Timer, AlertCircle, Dumbbell, CheckCircle2, ChevronRight, Pill, Check } from 'lucide-react'
import { FEATURES, isOn, isSpotlight, type FeatureId, type FeatureTiers } from '../../lib/features'
import { getLogicalDate } from '../../lib/date'
import { useLatestWeight } from '../../hooks/useWeightEntries'
import { useTodaysMeals } from '../../hooks/useMealEntries'
import { useActiveHabits, useTodaysCompletions } from '../../hooks/useHabits'
import { useTasks } from '../../hooks/useTasks'
import { useTodaysWaterTotal } from '../../hooks/useWater'
import { useCurrentFast, formatFastingDuration, breakFast } from '../../hooks/useFasting'
import { useTodaysExercise } from '../../hooks/useExercise'
import { useTodaysMedicines, useTodaysMedicineLogs, toggleMedicineLog } from '../../hooks/useMedicine'

// The Today screen's spotlight: a card for each starred feature (max 3).
// These are the v1 home cards, moved here as-is; step 3c turns them into
// one-tap cards.
const CARDS: Partial<Record<FeatureId, () => React.ReactNode>> = {
  weight: () => <WeightCard />,
  meals: () => <MealsCard />,
  water: () => <WaterCard />,
  fasting: () => <FastingCard />,
  exercise: () => <ExerciseCard />,
  habits: () => <HabitsCard />,
  medicine: () => <MedicineCard />,
  tasks: () => <TasksCard />,
}

export default function SpotlightSection({ tiers }: { tiers: FeatureTiers | undefined }) {
  const spotlit = FEATURES.filter(f => isSpotlight(tiers, f.id) && CARDS[f.id])
  const medicineQuietlyOn = isOn(tiers, 'medicine') && !isSpotlight(tiers, 'medicine')

  return (
    <>
      {spotlit.length > 0 && (
        <section aria-label="Your spotlight" className="mb-4 space-y-3">
          {spotlit.map(f => <div key={f.id}>{CARDS[f.id]!()}</div>)}
        </section>
      )}
      {/* Safety exception (Rulebook 2.4): medicine still gets a quiet line
          when doses are left, even when it isn't in the spotlight. */}
      {medicineQuietlyOn && <MedicineReminderLine />}
    </>
  )
}

const cardButton = 'w-full rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]'

function WeightCard() {
  const navigate = useNavigate()
  const latestWeight = useLatestWeight()
  return (
    <button onClick={() => navigate('/log/weight')} className={cardButton}>
      <div className="mb-2 flex items-center gap-2">
        <Scale className="h-4 w-4 text-secondary-500" />
        <span className="text-xs text-muted">Weight</span>
      </div>
      <p className="text-lg font-bold text-text-primary">{latestWeight ? `${latestWeight.value_kg} kg` : '—'}</p>
    </button>
  )
}

function MealsCard() {
  const navigate = useNavigate()
  const todaysMeals = useTodaysMeals()
  const avgScore = todaysMeals?.length
    ? (todaysMeals.reduce((sum, m) => sum + m.health_score, 0) / todaysMeals.length).toFixed(1)
    : null
  return (
    <button onClick={() => navigate('/log/meal')} className={cardButton}>
      <div className="mb-2 flex items-center gap-2">
        <UtensilsCrossed className="h-4 w-4 text-primary-500" />
        <span className="text-xs text-muted">Meals</span>
      </div>
      <p className="text-lg font-bold text-text-primary">{todaysMeals?.length ?? 0} logged</p>
      {avgScore && <p className="text-xs text-muted">avg {avgScore}/5</p>}
    </button>
  )
}

function WaterCard() {
  const navigate = useNavigate()
  const waterTotal = useTodaysWaterTotal()
  const waterGoalMl = 2000
  const total = waterTotal ?? 0
  const percent = Math.min(Math.round((total / waterGoalMl) * 100), 100)
  const display = total >= 1000 ? `${(total / 1000).toFixed(1)}L` : `${total}ml`
  return (
    <button onClick={() => navigate('/log/water')} className={cardButton}>
      <div className="mb-2 flex items-center gap-2">
        <Droplets className="h-4 w-4 text-secondary-500" />
        <span className="text-xs text-muted">Water</span>
      </div>
      <p className="mb-1 text-lg font-bold text-text-primary">
        {display}
        <span className="text-xs font-normal text-muted"> / {waterGoalMl / 1000}L</span>
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-secondary-400 transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </button>
  )
}

function FastingCard() {
  const navigate = useNavigate()
  const fast = useCurrentFast(16)
  return (
    <div className="rounded-2xl bg-card p-4 text-left shadow-sm">
      <button onClick={() => navigate('/log/fasting')} className="w-full text-left">
        <div className="mb-2 flex items-center gap-2">
          <Timer className="h-4 w-4 text-accent-500" />
          <span className="text-xs text-muted">Fasting</span>
        </div>
        <p className={`mb-1 text-lg font-bold ${fast.goalMet ? 'text-success' : fast.status === 'dismissed' ? 'text-muted' : 'text-text-primary'}`}>
          {fast.status === 'fasting' ? formatFastingDuration(fast.fastingMinutes) : fast.status === 'dismissed' ? 'Dismissed' : 'No data'}
        </p>
        {fast.status === 'fasting' && (
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div
              className={`h-full rounded-full transition-all duration-500 ${fast.goalMet ? 'bg-success' : 'bg-accent-400'}`}
              style={{ width: `${Math.min((fast.fastingMinutes / (fast.goalHours * 60)) * 100, 100)}%` }}
            />
          </div>
        )}
      </button>
      {fast.status === 'fasting' && fast.fastingMinutes > 0 && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              breakFast(fast.lastMealAt!, fast.fastingMinutes, fast.goalHours)
              navigate('/log/meal')
            }}
            className="flex-1 rounded-lg bg-success/15 py-1.5 text-xs font-semibold text-success"
          >
            Break Fast
          </button>
          <button onClick={() => fast.dismiss()} className="flex-1 rounded-lg bg-surface py-1.5 text-xs font-semibold text-muted">
            Delete Fast
          </button>
        </div>
      )}
    </div>
  )
}

function ExerciseCard() {
  const navigate = useNavigate()
  const todaysExercise = useTodaysExercise()
  const count = todaysExercise?.length ?? 0
  return (
    <button onClick={() => navigate('/log/exercise')} className={`flex items-center gap-4 ${cardButton}`}>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100">
        <Dumbbell className="h-5 w-5 text-primary-500" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted">Exercise</p>
        <p className="text-lg font-bold text-text-primary">{count} {count === 1 ? 'session' : 'sessions'} today</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted" />
    </button>
  )
}

function HabitsCard() {
  const navigate = useNavigate()
  const activeHabits = useActiveHabits()
  const completions = useTodaysCompletions()
  const completed = completions?.length ?? 0
  const total = activeHabits?.length ?? 0
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  const allDone = total > 0 && completed === total
  return (
    <button onClick={() => navigate('/todo')} className={`flex items-center gap-4 ${cardButton}`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${allDone ? 'bg-success/15' : 'bg-accent-100'}`}>
        <CheckCircle2 className={`h-5 w-5 ${allDone ? 'text-success' : 'text-accent-600'}`} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted">Habits</p>
        <p className="text-xl font-bold text-text-primary">
          {completed} / {total}
          <span className="ml-2 text-sm font-normal text-muted">{percent}%</span>
        </p>
      </div>
    </button>
  )
}

function MedicineCard() {
  const activeMeds = useTodaysMedicines()
  const logs = useTodaysMedicineLogs()
  const isTaken = (id: number) => logs?.some(l => l.medicine_id === id) ?? false
  const total = activeMeds?.length ?? 0
  const untaken = activeMeds?.filter(m => !isTaken(m.id!)) ?? []

  if (total === 0) {
    return (
      <div className="rounded-2xl bg-card p-4 text-sm text-muted shadow-sm">
        <Pill className="mr-2 inline h-4 w-4" />No medicine scheduled today.
      </div>
    )
  }
  if (untaken.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 px-4 py-3">
        <Check className="h-4 w-4 text-success" />
        <p className="text-sm font-medium text-success">All {total} medications taken</p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {untaken.map(med => (
        <div key={med.id} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm">
          <button
            onClick={() => toggleMedicineLog(med.id!)}
            aria-label={`Mark ${med.name} as taken`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-secondary-300 transition-colors hover:border-secondary-500"
          />
          <p className="min-w-0 flex-1 text-sm font-medium text-text-primary">{med.name}</p>
          <Pill className="h-4 w-4 text-muted" />
        </div>
      ))}
    </div>
  )
}

function MedicineReminderLine() {
  const navigate = useNavigate()
  const activeMeds = useTodaysMedicines()
  const logs = useTodaysMedicineLogs()
  const untaken = activeMeds?.filter(m => !logs?.some(l => l.medicine_id === m.id)).length ?? 0
  if (untaken === 0) return null
  return (
    <button
      onClick={() => navigate('/log/medicine')}
      className="mb-4 flex w-full items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-left text-sm text-text-primary shadow-sm"
    >
      <Pill className="h-4 w-4 text-secondary-500" />
      {untaken} {untaken === 1 ? 'medicine' : 'medicines'} not taken yet
      <ChevronRight className="ml-auto h-4 w-4 text-muted" />
    </button>
  )
}

function TasksCard() {
  const navigate = useNavigate()
  const pendingTasks = useTasks({ completed: false })
  const today = getLogicalDate()
  const tomorrow = format(addDays(parseISO(today), 1), 'yyyy-MM-dd')
  const tasks = (pendingTasks?.filter(t => (t.due_date && t.due_date <= tomorrow) || t.show_in_today) ?? [])
    .sort((a, b) => {
      const urgency = (t: typeof a) => (!t.due_date ? 2 : t.due_date <= today ? 0 : t.due_date <= tomorrow ? 1 : 3)
      return urgency(a) - urgency(b)
    })
    .slice(0, 3)

  if (tasks.length === 0) {
    return (
      <button onClick={() => navigate('/todo/tasks')} className={`text-sm text-muted ${cardButton}`}>
        No tasks for today. 🌿
      </button>
    )
  }
  return (
    <div className="space-y-2">
      {tasks.map(task => {
        const isOverdue = task.due_date ? task.due_date < today : false
        const isToday = task.due_date === today
        const dueLine = !task.due_date ? 'No due date'
          : isOverdue ? 'Earlier'
          : isToday ? 'Today'
          : task.due_date === tomorrow ? 'Tomorrow'
          : task.due_date
        return (
          <button
            key={task.id}
            onClick={() => navigate('/todo/tasks')}
            className="flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3 text-left shadow-sm transition-transform active:scale-[0.98]"
          >
            <AlertCircle className={`h-5 w-5 shrink-0 ${isToday ? 'text-warning' : 'text-muted'}`} />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-text-primary">{task.title}</p>
              <p className="text-xs text-muted">{dueLine}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
