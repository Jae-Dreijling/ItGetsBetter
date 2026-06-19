import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Scale, UtensilsCrossed, Droplets, Timer, AlertCircle, Dumbbell, CheckCircle2, ChevronRight } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile } from '../../hooks/useProfile'
import { useLatestWeight } from '../../hooks/useWeightEntries'
import { useTodaysMeals } from '../../hooks/useMealEntries'
import { useActiveHabits, useTodaysCompletions } from '../../hooks/useHabits'
import { useTasks } from '../../hooks/useTasks'
import { useTodaysWaterTotal } from '../../hooks/useWater'
import { useCurrentFast, formatFastingDuration } from '../../hooks/useFasting'
import { useTodaysExercise } from '../../hooks/useExercise'
import { useIsReturningAfterAbsence, getWelcomeBackMessage } from '../../hooks/useWelcomeBack'
import { getRandomMessage } from '../../lib/supportiveMessages'
import { getLogicalDate } from '../../lib/date'
import { addDays, format, parseISO } from 'date-fns'

export default function HomePage() {
  const { profile } = useProfile()
  const latestWeight = useLatestWeight()
  const todaysMeals = useTodaysMeals()
  const activeHabits = useActiveHabits()
  const todaysCompletions = useTodaysCompletions()
  const pendingTasks = useTasks({ completed: false })
  const waterTotal = useTodaysWaterTotal()
  const fast = useCurrentFast(16)
  const todaysExercise = useTodaysExercise()
  const isReturning = useIsReturningAfterAbsence()
  const navigate = useNavigate()

  const today = getLogicalDate()
  const tomorrow = format(addDays(parseISO(today), 1), 'yyyy-MM-dd')
  const homepageTasks = pendingTasks?.filter(t =>
    (t.due_date && t.due_date <= tomorrow) || t.show_in_today
  ) ?? []

  const displayName = profile?.display_name ?? 'friend'

  const message = useMemo(() => {
    if (isReturning) return getWelcomeBackMessage(displayName)
    return getRandomMessage(displayName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayName, isReturning])

  const avgScore = todaysMeals?.length
    ? (todaysMeals.reduce((sum, m) => sum + m.health_score, 0) / todaysMeals.length).toFixed(1)
    : null

  const waterGoalMl = 2000
  const waterPercent = waterTotal !== null && waterTotal !== undefined
    ? Math.min(Math.round((waterTotal / waterGoalMl) * 100), 100)
    : 0
  const waterDisplay = waterTotal !== null && waterTotal !== undefined
    ? (waterTotal >= 1000 ? `${(waterTotal / 1000).toFixed(1)}L` : `${waterTotal}ml`)
    : '0ml'

  const habitsCompleted = todaysCompletions?.length ?? 0
  const habitsTotal = activeHabits?.length ?? 0
  const habitsPercent = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0

  return (
    <>
      <TopBar title="Home" />
      <PageContainer>
        <div className={`mb-5 rounded-2xl p-5 shadow-sm ${isReturning ? 'bg-primary-100' : 'bg-card'}`}>
          <p className="text-center text-lg font-medium text-text-primary leading-relaxed">
            {message}
          </p>
        </div>

        <div className="mb-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/log/weight')}
              className="rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-secondary-500" />
                <span className="text-xs text-muted">Weight</span>
              </div>
              <p className="text-lg font-bold text-text-primary">
                {latestWeight ? `${latestWeight.value_kg} kg` : '—'}
              </p>
            </button>

            <button
              onClick={() => navigate('/log/meal')}
              className="rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed className="h-4 w-4 text-primary-500" />
                <span className="text-xs text-muted">Meals</span>
              </div>
              <p className="text-lg font-bold text-text-primary">
                {todaysMeals?.length ?? 0} logged
              </p>
              {avgScore && (
                <p className="text-xs text-muted">avg {avgScore}/5</p>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/log/water')}
              className="rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-secondary-500" />
                <span className="text-xs text-muted">Water</span>
              </div>
              <p className="text-lg font-bold text-text-primary mb-1">
                {waterDisplay}
                <span className="text-xs font-normal text-muted"> / {waterGoalMl / 1000}L</span>
              </p>
              <div className="h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-secondary-400 transition-all duration-500"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </button>

            <button
              onClick={() => navigate('/log/fasting')}
              className="rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Timer className="h-4 w-4 text-accent-500" />
                <span className="text-xs text-muted">Fasting</span>
              </div>
              <p className={`text-lg font-bold mb-1 ${fast.goalMet ? 'text-success' : 'text-text-primary'}`}>
                {fast.status === 'fasting'
                  ? formatFastingDuration(fast.fastingMinutes)
                  : 'No data'}
              </p>
              {fast.status === 'fasting' && (
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${fast.goalMet ? 'bg-success' : 'bg-accent-400'}`}
                    style={{ width: `${Math.min((fast.fastingMinutes / (fast.goalHours * 60)) * 100, 100)}%` }}
                  />
                </div>
              )}
            </button>
          </div>

          {habitsTotal > 0 && (
            <button
              onClick={() => navigate('/todo')}
              className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${habitsCompleted === habitsTotal ? 'bg-success/15' : 'bg-accent-100'}`}>
                <CheckCircle2 className={`h-5 w-5 ${habitsCompleted === habitsTotal ? 'text-success' : 'text-accent-600'}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Habits</p>
                <p className="text-xl font-bold text-text-primary">
                  {habitsCompleted} / {habitsTotal}
                  <span className="ml-2 text-sm font-normal text-muted">{habitsPercent}%</span>
                </p>
              </div>
              <div className="w-16 h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${habitsCompleted === habitsTotal ? 'bg-success' : 'bg-accent-400'}`}
                  style={{ width: `${habitsPercent}%` }}
                />
              </div>
            </button>
          )}

          {todaysExercise && todaysExercise.length > 0 && (
            <button
              onClick={() => navigate('/log/exercise')}
              className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100">
                <Dumbbell className="h-5 w-5 text-primary-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Exercise</p>
                <p className="text-lg font-bold text-text-primary">
                  {todaysExercise.length} {todaysExercise.length === 1 ? 'session' : 'sessions'}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </button>
          )}
        </div>

        {homepageTasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Tasks</h2>
            <div className="space-y-2">
              {homepageTasks.map(task => {
                const isOverdue = task.due_date ? task.due_date < today : false
                const isToday = task.due_date === today
                const isTomorrow = task.due_date === tomorrow
                const dueLine = !task.due_date
                  ? 'No due date'
                  : isOverdue ? 'Overdue'
                  : isToday ? 'Due today'
                  : isTomorrow ? 'Due tomorrow'
                  : `Due ${task.due_date}`
                return (
                  <button
                    key={task.id}
                    onClick={() => navigate('/todo/tasks')}
                    className="flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm text-left transition-transform active:scale-[0.98]"
                  >
                    <AlertCircle className={`h-5 w-5 shrink-0 ${isOverdue ? 'text-danger' : isToday ? 'text-warning' : 'text-muted'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{task.title}</p>
                      <p className={`text-xs ${isOverdue ? 'text-danger font-medium' : 'text-muted'}`}>
                        {dueLine}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}
