import { useState } from 'react'
import { format } from 'date-fns'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useLatestMeasurement, useMeasurements, addMeasurement } from '../../hooks/useMeasurements'
import { getLogicalDate } from '../../lib/date'

const FIELDS = [
  { key: 'neck_cm', label: 'Neck' },
  { key: 'chest_cm', label: 'Chest' },
  { key: 'hips_cm', label: 'Hips' },
  { key: 'waist_cm', label: 'Waist' },
  { key: 'arms_cm', label: 'Arms' },
  { key: 'thighs_cm', label: 'Thighs' },
  { key: 'ankles_cm', label: 'Ankles' },
  { key: 'wrists_cm', label: 'Wrists' },
] as const

type FieldKey = typeof FIELDS[number]['key']

export default function MeasurementsPage() {
  const latest = useLatestMeasurement()
  const history = useMeasurements()
  const [values, setValues] = useState<Record<string, string>>({})
  const [date, setDate] = useState(getLogicalDate())
  const [saving, setSaving] = useState(false)

  function updateField(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const hasAnyValue = Object.values(values).some((v) => v.trim() !== '')
    if (!hasAnyValue || saving) return

    setSaving(true)
    const data: Record<string, number | null | string> = { date }
    for (const field of FIELDS) {
      const val = values[field.key]?.trim()
      data[field.key] = val ? parseFloat(val) : null
    }
    await addMeasurement(data as Parameters<typeof addMeasurement>[0])
    setValues({})
    setSaving(false)
  }

  const hasAnyValue = Object.values(values).some((v) => v.trim() !== '')

  return (
    <>
      <TopBar title="Measurements" />
      <PageContainer>
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl bg-card p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {FIELDS.map((field) => {
              const lastVal = latest?.[field.key as FieldKey]
              return (
                <div key={field.key}>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={values[field.key] ?? ''}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={lastVal ? `Last: ${lastVal} cm` : 'cm'}
                    className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted/60 focus:border-primary-400 focus:outline-none"
                  />
                </div>
              )
            })}
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mb-3 w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary focus:border-primary-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!hasAnyValue || saving}
            className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            Save Measurements
          </button>
        </form>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted">History</h3>
          {history && history.length > 0 ? (
            <div className="space-y-2">
              {history.map((entry) => {
                const recorded = FIELDS.filter((f) => entry[f.key as FieldKey] !== null)
                return (
                  <div key={entry.id} className="rounded-lg bg-card px-4 py-3 shadow-sm">
                    <p className="mb-1 text-sm font-medium text-text-primary">
                      {format(new Date(entry.date), 'EEE, MMM d, yyyy')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recorded.map((f) => (
                        <span key={f.key} className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
                          {f.label}: {entry[f.key as FieldKey]} cm
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-muted">No measurements yet.</p>
          )}
        </div>
      </PageContainer>
    </>
  )
}
