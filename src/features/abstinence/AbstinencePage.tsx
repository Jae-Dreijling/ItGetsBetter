import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Wind } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import Sheet from '../../components/Sheet'
import { useCounters, useCounterEvents, useNow } from '../../hooks/useAbstinence'
import { abstinenceStats, formatDuration } from '../../lib/abstinence'
import { CounterForm, SlipForm, CravingHelper } from './parts'
import type { AbstinenceCounter } from '../../types'

type SheetState = { kind: 'new' } | { kind: 'slip' | 'craving'; counter: AbstinenceCounter } | null

export default function AbstinencePage() {
  const navigate = useNavigate()
  const counters = useCounters()
  const events = useCounterEvents()
  const now = useNow()
  const [sheet, setSheet] = useState<SheetState>(null)
  // Kept after closing, so the sheet doesn't empty while it slides away.
  const [lastSheet, setLastSheet] = useState<Exclude<SheetState, null>>({ kind: 'new' })

  function open(next: Exclude<SheetState, null>) {
    setLastSheet(next)
    setSheet(next)
  }

  const title = lastSheet.kind === 'new' ? 'New counter' : lastSheet.kind === 'slip' ? 'It happened' : 'Riding out a craving'

  return (
    <>
      <TopBar title="Abstinence" onBack={() => navigate('/me')} />
      <PageContainer>
        {counters && counters.length === 0 && (
          <div className="mb-4 rounded-xl bg-card p-5 text-center shadow-sm">
            <p className="mb-1 text-3xl" aria-hidden>🌿</p>
            <p className="font-medium text-text-primary">Step away from something, at your pace.</p>
            <p className="mt-1 text-sm text-muted">The main number is how many of the last 30 days were free. A slip never wipes that out.</p>
          </div>
        )}

        <div className="space-y-3">
          {counters?.map(counter => {
            const stats = abstinenceStats(counter.started_at, events.filter(e => e.counter_id === counter.id && e.kind === 'slip').map(e => e.at), now)
            return (
              <div key={counter.id} className="rounded-xl bg-card p-4 shadow-sm">
                <button onClick={() => navigate(`/me/abstinence/${counter.id}`)} className="block w-full text-left">
                  <p className="flex items-center gap-2 font-medium text-text-primary">
                    <span className="text-xl" aria-hidden>{counter.emoji}</span>
                    {counter.name}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-text-primary">
                    {stats.freeInWindow}
                    <span className="text-base font-normal text-muted"> of {stats.windowDays} days free</span>
                  </p>
                  <p className="text-sm text-muted">Now: {formatDuration(stats.currentRunMs)}</p>
                </button>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => open({ kind: 'craving', counter })}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-100 py-2 text-sm font-medium text-primary-700"
                  >
                    <Wind className="h-4 w-4" /> Craving
                  </button>
                  <button onClick={() => open({ kind: 'slip', counter })} className="flex-1 rounded-lg bg-surface py-2 text-sm text-muted">
                    It happened
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => open({ kind: 'new' })}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary-200 py-3 text-sm font-medium text-muted hover:bg-primary-50 dark:border-primary-800"
        >
          <Plus className="h-4 w-4" /> New counter
        </button>
      </PageContainer>

      <Sheet open={sheet !== null} onClose={() => setSheet(null)} title={title}>
        {lastSheet.kind === 'new' && <CounterForm onSaved={() => setSheet(null)} />}
        {lastSheet.kind === 'slip' && <SlipForm counter={lastSheet.counter} onDone={() => setSheet(null)} />}
        {lastSheet.kind === 'craving' && (
          <CravingHelper
            counter={lastSheet.counter}
            onDone={() => setSheet(null)}
            onSlip={() => open({ kind: 'slip', counter: lastSheet.counter })}
          />
        )}
      </Sheet>
    </>
  )
}
