import { useState } from 'react'
import { X } from 'lucide-react'
import { addMoodEntry } from '../hooks/useMood'

const MOOD_LABELS = ['', 'Awful', 'Bad', 'Okay', 'Good', 'Great']
const MOOD_COLORS = ['', '#d4665a', '#f47e6c', '#e8a838', '#4eb499', '#5cb176']

interface MoodPromptProps {
  timeOfDay: 'morning' | 'midday' | 'night'
  onDismiss: () => void
}

export default function MoodPrompt({ timeOfDay, onDismiss }: MoodPromptProps) {
  const [score, setScore] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const greeting = timeOfDay === 'morning'
    ? 'Good morning! How are you feeling?'
    : timeOfDay === 'midday'
    ? 'Quick check-in — how are you doing?'
    : 'How was your day?'

  async function handleSubmit() {
    if (score === null || saving) return
    setSaving(true)
    await addMoodEntry(score, [timeOfDay])
    onDismiss()
  }

  return (
    <div className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-text-primary">{greeting}</p>
        <button onClick={onDismiss} className="p-0.5 text-muted hover:text-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex justify-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onClick={() => setScore(s)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
              score === s
                ? 'scale-110 text-white shadow-md'
                : 'bg-surface text-muted hover:bg-primary-50'
            }`}
            style={score === s ? { backgroundColor: MOOD_COLORS[s] } : undefined}
          >
            {s}
          </button>
        ))}
      </div>

      {score !== null && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs font-medium" style={{ color: MOOD_COLORS[score] }}>
            {MOOD_LABELS[score]}
          </p>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-primary-500 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Log
          </button>
        </div>
      )}
    </div>
  )
}
