import { useState } from 'react'
import { useNavigate } from 'react-router'
import { format } from 'date-fns'
import { Ruler } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile } from '../../hooks/useProfile'
import { useWeightEntries, useLatestWeight, addWeightEntry } from '../../hooks/useWeightEntries'
import { getLogicalDate } from '../../lib/date'

export default function WeightPage() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const entries = useWeightEntries()
  const latest = useLatestWeight()
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(getLogicalDate())
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!weight || saving) return
    setSaving(true)
    const isBackfill = date !== getLogicalDate()
    await addWeightEntry(parseFloat(weight), date, isBackfill)
    setWeight('')
    setSaving(false)
  }

  const bmi = latest && profile
    ? (latest.value_kg / ((profile.height_cm / 100) ** 2)).toFixed(1)
    : null

  const chartData = entries?.map((e) => ({
    date: format(new Date(e.date), 'MMM d'),
    weight: e.value_kg,
  }))

  return (
    <>
      <TopBar title="Weight" />
      <PageContainer>
        {profile && latest && (
          <div className="mb-4 flex gap-3">
            <div className="flex-1 rounded-xl bg-card p-3 shadow-sm text-center">
              <p className="text-xs text-muted">Current</p>
              <p className="text-lg font-bold text-text-primary">{latest.value_kg} kg</p>
            </div>
            <div className="flex-1 rounded-xl bg-card p-3 shadow-sm text-center">
              <p className="text-xs text-muted">Goal</p>
              <p className="text-lg font-bold text-secondary-500">{profile.goal_weight_milestone_kg} kg</p>
            </div>
            {bmi && (
              <div className="flex-1 rounded-xl bg-card p-3 shadow-sm text-center">
                <p className="text-xs text-muted">BMI</p>
                <p className="text-lg font-bold text-text-primary">{bmi}</p>
              </div>
            )}
          </div>
        )}

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
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight (kg)"
              min="30"
              max="300"
              className="flex-1 rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
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

        {chartData && chartData.length > 1 && (
          <div className="mb-6 rounded-xl bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-muted">Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e6df" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#8c7a6e" />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11 }} stroke="#8c7a6e" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#f47e6c"
                  strokeWidth={2}
                  dot={{ fill: '#f47e6c', r: 4 }}
                />
                {profile && (
                  <ReferenceLine
                    y={profile.goal_weight_milestone_kg}
                    stroke="#4eb499"
                    strokeDasharray="5 5"
                    label={{ value: 'Goal', position: 'right', fill: '#4eb499', fontSize: 11 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted">History</h3>
          {entries && entries.length > 0 ? (
            <div className="space-y-2">
              {[...entries].reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg bg-card px-4 py-3 shadow-sm">
                  <span className="text-sm text-muted">
                    {format(new Date(entry.date), 'EEE, MMM d')}
                  </span>
                  <span className="font-semibold text-text-primary">{entry.value_kg} kg</span>
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
