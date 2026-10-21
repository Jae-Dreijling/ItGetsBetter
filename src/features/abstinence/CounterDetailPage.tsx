import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { format } from 'date-fns'
import { Pencil, Wind, X } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import Sheet from '../../components/Sheet'
import { useCounter, useCounterEvents, useNow, archiveCounter, bringBackCounter, deleteCounter, deleteEvent } from '../../hooks/useAbstinence'
import { abstinenceStats, formatDuration, wholeDays, contextCounts, MILESTONES } from '../../lib/abstinence'
import { CounterForm, SlipForm, CravingHelper } from './parts'
import type { AbstinenceCounter } from '../../types'

export default function CounterDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const counter = useCounter(Number(id))

  return (
    <>
      <TopBar title={counter ? counter.name : 'Counter'} onBack={() => navigate('/me/abstinence')} />
      <PageContainer>
        {counter === undefined ? null : counter === null ? (
          <p className="py-8 text-center text-sm text-muted">This counter doesn't exist anymore.</p>
        ) : (
          <CounterDetails counter={counter} onGone={() => navigate('/me/abstinence', { replace: true })} />
        )}
      </PageContainer>
    </>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-card p-3 shadow-sm">
      <p className="text-lg font-bold text-text-primary">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}

type SheetKind = 'edit' | 'slip' | 'craving'

function CounterDetails({ counter, onGone }: { counter: AbstinenceCounter; onGone: () => void }) {
  const events = useCounterEvents(counter.id)
  const now = useNow()
  const [sheet, setSheet] = useState<SheetKind | null>(null)
  const [lastSheet, setLastSheet] = useState<SheetKind>('edit')
  const [confirm, setConfirm] = useState<'archive' | 'delete' | null>(null)

  const slips = events.filter(e => e.kind === 'slip')
  const resisted = events.filter(e => e.kind === 'craving_resisted').length
  const stats = abstinenceStats(counter.started_at, slips.map(e => e.at), now)
  const patterns = contextCounts(slips.map(e => e.context))
  const nextMilestone = MILESTONES[stats.milestonesReached]

  function open(kind: SheetKind) {
    setLastSheet(kind)
    setSheet(kind)
  }

  async function act(which: 'archive' | 'delete') {
    if (confirm !== which) return setConfirm(which)
    if (which === 'archive') await archiveCounter(counter.id!)
    else await deleteCounter(counter.id!)
    onGone()
  }

  return (
    <div>
      <div className="mb-4 rounded-xl bg-card p-5 text-center shadow-sm">
        <p className="text-3xl" aria-hidden>{counter.emoji}</p>
        <p className="mt-1 text-5xl font-bold text-text-primary">{stats.freeInWindow}</p>
        <p className="text-sm text-muted">of the last {stats.windowDays} days free</p>
        <p className="mt-3 text-sm text-text-primary">Now: {formatDuration(stats.currentRunMs)}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Stat value={`${wholeDays(stats.longestRunMs)} days`} label="Longest run" />
        <Stat value={`${stats.totalFreeDays}`} label="Free days in total" />
        <Stat value={`${resisted}`} label={`Craving${resisted === 1 ? '' : 's'} that passed`} />
        {counter.cost_per_day !== null && (
          <Stat value={`€${Math.round(stats.totalFreeDays * counter.cost_per_day)}`} label="Saved, roughly" />
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <button onClick={() => open('craving')} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-100 py-2 text-sm font-medium text-primary-700">
          <Wind className="h-4 w-4" /> Craving
        </button>
        <button onClick={() => open('slip')} className="flex-1 rounded-lg bg-surface py-2 text-sm text-muted">It happened</button>
      </div>

      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold text-muted">Milestones</h2>
        <div className="flex flex-wrap gap-1.5">
          {MILESTONES.map((m, i) => (
            <span
              key={m.days}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                i < stats.milestonesReached
                  ? 'bg-primary-500 text-white'
                  : m === nextMilestone ? 'border border-dashed border-primary-300 text-primary-600' : 'bg-surface text-muted'
              }`}
            >
              {i < stats.milestonesReached ? '✓ ' : ''}{m.label}
            </span>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted">Reached milestones stay reached.</p>
      </section>

      {counter.why && (
        <section className="mb-4 rounded-xl bg-card p-4 shadow-sm">
          <p className="mb-0.5 text-xs font-medium text-muted">Why I'm doing this</p>
          <p className="text-sm text-text-primary">{counter.why}</p>
        </section>
      )}

      {patterns.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-sm font-semibold text-muted">What was going on</h2>
          <div className="flex flex-wrap gap-1.5">
            {patterns.map(([context, n]) => (
              <span key={context} className="rounded-full bg-surface px-3 py-1 text-xs capitalize text-text-primary">{context} · {n}</span>
            ))}
          </div>
        </section>
      )}

      {slips.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-sm font-semibold text-muted">Times it happened</h2>
          <div className="space-y-1">
            {[...slips].reverse().map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm shadow-sm">
                <span className="text-text-primary">
                  {format(new Date(e.at), 'EEE d MMM, HH:mm')}
                  {e.context && <span className="capitalize text-muted"> · {e.context}</span>}
                </span>
                <button onClick={() => deleteEvent(e.id!)} className="p-1 text-muted hover:text-text-primary" aria-label="Remove, logged by mistake">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mb-4 text-xs text-muted">Counting since {format(new Date(counter.started_at), 'd MMMM yyyy')}.</p>

      <div className="space-y-1 border-t border-primary-100 pt-3 dark:border-primary-900">
        <button onClick={() => open('edit')} className="flex w-full items-center justify-center gap-1.5 py-2 text-sm text-muted hover:text-text-primary">
          <Pencil className="h-4 w-4" /> Edit
        </button>
        {counter.archived ? (
          <button onClick={() => bringBackCounter(counter.id!)} className="w-full py-2 text-sm font-medium text-primary-500">
            Bring it back
          </button>
        ) : (
          <button onClick={() => act('archive')} className="w-full py-2 text-sm text-muted hover:text-text-primary">
            {confirm === 'archive' ? 'Tap again to put it away (history is kept)' : 'Put away'}
          </button>
        )}
        <button onClick={() => act('delete')} className="w-full py-2 text-sm text-muted hover:text-danger">
          {confirm === 'delete' ? 'Tap again to delete it and its history' : 'Delete'}
        </button>
      </div>

      <Sheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={lastSheet === 'edit' ? 'Edit counter' : lastSheet === 'slip' ? 'It happened' : 'Riding out a craving'}
      >
        {lastSheet === 'edit' && <CounterForm counter={counter} onSaved={() => setSheet(null)} />}
        {lastSheet === 'slip' && <SlipForm counter={counter} onDone={() => setSheet(null)} />}
        {lastSheet === 'craving' && <CravingHelper counter={counter} onDone={() => setSheet(null)} onSlip={() => open('slip')} />}
      </Sheet>
    </div>
  )
}
