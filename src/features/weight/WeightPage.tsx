import { useChartColors } from '../../hooks/useChartColors'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { format, parseISO } from 'date-fns'
import { Ruler } from 'lucide-react'
import { ComposedChart, Line, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile, updateProfile } from '../../hooks/useProfile'
import { useWeightEntries, useWeightTrend, addWeightEntry } from '../../hooks/useWeightEntries'
import { getLogicalDate } from '../../lib/date'
import { getWeightComparison } from '../../lib/weightComparisons'
import BeyondScale from './BeyondScale'
import { changeText, jumpNote, weeklyAverages, type WeightDisplay } from '../../lib/weightTrend'
import DeleteEntryButton from '../../components/DeleteEntryButton'
import { deleteEntry } from '../../lib/deleteEntry'

const DISPLAYS: { value: WeightDisplay; label: string; hint: string }[] = [
  { value: 'every', label: 'Every time', hint: 'Every weigh-in is shown, small, next to the trend.' },
  { value: 'weekly', label: 'Weekly', hint: 'Only weekly averages. Single weigh-ins stay out of sight.' },
  { value: 'hidden', label: 'Trend only', hint: "Only the trend. The scale's daily ups and downs stay out of sight." },
]

export default function WeightPage() {
  const chartColors = useChartColors()
  const navigate = useNavigate()
  const { profile } = useProfile()
  const entries = useWeightEntries()
  const { series, latest, trend, change, display } = useWeightTrend()
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(getLogicalDate())
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!weight || saving) return
    setSaving(true)
    try {
      const isBackfill = date !== getLogicalDate()
      await addWeightEntry(parseFloat(weight.replace(',', '.')), date, isBackfill)
      setWeight('')
    } finally {
      setSaving(false)
    }
  }

  const bmi = trend !== null && profile ? (trend / ((profile.height_cm / 100) ** 2)).toFixed(1) : null
  const note = display === 'every' ? jumpNote(latest) : null
  const chartData = series.map(p => ({ date: format(parseISO(p.date), 'MMM d'), trend: p.trend, weight: display === 'every' ? p.weight : null }))

  return (
    <>
      <TopBar title="Weight" />
      <PageContainer>
        {profile && trend !== null && (
          <>
            <div className="mb-3 rounded-xl bg-card p-4 text-center shadow-sm">
              <p className="text-xs text-muted">Your trend</p>
              <p className="text-3xl font-bold text-text-primary">{trend.toFixed(1)} kg</p>
              {changeText(change) && <p className="text-sm text-muted">{changeText(change)}</p>}
              {display === 'every' && latest && (
                <p className="mt-2 text-xs text-muted">
                  Last weigh-in: {latest.weight} kg ({latest.date === getLogicalDate() ? 'today' : format(parseISO(latest.date), 'EEE d MMM')})
                </p>
              )}
              {note && <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-xs text-text-primary">{note}</p>}
            </div>

            <div className="mb-4 flex gap-3">
              <div className="flex-1 rounded-xl bg-card p-3 text-center shadow-sm">
                <p className="text-xs text-muted">Goal</p>
                <p className="text-lg font-bold text-secondary-500">{profile.goal_weight_milestone_kg} kg</p>
              </div>
              {bmi && (
                <div className="flex-1 rounded-xl bg-card p-3 text-center shadow-sm">
                  <p className="text-xs text-muted">BMI (trend)</p>
                  <p className="text-lg font-bold text-text-primary">{bmi}</p>
                </div>
              )}
            </div>
          </>
        )}

        <BeyondScale />

        {profile && trend !== null && (() => {
          const lost = profile.starting_weight_kg - trend
          const comparison = getWeightComparison(lost)
          if (!comparison || lost <= 0) return null
          return (
            <div className="mb-4 rounded-xl bg-success/10 p-4 text-center">
              <p className="mb-1 text-2xl">{comparison.emoji}</p>
              <p className="text-sm font-medium text-success">
                Your trend is {lost.toFixed(1)} kg below where you started. That's {comparison.text}!
              </p>
            </div>
          )
        })()}

        <div className="mb-4 rounded-xl bg-card p-4 shadow-sm">
          <p className="mb-2 text-sm font-medium text-text-primary">Show weigh-ins</p>
          <div className="flex gap-1 rounded-lg bg-surface p-0.5" role="radiogroup" aria-label="Show weigh-ins">
            {DISPLAYS.map(d => (
              <button
                key={d.value}
                role="radio"
                aria-checked={display === d.value}
                onClick={() => profile?.id && updateProfile(profile.id, { weight_display: d.value })}
                className={`flex-1 rounded-md py-1.5 text-sm transition-colors ${display === d.value ? 'bg-primary-500 font-medium text-white' : 'text-muted'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">{DISPLAYS.find(d => d.value === display)!.hint}</p>
        </div>

        <button
          onClick={() => navigate('/me/measurements')}
          className="mb-4 flex w-full items-center gap-3 rounded-xl bg-accent-100 p-3 text-left transition-transform active:scale-[0.98]"
        >
          <Ruler className="h-5 w-5 text-accent-700" />
          <div>
            <p className="text-sm font-semibold text-accent-700">Body Measurements</p>
            <p className="text-xs text-accent-700/60">Track neck, chest, waist, and more</p>
          </div>
        </button>

        <form onSubmit={handleSubmit} className="mb-6 rounded-xl bg-card p-4 shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight (kg)"
              aria-label="Weight in kg"
              className="min-w-0 flex-1 rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary focus:border-primary-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!weight || saving}
            className="mt-3 w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            Log Weight
          </button>
        </form>

        {chartData.length > 1 && (
          <div className="mb-6 rounded-xl bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-muted">Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={chartColors.axis} />
                <YAxis domain={[(min: number) => Math.floor(min - 0.5), (max: number) => Math.ceil(max + 0.5)]} allowDecimals={false} tick={{ fontSize: 11 }} stroke={chartColors.axis} />
                <ZAxis range={[18, 18]} />
                <Tooltip />
                {display === 'every' && <Scatter dataKey="weight" name="Weigh-in" fill={chartColors.axis} fillOpacity={0.45} />}
                <Line type="monotone" dataKey="trend" name="Trend" stroke={chartColors.primary} strokeWidth={2.5} dot={false} />
                {profile && (
                  <ReferenceLine
                    y={profile.goal_weight_milestone_kg}
                    stroke={chartColors.secondary}
                    strokeDasharray="5 5"
                    label={{ value: 'Goal', position: 'right', fill: chartColors.secondary, fontSize: 11 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted">{display === 'weekly' ? 'Weekly averages' : 'History'}</h3>
          {display === 'hidden' ? (
            <p className="text-center text-sm text-muted">Weigh-ins are hidden. Only the trend is shown above.</p>
          ) : display === 'weekly' ? (
            <div className="space-y-2">
              {weeklyAverages(entries ?? []).map(w => (
                <div key={w.weekStart} className="flex items-center justify-between rounded-lg bg-card px-4 py-3 shadow-sm">
                  <span className="text-sm text-muted">Week of {format(parseISO(w.weekStart), 'd MMM')} · {w.weighIns} weigh-in{w.weighIns === 1 ? '' : 's'}</span>
                  <span className="font-semibold text-text-primary">{w.average} kg</span>
                </div>
              ))}
            </div>
          ) : entries && entries.length > 0 ? (
            <div className="space-y-2">
              {[...entries].reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg bg-card px-4 py-3 shadow-sm">
                  <span className="text-sm text-muted">
                    {format(parseISO(entry.date), 'EEE, MMM d')}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{entry.value_kg} kg</span>
                    <DeleteEntryButton label={`weigh-in of ${entry.value_kg} kg`} onDelete={() => deleteEntry('weightEntries', entry.id!)} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted">No entries yet. Log your first weight above.</p>
          )}
        </div>
      </PageContainer>
    </>
  )
}
