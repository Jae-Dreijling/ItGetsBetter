import { useState } from 'react'
import { useNavigate } from 'react-router'
import { format } from 'date-fns'
import { Timer } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import DeleteEntryButton from '../../components/DeleteEntryButton'
import { useNow } from '../../hooks/useAbstinence'
import {
  useRunningFast, useFastingHistory, useLastGoal, startFast, endFast, updateRunningFast, deleteFast,
  fastingMinutes, formatFastingDuration, GOAL_OPTIONS,
} from '../../hooks/useFasting'
import type { FastingRecord } from '../../types'

const primaryButton = 'w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600'
const chip = (on: boolean) => `rounded-full px-3 py-1.5 text-sm transition-colors ${on ? 'bg-primary-500 text-white' : 'bg-surface text-text-primary'}`
const toLocalInput = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm")

export default function FastingPage() {
  const navigate = useNavigate()
  const running = useRunningFast()
  const history = useFastingHistory()
  const [ended, setEnded] = useState<{ durationHours: number; goalMet: boolean } | null>(null)

  return (
    <>
      <TopBar title="Fasting" onBack={() => navigate('/log')} />
      <PageContainer>
        {ended ? (
          <div className="mb-6 rounded-xl bg-card p-5 text-center shadow-sm">
            <p className="text-4xl" aria-hidden>{ended.goalMet ? '🎉' : '🌱'}</p>
            <p className="mt-2 text-text-primary">
              {ended.goalMet ? `${ended.durationHours}h. You reached your goal.` : `${ended.durationHours}h fasted. Every fast counts as it is.`}
            </p>
            <button onClick={() => setEnded(null)} className={`mt-4 ${primaryButton}`}>OK</button>
          </div>
        ) : running === undefined ? null : running ? (
          <RunningFast fast={running} onEnded={setEnded} />
        ) : (
          <StartFast />
        )}

        {!!history?.length && (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-muted">Recent fasts</h2>
            <div className="space-y-2">
              {history.map(r => (
                <div key={r.id} className="flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm">
                  <span className="flex-1 text-sm text-muted">{format(new Date(r.start_time), 'EEE d MMM, HH:mm')}</span>
                  <span className="font-semibold text-text-primary">{r.duration_hours}h</span>
                  {r.goal_met && <span className="text-xs text-success" aria-label="Goal reached">✓</span>}
                  <DeleteEntryButton label="fast" onDelete={() => deleteFast(r.id!)} />
                </div>
              ))}
            </div>
          </section>
        )}
      </PageContainer>
    </>
  )
}

function StartFast() {
  const lastGoal = useLastGoal()
  const [goal, setGoal] = useState<number | null>(null)
  const [earlier, setEarlier] = useState(false)
  const [when, setWhen] = useState(() => toLocalInput(new Date()))
  const chosen = goal ?? lastGoal ?? 16

  return (
    <div className="mb-6 rounded-xl bg-card p-5 shadow-sm">
      <Timer className="mx-auto mb-2 h-10 w-10 text-accent-500" />
      <p className="mb-3 text-center text-sm text-muted">Start a fast whenever you like. It runs until you end it.</p>
      <p className="mb-1.5 text-xs font-medium text-muted">Goal</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {GOAL_OPTIONS.map(h => <button key={h} onClick={() => setGoal(h)} className={chip(chosen === h)}>{h}h</button>)}
      </div>
      {earlier ? (
        <input type="datetime-local" value={when} max={toLocalInput(new Date())} onChange={e => setWhen(e.target.value)} aria-label="Started at" className="mb-3 w-full rounded-lg bg-surface px-3 py-2 text-text-primary" />
      ) : (
        <button onClick={() => setEarlier(true)} className="mb-3 text-sm font-medium text-primary-500">Started earlier? Set the time</button>
      )}
      <button onClick={() => startFast(chosen, earlier && when ? new Date(when) : new Date())} className={primaryButton}>
        Start fast
      </button>
    </div>
  )
}

function RunningFast({ fast, onEnded }: { fast: FastingRecord; onEnded: (result: { durationHours: number; goalMet: boolean }) => void }) {
  const now = useNow(30_000)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const minutes = fastingMinutes(fast, now)
  const reached = minutes >= fast.goal_hours * 60
  const progress = Math.min(minutes / (fast.goal_hours * 60), 1)

  return (
    <div className="mb-6 rounded-xl bg-card p-5 text-center shadow-sm">
      <p className="text-4xl font-bold tabular-nums text-text-primary">{formatFastingDuration(minutes)}</p>
      <p className="mt-1 text-xs text-muted">Since {format(new Date(fast.start_time), 'EEE HH:mm')}</p>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full origin-left rounded-full transition-transform duration-500 ${reached ? 'bg-success' : 'bg-accent-400'}`}
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {GOAL_OPTIONS.map(h => (
          <button key={h} onClick={() => updateRunningFast(fast.id!, { goal_hours: h })} className={chip(fast.goal_hours === h)}>{h}h</button>
        ))}
      </div>
      {reached && <p className="mt-3 text-sm font-medium text-success">Goal reached. End it whenever you're ready.</p>}
      <button onClick={async () => onEnded(await endFast(fast))} className={`mt-4 ${primaryButton}`}>End fast</button>
      <button
        onClick={() => (confirmRemove ? deleteFast(fast.id!) : setConfirmRemove(true))}
        className="mt-2 w-full py-1.5 text-sm text-muted hover:text-text-primary"
      >
        {confirmRemove ? 'Tap again to remove it' : "Didn't mean to start? Remove it"}
      </button>
    </div>
  )
}
