import { useChartColors } from '../../hooks/useChartColors'
import { MOOD_LABELS, MOOD_COLORS } from '../../lib/mood'
import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useTodaysMood, useMoodHistory, useMoodTags, addMoodEntry, addMoodTag, deleteMoodTag } from '../../hooks/useMood'


export default function MoodPage() {
  const chartColors = useChartColors()
  const todaysMood = useTodaysMood()
  const history = useMoodHistory(30)
  const savedTags = useMoodTags()
  const [score, setScore] = useState(3)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const [saving, setSaving] = useState(false)

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
    if (saving) return
    setSaving(true)
    await addMoodEntry(score, selectedTags)
    setScore(3)
    setSelectedTags([])
    setSaving(false)
  }

  const chartData = history
    ?.slice()
    .reverse()
    .map(e => ({
      date: format(new Date(e.date), 'MMM d'),
      score: e.score,
    }))

  const latestMood = todaysMood?.length ? todaysMood[todaysMood.length - 1] : null

  return (
    <>
      <TopBar title="Mood" />
      <PageContainer>
        {latestMood && (
          <div className="mb-4 rounded-2xl bg-card p-4 shadow-sm text-center">
            <p className="text-xs text-muted mb-1">Current mood</p>
            <p className="text-2xl font-bold" style={{ color: MOOD_COLORS[latestMood.score] }}>
              {MOOD_LABELS[latestMood.score]}
            </p>
            {latestMood.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {latestMood.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-muted">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-text-primary text-center">How are you feeling?</p>

          <div className="flex justify-center gap-3 mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                onClick={() => setScore(s)}
                className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold transition-all ${
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
          <p className="text-center text-sm font-medium mb-4" style={{ color: MOOD_COLORS[score] }}>
            {MOOD_LABELS[score]}
          </p>

          {savedTags && savedTags.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-medium text-muted">Tags (optional)</p>
              <div className="flex flex-wrap gap-2">
                {savedTags.map(tag => (
                  <div key={tag.id} className="flex items-center gap-0.5">
                    <button
                      onClick={() => toggleTag(tag.label)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        selectedTags.includes(tag.label)
                          ? 'bg-primary-500 text-white'
                          : 'bg-surface text-muted hover:bg-primary-50'
                      }`}
                    >
                      {tag.label}
                    </button>
                    <button
                      onClick={() => deleteMoodTag(tag.id!)}
                      className="p-0.5 text-muted/40 hover:text-danger"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 flex items-center gap-2">
            {!showTagInput ? (
              <button
                onClick={() => setShowTagInput(true)}
                className="flex items-center gap-1 text-xs text-primary-500 font-medium"
              >
                <Plus className="h-3 w-3" /> Add tag
              </button>
            ) : (
              <div className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="Tag name"
                  className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                />
                <button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            Log Mood
          </button>
        </div>

        {chartData && chartData.length > 1 && (
          <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-muted">Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke={chartColors.primary} strokeWidth={2} dot={{ fill: chartColors.primary, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {history && history.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">History</h3>
            <div className="space-y-2">
              {history.map(entry => (
                <div key={entry.id} className="flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: MOOD_COLORS[entry.score] }}
                  >
                    {entry.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {MOOD_LABELS[entry.score]}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      <span className="text-xs text-muted">
                        {format(new Date(entry.date), 'EEE, MMM d')}
                      </span>
                      {entry.tags.map(tag => (
                        <span key={tag} className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}
