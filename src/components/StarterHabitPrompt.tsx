import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { STARTER_HABITS, addStarterHabits, markStarterOffered } from '../lib/starterHabits'

interface Props {
  onDismiss: () => void
}

export default function StarterHabitPrompt({ onDismiss }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 1, 2]))

  function toggle(i: number) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  async function handleAdd() {
    await addStarterHabits(Array.from(selected))
    markStarterOffered()
    onDismiss()
  }

  function handleSkip() {
    markStarterOffered()
    onDismiss()
  }

  return (
    <div className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-500" />
          <p className="text-sm font-semibold text-text-primary">Starter Habits</p>
        </div>
        <button onClick={handleSkip} className="p-0.5 text-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-muted mb-3">Pick 2-3 habits to get started. You can always add more later.</p>

      <div className="space-y-2 mb-3">
        {STARTER_HABITS.map((habit, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition-colors ${
              selected.has(i) ? 'bg-primary-100 text-primary-700 font-medium' : 'bg-surface text-muted'
            }`}
          >
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
              selected.has(i) ? 'border-primary-500 bg-primary-500 text-white' : 'border-muted'
            }`}>
              {selected.has(i) && <span className="text-xs">✓</span>}
            </div>
            {habit.title}
          </button>
        ))}
      </div>

      <button
        onClick={handleAdd}
        disabled={selected.size === 0}
        className="w-full rounded-lg bg-primary-500 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Add {selected.size} habit{selected.size !== 1 ? 's' : ''}
      </button>
    </div>
  )
}
