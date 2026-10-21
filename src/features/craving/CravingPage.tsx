import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useSessionCompanion } from '../../hooks/useCompanion'
import { useCravingEvents, finishCraving, addInsteadIdea } from '../../hooks/useCravings'
import { useProfile } from '../../hooks/useProfile'
import { useNow } from '../../hooks/useAbstinence'
import { useFeatureTiers } from '../../hooks/useFeatures'
import { isOn } from '../../lib/features'
import { TRIGGERS, WAIT_MS, OUTCOME_TEXT, insteadList, triggerCounts, type CravingOutcome } from '../../lib/craving'

type Step = 'hungry' | 'name' | 'wait' | 'decide' | 'done'

const primary = 'w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white'
const secondary = 'w-full rounded-lg bg-surface py-2.5 text-sm font-medium text-text-primary'

// The craving flow (step 9d): hungry? → name it → ten minutes → decide.
export default function CravingPage() {
  const navigate = useNavigate()
  const companion = useSessionCompanion()
  const events = useCravingEvents()
  const [step, setStep] = useState<Step>('hungry')
  const [trigger, setTrigger] = useState<string | null>(null)
  const [instead, setInstead] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<CravingOutcome | null>(null)
  const [runKey, setRunKey] = useState(0)

  async function finish(result: CravingOutcome) {
    await finishCraving({ hungry: result === 'hungry', trigger, instead, outcome: result })
    setOutcome(result)
    setStep('done')
  }

  function again() {
    setStep('hungry')
    setTrigger(null)
    setInstead(null)
    setOutcome(null)
    setRunKey(k => k + 1)
  }

  const patterns = triggerCounts(events.map(e => e.trigger)).slice(0, 4)
  const handled = events.filter(e => e.outcome === 'passed' || e.outcome === 'portion').length

  return (
    <>
      <TopBar title="Craving" onBack={() => navigate('/log')} />
      <PageContainer>
        <div className="mb-4 rounded-xl bg-card p-5 shadow-sm">
          <p className="mb-3 text-xs font-medium text-muted">💬 {companion?.name ?? 'Your companion'} is with you</p>
          {step === 'hungry' && (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-text-primary">First: are you actually hungry?</p>
              <p className="text-sm text-muted">If your last meal was a while ago, or anything sounds good (even an apple), that's hunger, not a craving.</p>
              <button onClick={() => finish('hungry')} className={secondary}>Yes, I'm hungry</button>
              <button onClick={() => setStep('name')} className={primary}>No, it's a craving</button>
            </div>
          )}

          {step === 'name' && (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-text-primary">What's going on right now?</p>
              <p className="text-sm text-muted">Just naming it helps. One tap.</p>
              <div className="flex flex-wrap gap-2">
                {TRIGGERS.map(t => (
                  <button
                    key={t}
                    onClick={() => { setTrigger(t); setStep('wait') }}
                    className="rounded-full bg-surface px-3.5 py-1.5 text-sm capitalize text-text-primary"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'wait' && <Wait key={runKey} trigger={trigger} instead={instead} onPick={setInstead} onReady={() => setStep('decide')} />}

          {step === 'decide' && (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-text-primary">How is it now?</p>
              <p className="text-sm text-muted">Every answer is okay. You already did the hard part: you stopped and checked in.</p>
              <button onClick={() => finish('passed')} className={primary}>It passed</button>
              <button onClick={() => finish('portion')} className={secondary}>I'll have a portion, on purpose</button>
              <button onClick={() => finish('had_it')} className={secondary}>I'm having it</button>
            </div>
          )}

          {step === 'done' && outcome && (
            <div className="space-y-4 text-center">
              <p className="text-4xl" aria-hidden>{outcome === 'had_it' ? '🫶' : outcome === 'hungry' ? '🍎' : '🌊'}</p>
              <p className="text-text-primary">{OUTCOME_TEXT[outcome]}</p>
              {outcome === 'hungry' && <HungryLinks />}
              <button onClick={again} className={secondary}>Start over</button>
            </div>
          )}
        </div>

        {(patterns.length > 0 || handled > 0) && (
          <section className="rounded-xl bg-card p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium text-text-primary">Your patterns</p>
            {handled > 0 && <p className="mb-2 text-sm text-text-primary">🌊 {handled} craving{handled === 1 ? '' : 's'} ridden out or kept to a portion.</p>}
            {patterns.length > 0 && (
              <>
                <p className="mb-1.5 text-xs text-muted">What usually comes before it</p>
                <div className="flex flex-wrap gap-1.5">
                  {patterns.map(([t, n]) => (
                    <span key={t} className="rounded-full bg-surface px-3 py-1 text-xs capitalize text-text-primary">{t} · {n}</span>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </PageContainer>
    </>
  )
}

// Ten minutes with something from the instead list. Skippable.
function Wait({ trigger, instead, onPick, onReady }: { trigger: string | null; instead: string | null; onPick: (s: string) => void; onReady: () => void }) {
  const [startedAt] = useState(() => Date.now())
  const now = useNow(1000)
  const { profile } = useProfile()
  const [newIdea, setNewIdea] = useState('')
  const left = Math.max(0, WAIT_MS - (now.getTime() - startedAt))
  const mm = Math.floor(left / 60000)
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0')

  async function addIdea(e: React.FormEvent) {
    e.preventDefault()
    if (!newIdea.trim()) return
    await addInsteadIdea(newIdea)
    onPick(newIdea.trim())
    setNewIdea('')
  }

  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold text-text-primary">Give it ten minutes{trigger && trigger !== 'something else' ? ` (${trigger})` : ''}.</p>
      <p className="text-sm text-muted">Cravings rise and fall like a wave. Pick something to do meanwhile; you don't have to decide anything yet.</p>
      <div className="text-center">
        <p className="text-4xl font-bold tabular-nums text-text-primary">{mm}:{ss}</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div className="h-full origin-left rounded-full bg-accent-400 transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${1 - left / WAIT_MS})` }} />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {insteadList(profile?.craving_instead).map(idea => (
          <button
            key={idea}
            onClick={() => onPick(idea)}
            aria-pressed={instead === idea}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors ${instead === idea ? 'bg-accent-500 text-white' : 'bg-surface text-text-primary'}`}
          >
            {idea}
          </button>
        ))}
      </div>
      <form onSubmit={addIdea} className="flex items-center gap-2">
        <input
          value={newIdea}
          onChange={e => setNewIdea(e.target.value)}
          placeholder="Your own idea"
          className="min-w-0 flex-1 rounded-lg bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:outline-none"
        />
        <button type="submit" className="rounded-lg bg-surface p-2 text-muted" aria-label="Add idea"><Plus className="h-4 w-4" /></button>
      </form>
      <button onClick={onReady} className={left === 0 ? primary : secondary}>{left === 0 ? 'Ten minutes. How is it now?' : "I'm ready now"}</button>
    </div>
  )
}

function HungryLinks() {
  const navigate = useNavigate()
  const tiers = useFeatureTiers()
  return (
    <div className="flex gap-2">
      <button onClick={() => navigate('/log/meal')} className="flex-1 rounded-lg bg-primary-500 py-2 text-sm font-semibold text-white">Log a meal</button>
      {isOn(tiers, 'meal_prep') && (
        <button onClick={() => navigate('/log/meal-prep')} className="flex-1 rounded-lg bg-surface py-2 text-sm font-medium text-text-primary">My meal plan</button>
      )}
    </div>
  )
}
