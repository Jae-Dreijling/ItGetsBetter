import { useNavigate } from 'react-router'
import { AnimatePresence, m } from 'motion/react'
import { addDays, format, parseISO } from 'date-fns'
import { Check, ChevronRight, Pill } from 'lucide-react'
import { fade } from '../../lib/animations'
import { FEATURES, getFeature, isOn, isSpotlight, type FeatureId, type FeatureTiers } from '../../lib/features'
import { getLogicalDate } from '../../lib/date'
import { floorHabits } from '../../lib/floor'
import { MOOD_LABELS } from '../../lib/mood'
import { QuickMood, QuickSleep, QuickWater, QuickWeight, primaryButton } from '../quickLog'
import { useWeightTrend } from '../../hooks/useWeightEntries'
import { useTodaysMeals } from '../../hooks/useMealEntries'
import { useActiveHabits, useTodaysCompletions, toggleHabitCompletion, isTodayScheduled } from '../../hooks/useHabits'
import { useTasks, toggleTask } from '../../hooks/useTasks'
import { useTodaysWaterTotal } from '../../hooks/useWater'
import { useTodaysExercise } from '../../hooks/useExercise'
import { useTodaysMood } from '../../hooks/useMood'
import { useTodaysSleep } from '../../hooks/useSleep'
import { useTodaysMedicines, useTodaysMedicineLogs, toggleMedicineLog, needsReminderToday } from '../../hooks/useMedicine'
import { useGameState, useActiveQuests, useQuestProgress } from '../../hooks/useGame'
import { usePeople, useContacts } from '../../hooks/useSocial'
import { dueSoon, dueLine, upcomingBirthdays, birthdayLine } from '../../lib/social'
import { ContactButtons, THANKS } from '../../features/social/parts'
import { useTracks, useMilestones } from '../../hooks/useGoals'
import { nextMilestone } from '../../lib/goals'
import { MilestoneCheck } from '../../features/goals/parts'
import { useWins } from '../../hooks/useWins'
import { winOfTheDay, SOURCE_EMOJI } from '../../lib/winsJar'
import { useThanks } from '../../features/social/useThanks'
import type { GameQuest } from '../../types'

// The Today screen's spotlight: a one-tap card for each starred feature
// (max 3, Rulebook 2.4). Each card lets you act right here; the header
// opens the feature's own page.
const CARDS: Partial<Record<FeatureId, { path: string; Body: () => React.ReactNode }>> = {
  weight: { path: '/log/weight', Body: WeightBody },
  meals: { path: '/log/meal', Body: MealsBody },
  water: { path: '/log/water', Body: WaterBody },
  exercise: { path: '/log/exercise', Body: ExerciseBody },
  mood: { path: '/log/mood', Body: MoodBody },
  sleep: { path: '/log/sleep', Body: SleepBody },
  medicine: { path: '/log/medicine', Body: MedicineBody },
  habits: { path: '/todo', Body: HabitsBody },
  tasks: { path: '/todo/tasks', Body: TasksBody },
  journey: { path: '/journey', Body: JourneyBody },
  social: { path: '/me/social', Body: SocialBody },
  goals: { path: '/me/goals', Body: GoalsBody },
  cravings: { path: '/log/craving', Body: CravingBody },
  wins_jar: { path: '/me/wins', Body: WinsBody },
}

export default function SpotlightSection({ tiers }: { tiers: FeatureTiers | undefined }) {
  const spotlit = FEATURES.filter(f => isSpotlight(tiers, f.id) && CARDS[f.id])
  const medicineQuietlyOn = isOn(tiers, 'medicine') && !isSpotlight(tiers, 'medicine')

  return (
    <>
      {spotlit.length > 0 && (
        <section aria-label="Your spotlight" className="mb-4 space-y-3">
          {spotlit.map(f => <SpotlightCard key={f.id} id={f.id} />)}
        </section>
      )}
      {/* Safety exception (Rulebook 2.4): medicine still gets a quiet line
          when doses are left, even when it isn't in the spotlight. */}
      {medicineQuietlyOn && <MedicineReminderLine />}
    </>
  )
}

function SpotlightCard({ id }: { id: FeatureId }) {
  const navigate = useNavigate()
  const feature = getFeature(id)
  const { path, Body } = CARDS[id]!
  return (
    <article aria-label={feature.name} className="rounded-2xl bg-card p-4 shadow-sm">
      <button onClick={() => navigate(path)} className="mb-2.5 flex w-full items-center gap-2 text-left">
        <span aria-hidden>{feature.emoji}</span>
        <span className="text-sm font-semibold text-text-primary">{feature.name}</span>
        <ChevronRight className="ml-auto h-4 w-4 text-muted" />
      </button>
      <Body />
    </article>
  )
}

const status = 'text-sm text-muted'
const doneLine = 'flex items-center gap-1.5 text-sm font-medium text-secondary-600 dark:text-secondary-300'

// The trend is the main number; the day's weigh-in only when it's shown.
function WeightBody() {
  const { latest, trend, display } = useWeightTrend()
  const trendText = trend !== null ? `trend ${trend.toFixed(1)} kg` : null
  if (latest?.date === getLogicalDate()) {
    return (
      <p className={doneLine}>
        <Check className="h-4 w-4" />
        {display === 'every' ? `${latest.weight} kg today · ${trendText}` : `Weighed in today · ${trendText}`}
      </p>
    )
  }
  return (
    <div className="space-y-2">
      {trendText && <p className={status}>{display === 'every' && latest ? `Last: ${latest.weight} kg · ${trendText}` : `Your ${trendText}`}</p>}
      <QuickWeight />
    </div>
  )
}

function MealsBody() {
  const navigate = useNavigate()
  const meals = useTodaysMeals()
  const count = meals?.length ?? 0
  return (
    <div className="flex items-center justify-between gap-3">
      <p className={status}>{count === 0 ? 'Nothing logged yet today' : `${count} ${count === 1 ? 'meal' : 'meals'} today`}</p>
      <button onClick={() => navigate('/log/meal')} className={primaryButton}>Log a meal</button>
    </div>
  )
}

function WaterBody() {
  const total = useTodaysWaterTotal() ?? 0
  const goal = 2000
  const percent = Math.min(Math.round((total / goal) * 100), 100)
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
          <m.div className="h-full origin-left rounded-full bg-secondary-400" initial={false} animate={{ scaleX: percent / 100 }} />
        </div>
        <span className="text-sm font-semibold text-text-primary">{formatMl(total)} / {formatMl(goal)}</span>
      </div>
      <QuickWater />
    </div>
  )
}

function formatMl(ml: number) {
  return ml < 1000 ? `${ml} ml` : `${(ml / 1000).toFixed(1).replace(/\.0$/, '')} L`
}

function ExerciseBody() {
  const navigate = useNavigate()
  const sessions = useTodaysExercise()?.length ?? 0
  return (
    <div className="flex items-center justify-between gap-3">
      <p className={status}>{sessions === 0 ? 'Nothing yet today' : `${sessions} ${sessions === 1 ? 'session' : 'sessions'} today`}</p>
      <button onClick={() => navigate('/log/exercise')} className={primaryButton}>Log exercise</button>
    </div>
  )
}

function MoodBody() {
  const moods = useTodaysMood()
  const last = moods?.[moods.length - 1]
  return (
    <div className="space-y-2">
      {last && <p className={status}>Earlier today: {MOOD_LABELS[last.score]}</p>}
      <QuickMood />
    </div>
  )
}

function SleepBody() {
  const sleep = useTodaysSleep()
  if (sleep) {
    return <p className={doneLine}><Check className="h-4 w-4" />{sleep.hours_slept}h, feeling {sleep.quality_rating}/5</p>
  }
  return <QuickSleep />
}

function MedicineBody() {
  const meds = useTodaysMedicines()
  const logs = useTodaysMedicineLogs()
  const untaken = meds?.filter(m => !logs?.some(l => l.medicine_id === m.id)) ?? []

  if (!meds || meds.length === 0) return <p className={status}>No medicine scheduled today.</p>
  if (untaken.length === 0) return <p className={doneLine}><Check className="h-4 w-4" />All {meds.length} taken today</p>
  return (
    <ul className="space-y-1.5">
      <AnimatePresence initial={false}>
        {untaken.map(med => (
          <m.li key={med.id} variants={fade} initial="hidden" animate="visible" exit="exit">
            <button onClick={() => toggleMedicineLog(med.id!)} className="flex w-full items-center gap-3 py-1 text-left transition-transform active:scale-[0.98]">
              <span className="h-6 w-6 shrink-0 rounded-full border-2 border-secondary-300" />
              <span className="flex-1 font-medium text-text-primary">{med.name}</span>
              <Pill className="h-4 w-4 text-muted" />
            </button>
          </m.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

// Habits that aren't on the floor (the floor has its own card).
function HabitsBody() {
  const habits = useActiveHabits()
  const completions = useTodaysCompletions()
  const doneIds = new Set((completions ?? []).map(c => c.habit_id))
  const floorIds = new Set(floorHabits(habits ?? []).map(h => h.id))
  const todays = (habits ?? []).filter(h => isTodayScheduled(h) && !floorIds.has(h.id))
  const open = todays.filter(h => !doneIds.has(h.id!))

  if (todays.length === 0) return <p className={status}>No other habits today.</p>
  if (open.length === 0) return <p className={doneLine}><Check className="h-4 w-4" />All {todays.length} done today</p>
  return (
    <div>
      <p className="mb-1 text-xs text-muted">{todays.length - open.length} of {todays.length} done</p>
      <CheckList items={open.slice(0, 3).map(h => ({ id: h.id!, label: h.title }))} onCheck={id => toggleHabitCompletion(id)} />
    </div>
  )
}

function TasksBody() {
  const pending = useTasks({ completed: false })
  const today = getLogicalDate()
  const tomorrow = format(addDays(parseISO(today), 1), 'yyyy-MM-dd')
  const urgency = (t: { due_date: string | null }) => (!t.due_date ? 2 : t.due_date <= today ? 0 : t.due_date <= tomorrow ? 1 : 3)
  const tasks = (pending?.filter(t => (t.due_date && t.due_date <= tomorrow) || t.show_in_today) ?? [])
    .sort((a, b) => urgency(a) - urgency(b))
    .slice(0, 3)

  if (tasks.length === 0) return <p className={status}>Nothing for today. 🌿</p>
  return <CheckList items={tasks.map(t => ({ id: t.id!, label: t.title }))} onCheck={id => toggleTask(id)} />
}

// One win from the jar, the same all day.
function WinsBody() {
  const wins = useWins()
  const win = winOfTheDay(wins ?? [], getLogicalDate())
  if (!win) return <p className={status}>Your jar fills up as you go. 🫙</p>
  return (
    <p className="text-sm text-text-primary">
      {SOURCE_EMOJI[win.source]} {win.text}
      <span className="block text-xs text-muted">{format(parseISO(win.date), 'd MMM')}</span>
    </p>
  )
}

// Always one tap from help, never a count of how often.
function CravingBody() {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate('/log/craving')} className={primaryButton}>
      Having a craving? Let's ride it out
    </button>
  )
}

// The next step of each goal (up to three), tickable right here.
function GoalsBody() {
  const tracks = useTracks()
  const milestones = useMilestones()
  const steps = (tracks ?? [])
    .map(t => ({ track: t, next: nextMilestone(milestones.filter(m => m.track_id === t.id)) }))
    .filter(s => s.next)
    .slice(0, 3)

  if (steps.length === 0) return <p className={status}>No next step right now. Add a goal whenever you like. 🎯</p>
  return (
    <ul className="space-y-1.5">
      {steps.map(({ track, next }) => (
        <li key={track.id} className="flex items-center gap-3">
          <MilestoneCheck milestone={next!} />
          <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
            <span aria-hidden>{track.emoji}</span> {next!.text}
          </span>
        </li>
      ))}
    </ul>
  )
}

// The person it's been longest since, with one-tap logging; birthdays today
// or tomorrow come first.
function SocialBody() {
  const people = usePeople()
  const contacts = useContacts()
  const today = getLogicalDate()
  const birthday = upcomingBirthdays(people ?? [], today, 1)[0]
  const due = dueSoon(people ?? [], contacts, today).find(d => d.daysUntil <= 0)
  const [thanks, showThanks] = useThanks()

  if (thanks && !due) return <p className="text-sm font-medium text-success">{THANKS}</p>
  if (!birthday && !due) return <p className={status}>Everyone's caught up for now. 🌿</p>
  return (
    <div className="space-y-2">
      {birthday && <p className="text-sm text-text-primary">{birthdayLine(birthday)}</p>}
      {due && (
        <>
          <p className="text-sm text-text-primary">{dueLine(due)}</p>
          <ContactButtons person={due.person} compact onLogged={showThanks} />
        </>
      )}
    </div>
  )
}

// Tap the circle (or the row) to complete; the row then fades away.
function CheckList({ items, onCheck }: { items: { id: number; label: string }[]; onCheck: (id: number) => void }) {
  return (
    <ul className="space-y-0.5">
      <AnimatePresence initial={false}>
        {items.map(item => (
          <m.li key={item.id} variants={fade} initial="hidden" animate="visible" exit="exit">
            <button onClick={() => onCheck(item.id)} className="flex w-full items-center gap-3 py-1.5 text-left transition-transform active:scale-[0.98]">
              <span className="h-6 w-6 shrink-0 rounded-full border-2 border-primary-200" />
              <span className="font-medium text-text-primary">{item.label}</span>
            </button>
          </m.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

function JourneyBody() {
  const navigate = useNavigate()
  const game = useGameState()
  const quests = useActiveQuests()

  // Still loading: render nothing rather than flash the wrong message.
  if (quests === undefined) return null
  // No game record yet means the journey was never started.
  if (!game?.activated) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className={status}>Your adventure hasn't started yet.</p>
        <button onClick={() => navigate('/journey/start')} className={primaryButton}>Begin</button>
      </div>
    )
  }
  if (!quests || quests.length === 0) return <p className={status}>No active quests right now.</p>
  return (
    <div className="space-y-2.5">
      {quests.slice(0, 2).map(q => <QuestLine key={q.id} quest={q} />)}
    </div>
  )
}

function QuestLine({ quest }: { quest: GameQuest }) {
  const progress = useQuestProgress(quest) ?? 0
  const percent = Math.min(100, Math.round((progress / quest.objective_target) * 100))
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 text-sm">
        <span className="font-medium text-text-primary">{quest.title}</span>
        <span className="shrink-0 text-muted">{Math.min(progress, quest.objective_target)} / {quest.objective_target}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface">
        <m.div className="h-full origin-left rounded-full bg-accent-400" initial={false} animate={{ scaleX: percent / 100 }} />
      </div>
    </div>
  )
}

function MedicineReminderLine() {
  const navigate = useNavigate()
  const meds = useTodaysMedicines()
  const logs = useTodaysMedicineLogs()
  // "As needed" medicines are never "not taken yet".
  const untaken = meds?.filter(m => needsReminderToday(m) && !logs?.some(l => l.medicine_id === m.id)).length ?? 0
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
