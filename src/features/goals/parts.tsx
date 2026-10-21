import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Check } from 'lucide-react'
import { pop } from '../../lib/animations'
import { createTrack, toggleMilestone, setMilestoneAuto } from '../../hooks/useGoals'
import { TEMPLATES, weightTemplate, type GoalTemplate } from '../../lib/goals'
import type { GoalMilestone, MilestoneAuto } from '../../types'

const EMOJIS = ['🎯', '🎸', '😴', '💪', '📚', '💃', '⚖️', '🎨', '🧘', '🌱']
const inputClass = 'w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none dark:border-primary-900'

// The round tick for a milestone, with a pop when it's reached.
export function MilestoneCheck({ milestone, size = 'md' }: { milestone: GoalMilestone; size?: 'md' | 'lg' }) {
  const done = !!milestone.done_at
  const box = size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
  return (
    <button
      onClick={e => { e.stopPropagation(); toggleMilestone(milestone.id!) }}
      className={`flex ${box} shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        done ? 'border-success bg-success text-white' : 'border-primary-300 hover:border-primary-500'
      }`}
      aria-label={done ? `Not reached yet: ${milestone.text}` : `Reached: ${milestone.text}`}
    >
      <AnimatePresence initial={false}>
        {done && (
          <m.span key="check" variants={pop} initial="hidden" animate="visible" exit="exit">
            <Check className={size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'} />
          </m.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export function NewTrackForm({ onCreated }: { onCreated: (id: number) => void }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [steps, setSteps] = useState('')

  function applyTemplate(t: GoalTemplate) {
    setName(t.name)
    setEmoji(t.emoji)
    setSteps(t.milestones.join('\n'))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onCreated(await createTrack(name.trim(), emoji, steps.split('\n')))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Start from an example (optional)</p>
        <div className="flex flex-wrap gap-1.5">
          {[weightTemplate(), ...TEMPLATES].map(t => (
            <button key={t.name} type="button" onClick={() => applyTemplate(t)} className="rounded-full bg-surface px-3 py-1 text-sm text-text-primary">
              {t.emoji} {t.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {EMOJIS.map(e => (
          <button key={e} type="button" onClick={() => setEmoji(e)} aria-pressed={emoji === e}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${emoji === e ? 'bg-primary-100 ring-2 ring-primary-400' : 'bg-surface'}`}>
            {e}
          </button>
        ))}
      </div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="What's the goal? (e.g. Guitar)" className={inputClass} />
      <div>
        <textarea
          value={steps}
          onChange={e => setSteps(e.target.value)}
          placeholder={'Milestones, one per line, in order\nLearn 4 basic chords\nPlay a full song'}
          rows={5}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-muted">You can change, reorder and add steps any time. No deadlines unless you want them.</p>
      </div>
      <button type="submit" disabled={!name.trim()} className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50">
        Start this goal
      </button>
    </form>
  )
}

// "Ticks itself when…": by hand, or from the weight trend.
export function AutoEditor({ milestone }: { milestone: GoalMilestone }) {
  const auto = milestone.auto ?? null
  const [kind, setKind] = useState<MilestoneAuto['kind'] | 'manual'>(auto?.kind ?? 'manual')
  const [value, setValue] = useState(auto ? String(auto.value) : '')

  function save(nextKind: typeof kind, nextValue: string) {
    const kg = Number(nextValue.replace(',', '.'))
    if (nextKind === 'manual') return setMilestoneAuto(milestone.id!, null)
    if (nextValue.trim() && Number.isFinite(kg) && kg > 0) return setMilestoneAuto(milestone.id!, { kind: nextKind, value: kg })
  }

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs text-muted">
        Ticks itself
        <select
          value={kind}
          onChange={e => { const k = e.target.value as typeof kind; setKind(k); void save(k, value) }}
          className="min-w-0 flex-1 rounded-md bg-surface px-2 py-1 text-text-primary"
        >
          <option value="manual">No, I tick it myself</option>
          <option value="weight_down_kg">when my trend is … kg below where I started</option>
          <option value="weight_at_most_kg">when my trend reaches … kg</option>
        </select>
      </label>
      {kind !== 'manual' && (
        <label className="flex items-center gap-2 text-xs text-muted">
          {kind === 'weight_down_kg' ? 'Kilos below the start' : 'Trend at or below'}
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={() => void save(kind, value)}
            inputMode="decimal"
            placeholder="kg"
            aria-label="Kilos"
            className="w-20 rounded-md bg-surface px-2 py-1 text-center text-text-primary"
          />
          kg
        </label>
      )}
    </div>
  )
}
