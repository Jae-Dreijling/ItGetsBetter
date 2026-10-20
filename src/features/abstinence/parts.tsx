import { useState } from 'react'
import { format } from 'date-fns'
import { saveCounter, logEvent, useCounterEvents, useNow } from '../../hooks/useAbstinence'
import { abstinenceStats, slipMessage, SLIP_CONTEXTS } from '../../lib/abstinence'
import type { AbstinenceCounter } from '../../types'

const EMOJIS = ['🌿', '🍫', '🍔', '🍷', '🚭', '📱', '🎮', '🛒', '☕', '🎲']
const inputClass = 'w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none dark:border-primary-900'
const primaryButton = 'w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50'

const toLocalInput = (iso: string) => format(new Date(iso), "yyyy-MM-dd'T'HH:mm")

export function CounterForm({ counter, onSaved }: { counter?: AbstinenceCounter; onSaved: (id: number) => void }) {
  const [emoji, setEmoji] = useState(counter?.emoji ?? EMOJIS[0])
  const [name, setName] = useState(counter?.name ?? '')
  const [since, setSince] = useState(toLocalInput(counter?.started_at ?? new Date().toISOString()))
  const [why, setWhy] = useState(counter?.why ?? '')
  const [cost, setCost] = useState(counter?.cost_per_day != null ? String(counter.cost_per_day) : '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const costValue = Number(cost.replace(',', '.'))
    const id = await saveCounter({
      name: name.trim(),
      emoji,
      started_at: new Date(since).toISOString(),
      why: why.trim() || null,
      cost_per_day: cost.trim() && Number.isFinite(costValue) && costValue > 0 ? costValue : null,
    }, counter?.id)
    onSaved(id)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {EMOJIS.map(e => (
          <button
            key={e}
            type="button"
            onClick={() => setEmoji(e)}
            aria-pressed={emoji === e}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition-colors ${emoji === e ? 'bg-primary-100 ring-2 ring-primary-400' : 'bg-surface'}`}
          >
            {e}
          </button>
        ))}
      </div>
      <div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="What are you stepping away from?" className={inputClass} autoFocus={!counter} />
        <p className="mt-1 text-xs text-muted">Name the act itself, like "binge eating" rather than "snacks", so normal life never counts as a slip.</p>
      </div>
      <label className="block text-sm text-text-primary">
        Free since
        <input type="datetime-local" value={since} onChange={e => setSince(e.target.value)} className={`mt-1 ${inputClass}`} />
      </label>
      <textarea value={why} onChange={e => setWhy(e.target.value)} placeholder="Why I'm doing this (optional)" rows={2} className={inputClass} />
      <label className="flex items-center gap-2 text-sm text-text-primary">
        It costs about €
        <input value={cost} onChange={e => setCost(e.target.value)} inputMode="decimal" placeholder="–" className="w-20 rounded-lg border border-primary-100 bg-surface px-2 py-1.5 text-center text-text-primary focus:border-primary-400 focus:outline-none dark:border-primary-900" />
        a day (optional)
      </label>
      <button type="submit" disabled={!name.trim()} className={primaryButton}>{counter ? 'Save' : 'Start counting'}</button>
    </form>
  )
}

// "It happened": no judgement, an optional reason, then the good days first.
export function SlipForm({ counter, onDone }: { counter: AbstinenceCounter; onDone: () => void }) {
  const events = useCounterEvents(counter.id)
  const [context, setContext] = useState<string | null>(null)
  const [earlier, setEarlier] = useState(false)
  const [when, setWhen] = useState(toLocalInput(new Date().toISOString()))
  const [message, setMessage] = useState<string | null>(null)

  async function log() {
    const at = earlier ? new Date(when).toISOString() : new Date().toISOString()
    await logEvent(counter.id!, 'slip', context, at)
    const slips = [...events.filter(e => e.kind === 'slip').map(e => e.at), at]
    setMessage(slipMessage(abstinenceStats(counter.started_at, slips, new Date())))
  }

  if (message) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-4xl" aria-hidden>🌱</p>
        <p className="text-base text-text-primary">{message}</p>
        <button onClick={onDone} className={primaryButton}>OK</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Logging it is the brave part. Want to note what was going on? (optional)</p>
      <div className="flex flex-wrap gap-1.5">
        {SLIP_CONTEXTS.map(c => (
          <button
            key={c}
            onClick={() => setContext(context === c ? null : c)}
            aria-pressed={context === c}
            className={`rounded-full px-3 py-1 text-sm capitalize transition-colors ${context === c ? 'bg-primary-500 text-white' : 'bg-surface text-muted'}`}
          >
            {c}
          </button>
        ))}
      </div>
      {earlier ? (
        <input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} className={inputClass} aria-label="When" />
      ) : (
        <button onClick={() => setEarlier(true)} className="text-sm font-medium text-primary-500">Not just now? Set the time</button>
      )}
      <button onClick={log} className={primaryButton}>Log it</button>
    </div>
  )
}

const CRAVING_MS = 10 * 60 * 1000

// Ride it out: the why, a 10-minute timer, and "it passed" as a small win.
export function CravingHelper({ counter, onDone, onSlip }: { counter: AbstinenceCounter; onDone: () => void; onSlip: () => void }) {
  const [startedAt] = useState(() => Date.now())
  const now = useNow(1000)
  const [passed, setPassed] = useState(false)
  const left = Math.max(0, CRAVING_MS - (now.getTime() - startedAt))
  const mm = Math.floor(left / 60000)
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0')

  async function itPassed() {
    await logEvent(counter.id!, 'craving_resisted')
    setPassed(true)
  }

  if (passed) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-4xl" aria-hidden>💪</p>
        <p className="text-base text-text-primary">That one's yours. Cravings rise and fall, and you just watched one fall.</p>
        <button onClick={onDone} className={primaryButton}>Done</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {counter.why && (
        <div className="rounded-lg bg-surface p-3">
          <p className="mb-0.5 text-xs font-medium text-muted">Why you're doing this</p>
          <p className="text-sm text-text-primary">{counter.why}</p>
        </div>
      )}
      <p className="text-sm text-muted">Cravings usually peak and fade within minutes. Breathe, get some water, move a little. You don't have to decide anything yet.</p>
      <div className="text-center">
        <p className="text-4xl font-bold tabular-nums text-text-primary">{mm}:{ss}</p>
        <div className="mx-auto mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div className="h-full origin-left rounded-full bg-primary-400 transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${1 - left / CRAVING_MS})` }} />
        </div>
        {left === 0 && <p className="mt-2 text-sm text-text-primary">Ten minutes. How is it now?</p>}
      </div>
      <button onClick={itPassed} className={primaryButton}>It passed</button>
      <button onClick={onSlip} className="w-full py-2 text-sm text-muted hover:text-text-primary">It happened anyway</button>
    </div>
  )
}
