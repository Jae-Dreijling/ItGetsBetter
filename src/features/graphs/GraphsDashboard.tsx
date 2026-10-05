import { useChartColors } from '../../hooks/useChartColors'
import { useState } from 'react'
import { format } from 'date-fns'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile } from '../../hooks/useProfile'
import {
  type TimeRange,
  useWeightGraphData,
  useMealScoreGraphData,
  useWaterGraphData,
  useMoodGraphData,
  useSleepGraphData,
  useExerciseGraphData,
  useHabitGraphData,
  useMeasurementGraphData,
} from '../../hooks/useGraphData'

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1w', label: '1W' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'All' },
]

function formatDate(date: string) {
  return format(new Date(date + 'T12:00:00'), 'MMM d')
}

export default function GraphsDashboard() {
  const chartColors = useChartColors()
  const [range, setRange] = useState<TimeRange>('1m')
  const { profile } = useProfile()
  const weight = useWeightGraphData(range)
  const meals = useMealScoreGraphData(range)
  const water = useWaterGraphData(range)
  const mood = useMoodGraphData(range)
  const sleep = useSleepGraphData(range)
  const exercise = useExerciseGraphData(range)
  const habits = useHabitGraphData(range)
  const measurements = useMeasurementGraphData(range)

  return (
    <>
      <TopBar title="Graphs" />
      <PageContainer>
        <div className="mb-5 flex gap-1 rounded-xl bg-card p-1 shadow-sm">
          {TIME_RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                range === r.value ? 'bg-primary-500 text-white' : 'text-muted hover:bg-surface'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {weight && weight.length > 1 && (
          <ChartCard title="Weight">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weight.map(d => ({ ...d, d: formatDate(d.date) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke={chartColors.primary} strokeWidth={1.5} dot={{ r: 2 }} name="Weight" />
                <Line type="monotone" dataKey="smoothed" stroke={chartColors.primaryStrong} strokeWidth={2.5} dot={false} name="Trend" />
                {profile && (
                  <ReferenceLine y={profile.goal_weight_milestone_kg} stroke={chartColors.secondary} strokeDasharray="5 5" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {meals && meals.length > 1 && (
          <ChartCard title="Meal Health Score">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={meals.map(d => ({ ...d, d: formatDate(d.date) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke={chartColors.primary} strokeWidth={2} dot={{ r: 2 }} name="Avg Score" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {water && water.length > 1 && (
          <ChartCard title="Water Intake">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={water.map(d => ({ ...d, d: formatDate(d.date) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <YAxis tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <Tooltip />
                <Bar dataKey="liters" fill={chartColors.secondary} radius={[4, 4, 0, 0]} name="Liters" />
                <ReferenceLine y={2} stroke={chartColors.secondaryStrong} strokeDasharray="5 5" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {mood && mood.length > 1 && (
          <ChartCard title="Mood">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={mood.map(d => ({ ...d, d: formatDate(d.date) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke={chartColors.accent} strokeWidth={2} dot={{ r: 2 }} name="Mood" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {sleep && sleep.length > 1 && (
          <ChartCard title="Sleep">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={sleep.map(d => ({ ...d, d: formatDate(d.date) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <YAxis tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke={chartColors.accent} strokeWidth={2} dot={{ r: 2 }} name="Hours" />
                <Line type="monotone" dataKey="quality" stroke={chartColors.secondary} strokeWidth={1.5} dot={{ r: 2 }} name="Quality" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {exercise && exercise.length > 1 && (
          <ChartCard title="Exercise (per week)">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={exercise.map(d => ({ ...d, d: formatDate(d.week) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <YAxis tick={{ fontSize: 10 }} stroke={chartColors.axis} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="sessions" fill={chartColors.primary} radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {habits && habits.length > 1 && (
          <ChartCard title="Habit Completion %">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={habits.map(d => ({ ...d, d: formatDate(d.date) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <Tooltip />
                <Line type="monotone" dataKey="percent" stroke={chartColors.success} strokeWidth={2} dot={{ r: 2 }} name="%" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {measurements && measurements.length > 1 && (
          <ChartCard title="Body Measurements">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={measurements.map(d => ({ ...d, d: formatDate(d.date) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <YAxis tick={{ fontSize: 10 }} stroke={chartColors.axis} />
                <Tooltip />
                {measurements.some(d => d.waist) && <Line type="monotone" dataKey="waist" stroke={chartColors.primary} strokeWidth={2} dot={{ r: 2 }} name="Waist" />}
                {measurements.some(d => d.chest) && <Line type="monotone" dataKey="chest" stroke={chartColors.secondary} strokeWidth={2} dot={{ r: 2 }} name="Chest" />}
                {measurements.some(d => d.hips) && <Line type="monotone" dataKey="hips" stroke={chartColors.accent} strokeWidth={2} dot={{ r: 2 }} name="Hips" />}
                {measurements.some(d => d.arms) && <Line type="monotone" dataKey="arms" stroke={chartColors.primaryStrong} strokeWidth={2} dot={{ r: 2 }} name="Arms" />}
                {measurements.some(d => d.thighs) && <Line type="monotone" dataKey="thighs" stroke={chartColors.secondaryStrong} strokeWidth={2} dot={{ r: 2 }} name="Thighs" />}
                {measurements.some(d => d.neck) && <Line type="monotone" dataKey="neck" stroke={chartColors.accentStrong} strokeWidth={1.5} dot={{ r: 2 }} name="Neck" />}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {(!weight?.length && !meals?.length && !water?.length && !mood?.length && !sleep?.length) && (
          <p className="text-center text-sm text-muted py-8">
            Not enough data yet. Keep logging and check back soon!
          </p>
        )}
      </PageContainer>
    </>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-muted">{title}</h3>
      {children}
    </div>
  )
}
