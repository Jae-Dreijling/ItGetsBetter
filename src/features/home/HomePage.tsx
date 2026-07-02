import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { Scale, UtensilsCrossed, Droplets, Timer, AlertCircle, Dumbbell, CheckCircle2, ChevronRight, Pill, Check, Star } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import { SideMenuContext } from '../../components/layout/AppShell'
import PageContainer from '../../components/layout/PageContainer'
import MoodPrompt from '../../components/MoodPrompt'
import NotificationToast from '../../components/NotificationToast'
import StarterHabitPrompt from '../../components/StarterHabitPrompt'
import WeatherCard from '../../components/WeatherCard'
import { useLatestWeight } from '../../hooks/useWeightEntries'
import { useTodaysMeals } from '../../hooks/useMealEntries'
import { useActiveHabits, useTodaysCompletions } from '../../hooks/useHabits'
import { useTasks } from '../../hooks/useTasks'
import { useTodaysWaterTotal } from '../../hooks/useWater'
import { useCurrentFast, formatFastingDuration, breakFast } from '../../hooks/useFasting'
import { useTodaysExercise } from '../../hooks/useExercise'
import { useTodaysMood } from '../../hooks/useMood'
import { useTodaysMedicines, useTodaysMedicineLogs, toggleMedicineLog } from '../../hooks/useMedicine'
import { usePointsBalance } from '../../hooks/usePoints'
import { useIsReturningAfterAbsence } from '../../hooks/useWelcomeBack'
import { triggerCompanionMessage } from '../../components/FloatingCompanion'
import { wasStarterOffered } from '../../lib/starterHabits'
import { useTodaySchedule } from '../../hooks/useSchedule'
import { useNotifications } from '../../hooks/useNotifications'
import { getLogicalDate } from '../../lib/date'
import { addDays, format, parseISO } from 'date-fns'

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

type TimeOfDay = 'morning' | 'midday' | 'night'

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'midday'
  return 'night'
}

export default function HomePage() {
  const latestWeight = useLatestWeight()
  const todaysMeals = useTodaysMeals()
  const activeHabits = useActiveHabits()
  const todaysCompletions = useTodaysCompletions()
  const pendingTasks = useTasks({ completed: false })
  const waterTotal = useTodaysWaterTotal()
  const fast = useCurrentFast(16)
  const todaysExercise = useTodaysExercise()
  const todaysMood = useTodaysMood()
  const activeMeds = useTodaysMedicines()
  const todaysMedLogs = useTodaysMedicineLogs()
  const points = usePointsBalance()
  const isReturning = useIsReturningAfterAbsence()
  if (isReturning) triggerCompanionMessage('welcome_back')
  const { mode } = useTodaySchedule()
  const { notification, dismiss } = useNotifications()
  const navigate = useNavigate()

  const [moodDismissed, setMoodDismissed] = useState(false)
  const [starterDismissed, setStarterDismissed] = useState(wasStarterOffered)
  const showStarter = !starterDismissed && (activeHabits?.length ?? 0) === 0

  const today = getLogicalDate()
  const tomorrow = format(addDays(parseISO(today), 1), 'yyyy-MM-dd')
  const homepageTasks = (pendingTasks?.filter(t =>
    (t.due_date && t.due_date <= tomorrow) || t.show_in_today
  ) ?? [])
    .sort((a, b) => {
      const aUrgency = !a.due_date ? 2 : a.due_date <= today ? 0 : a.due_date <= tomorrow ? 1 : 3
      const bUrgency = !b.due_date ? 2 : b.due_date <= today ? 0 : b.due_date <= tomorrow ? 1 : 3
      return aUrgency - bUrgency
    })
    .slice(0, 5)

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

  const timeOfDay = getTimeOfDay()
  const moodLoggedForPeriod = todaysMood?.some(m => m.tags.includes(timeOfDay)) ?? false
  const showMoodPrompt = !moodDismissed && !moodLoggedForPeriod

  const { profile: scheduleProfile } = useTodaySchedule()
  const isPhoneFreeTime = (() => {
    if (!scheduleProfile) return false
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const wakeMinutes = parseTimeToMinutes(scheduleProfile.wake_time)
    const freeUntilMinutes = parseTimeToMinutes(scheduleProfile.phone_free_until)
    const awayMinutes = parseTimeToMinutes(scheduleProfile.phone_away_at)
    return (currentMinutes >= wakeMinutes && currentMinutes < freeUntilMinutes) || currentMinutes >= awayMinutes
  })()

  const isMedTaken = useCallback((medId: number) => {
    return todaysMedLogs?.some(l => l.medicine_id === medId) ?? false
  }, [todaysMedLogs])

  const medsTotal = activeMeds?.length ?? 0
  const medsTaken = activeMeds?.filter(m => isMedTaken(m.id!)).length ?? 0

  return (
    <>
      <TopBar title="Home" onMenuClick={() => SideMenuContext.open()} />
      <PageContainer>
        {isPhoneFreeTime && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-secondary-100 py-3 px-4">
            <span className="text-lg">📵</span>
            <p className="text-sm font-medium text-secondary-700">
              This is your phone-free time. Take a break!
            </p>
          </div>
        )}

        {mode !== 'none' && (
          <button
            onClick={() => navigate('/settings/schedule')}
            className={`mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium ${
              mode === 'exam' ? 'bg-accent-100 text-accent-700' :
              mode === 'social' ? 'bg-primary-100 text-primary-700' :
              'bg-secondary-100 text-secondary-700'
            }`}
          >
            {mode === 'exam' ? '📚' : mode === 'social' ? '🎉' : '🤫'}
            {mode.charAt(0).toUpperCase() + mode.slice(1)} mode active
          </button>
        )}

        {notification && (
          <NotificationToast message={notification.message} onDismiss={dismiss} />
        )}

        {showStarter && (
          <StarterHabitPrompt onDismiss={() => setStarterDismissed(true)} />
        )}

        {showMoodPrompt && (
          <MoodPrompt timeOfDay={timeOfDay} onDismiss={() => setMoodDismissed(true)} />
        )}

        <WeatherCard />

        {points !== undefined && (
          <button
            onClick={() => navigate('/me/rewards')}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-100 py-2.5 transition-transform active:scale-[0.98]"
          >
            <Star className="h-4 w-4 text-accent-600" />
            <span className="text-sm font-bold text-accent-700">{points} points</span>
          </button>
        )}

        <div className="mb-4 space-y-3">
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

            <div className="rounded-2xl bg-card p-4 shadow-sm text-left">
              <button onClick={() => navigate('/log/fasting')} className="w-full text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4 text-accent-500" />
                  <span className="text-xs text-muted">Fasting</span>
                </div>
                <p className={`text-lg font-bold mb-1 ${fast.goalMet ? 'text-success' : fast.status === 'dismissed' ? 'text-muted' : 'text-text-primary'}`}>
                  {fast.status === 'fasting'
                    ? formatFastingDuration(fast.fastingMinutes)
                    : fast.status === 'dismissed'
                    ? 'Dismissed'
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
              {fast.status === 'fasting' && fast.fastingMinutes > 0 && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      breakFast(fast.lastMealAt!, fast.fastingMinutes, fast.goalHours)
                      navigate('/log/meal')
                    }}
                    className="flex-1 rounded-lg bg-success/15 py-1.5 text-xs font-semibold text-success"
                  >
                    Break Fast
                  </button>
                  <button
                    onClick={() => fast.dismiss()}
                    className="flex-1 rounded-lg bg-surface py-1.5 text-xs font-semibold text-muted"
                  >
                    Delete Fast
                  </button>
                </div>
              )}
            </div>
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

        {medsTotal > 0 && (
          <div className="mb-4 space-y-3">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Medicine</h2>
            {medsTaken < medsTotal ? (
              <div className="space-y-2">
                {activeMeds!.filter(med => !isMedTaken(med.id!)).map(med => (
                  <div
                    key={med.id}
                    className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm"
                  >
                    <button
                      onClick={() => toggleMedicineLog(med.id!)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-secondary-300 hover:border-secondary-500 transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{med.name}</p>
                    </div>
                    <Pill className="h-4 w-4 text-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 px-4 py-3">
                <Check className="h-4 w-4 text-success" />
                <p className="text-sm font-medium text-success">All {medsTotal} medications taken</p>
              </div>
            )}
          </div>
        )}

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
                      <p className="font-medium text-text-primary">{task.title}</p>
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
