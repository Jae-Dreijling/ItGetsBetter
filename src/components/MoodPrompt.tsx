import { useState } from 'react'
import { MOOD_LABELS, MOOD_COLORS } from '../lib/mood'
import { X, Plus } from 'lucide-react'
import { addMoodEntry, useMoodTags, addMoodTag } from '../hooks/useMood'


interface MoodPromptProps {
  timeOfDay: 'morning' | 'midday' | 'night'
  onDismiss: () => void
}

export default function MoodPrompt({ timeOfDay, onDismiss }: MoodPromptProps) {
  const [score, setScore] = useState<number | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([timeOfDay])
  const [newTag, setNewTag] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const [saving, setSaving] = useState(false)
  const savedTags = useMoodTags()

  const greeting = timeOfDay === 'morning'
    ? 'Good morning! How are you feeling?'
    : timeOfDay === 'midday'
    ? 'Quick check-in — how are you doing?'
    : 'How was your day?'

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function handleAddTag() {
    if (!newTag.trim()) return
    await addMoodTag(newTag.trim())
    setSelectedTags(prev => [...prev, newTag.trim()])
    setNewTag('')
    setShowTagInput(false)
  }

  async function handleSubmit() {
    if (score === null || saving) return
    setSaving(true)
    await addMoodEntry(score, selectedTags)
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
        <>
          <p className="text-center text-xs font-medium mb-2" style={{ color: MOOD_COLORS[score] }}>
            {MOOD_LABELS[score]}
          </p>

          {savedTags && savedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {savedTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.label)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    selectedTags.includes(tag.label)
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface text-muted'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            {!showTagInput ? (
              <button
                onClick={() => setShowTagInput(true)}
                className="flex items-center gap-0.5 text-xs text-primary-500"
              >
                <Plus className="h-3 w-3" /> tag
              </button>
            ) : (
              <div className="flex gap-1.5 flex-1 mr-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="Tag"
                  className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2 py-1 text-xs text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                />
                <button onClick={handleAddTag} disabled={!newTag.trim()} className="rounded-lg bg-primary-500 px-2 py-1 text-xs text-white disabled:opacity-50">
                  +
                </button>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-lg bg-primary-500 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Log
            </button>
          </div>
        </>
      )}
    </div>
  )
}
