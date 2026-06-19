import { useState } from 'react'
import { format } from 'date-fns'
import { Moon, Star } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useTodaysSleep, useSleepHistory, addSleepEntry } from '../../hooks/useSleep'
import { getLogicalDate } from '../../lib/date'

const QUALITY_LABELS = ['', 'Terrible', 'Poor', 'Fair', 'Good', 'Excellent']

export default function SleepPage() {
  const todaysSleep = useTodaysSleep()
  const history = useSleepHistory(30)
  const [hours, setHours] = useState('')
  const [quality, setQuality] = useState(3)
  const [wakeFeeling, setWakeFeeling] = useState('')
  const [date, setDate] = useState(getLogicalDate())
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hours || saving) return
    setSaving(true)
    await addSleepEntry({
      hours_slept: parseFloat(hours),
      quality_rating: quality,
      wake_feeling: wakeFeeling.trim() || null,
      date,
    })
    setHours('')
    setQuality(3)
    setWakeFeeling('')
    setSaving(false)
  }

  const chartData = history
    ?.slice()
    .reverse()
    .map(e => ({
      date: format(new Date(e.date), 'MMM d'),
      hours: e.hours_slept,
      quality: e.quality_rating,
    }))

  const avgHours = history?.length
    ? (history.reduce((sum, e) => sum + e.hours_slept, 0) / history.length).toFixed(1)
    : null

  return (
    <>
      <TopBar title="Sleep" />
      <PageContainer>
        {todaysSleep && (
          <div className="mb-4 rounded-2xl bg-card p-4 shadow-sm text-center">
            <Moon className="mx-auto mb-1 h-6 w-6 text-accent-500" />
            <p className="text-2xl font-bold text-text-primary">{todaysSleep.hours_slept}h</p>
            <p className="text-sm text-muted">{QUALITY_LABELS[todaysSleep.quality_rating]} quality</p>
            {todaysSleep.wake_feeling && (
              <p className="mt-1 text-xs text-muted italic">"{todaysSleep.wake_feeling}"</p>
            )}
          </div>
        )}

        {!todaysSleep && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
            <p className="mb-3 text-sm font-medium text-text-primary text-center">How did you sleep?</p>

            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-muted">Hours slept</label>
              <input
                type="number"
                step="0.5"
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="7.5"
                min="0"
                max="24"
                className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-muted">Quality</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2.5 text-xs font-medium transition-all ${
                      quality === q
                        ? 'bg-accent-500 text-white scale-105'
                        : 'bg-surface text-muted hover:bg-accent-50'
                    }`}
                  >
                    <Star className={`h-3 w-3 ${quality === q ? 'fill-white' : ''}`} />
                    {q}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-center text-xs text-muted">{QUALITY_LABELS[quality]}</p>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted">How do you feel? (optional)</label>
              <input
                type="text"
                value={wakeFeeling}
                onChange={e => setWakeFeeling(e.target.value)}
                placeholder="Rested, groggy, refreshed..."
                className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
              />
            </div>

            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary focus:border-primary-400 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!hours || saving}
              className="w-full rounded-lg bg-accent-500 py-2.5 font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
            >
              Log Sleep
            </button>
          </form>
        )}

        {todaysSleep && (
          <p className="mb-4 text-center text-xs text-muted">Sleep already logged today. Use backfill to log other days.</p>
        )}

        <div className="mb-6 flex gap-3">
          {avgHours && (
            <div className="flex-1 rounded-2xl bg-card p-4 shadow-sm text-center">
              <p className="text-lg font-bold text-text-primary">{avgHours}h</p>
              <p className="text-xs text-muted">avg sleep</p>
            </div>
          )}
          {history && history.length > 0 && (
            <div className="flex-1 rounded-2xl bg-card p-4 shadow-sm text-center">
              <p className="text-lg font-bold text-text-primary">
                {(history.reduce((sum, e) => sum + e.quality_rating, 0) / history.length).toFixed(1)}
              </p>
              <p className="text-xs text-muted">avg quality</p>
            </div>
          )}
        </div>

        {chartData && chartData.length > 1 && (
          <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-muted">Sleep Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e6df" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#8c7a6e" />
                <YAxis tick={{ fontSize: 10 }} stroke="#8c7a6e" />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#eaaa08" strokeWidth={2} dot={{ fill: '#eaaa08', r: 3 }} name="Hours" />
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
                  <Moon className="h-5 w-5 shrink-0 text-accent-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {entry.hours_slept}h — {QUALITY_LABELS[entry.quality_rating]}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted">{format(new Date(entry.date), 'EEE, MMM d')}</span>
                      {entry.wake_feeling && (
                        <span className="text-xs text-muted italic">"{entry.wake_feeling}"</span>
                      )}
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
