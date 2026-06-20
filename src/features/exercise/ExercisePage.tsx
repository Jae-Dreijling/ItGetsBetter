import { useState } from 'react'
import { format } from 'date-fns'
import { Dumbbell, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useTodaysExercise, useExerciseHistory, useExerciseTypes, addExerciseEntry, deleteExerciseEntry } from '../../hooks/useExercise'
import { getLogicalDate } from '../../lib/date'

const DEFAULT_TYPES = ['Running', 'Walking', 'Weight Lifting', 'Boxing', 'Dancing', 'Swimming', 'Cycling', 'Home Workout']

export default function ExercisePage() {
  const todaysExercise = useTodaysExercise()
  const history = useExerciseHistory(30)
  const savedTypes = useExerciseTypes()
  const [showForm, setShowForm] = useState(false)
  const [exerciseType, setExerciseType] = useState('')
  const [customType, setCustomType] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weightUsed, setWeightUsed] = useState('')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(getLogicalDate())
  const [saving, setSaving] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const allTypes = Array.from(new Set([...DEFAULT_TYPES, ...(savedTypes ?? [])]))
  const selectedType = exerciseType === '__custom' ? customType.trim() : exerciseType

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedType || saving) return
    setSaving(true)
    await addExerciseEntry({
      exercise_type: selectedType,
      sets: sets ? parseInt(sets) : null,
      reps: reps ? parseInt(reps) : null,
      weight_used_kg: weightUsed ? parseFloat(weightUsed) : null,
      duration_minutes: duration ? parseInt(duration) : null,
      distance_km: distance ? parseFloat(distance) : null,
      notes: notes.trim() || null,
      date,
    })
    setExerciseType('')
    setCustomType('')
    setSets('')
    setReps('')
    setWeightUsed('')
    setDuration('')
    setDistance('')
    setNotes('')
    setShowDetails(false)
    setSaving(false)
    setShowForm(false)
  }

  const todayCount = todaysExercise?.length ?? 0

  return (
    <>
      <TopBar title="Exercise" />
      <PageContainer>
        <div className="mb-4 rounded-xl bg-card p-4 shadow-sm text-center">
          <Dumbbell className="mx-auto mb-2 h-8 w-8 text-primary-400" />
          <p className="text-2xl font-bold text-text-primary">
            {todayCount} {todayCount === 1 ? 'session' : 'sessions'}
          </p>
          <p className="text-sm text-muted">today</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
        >
          {showForm ? 'Cancel' : 'Log Exercise'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-xl bg-card p-4 shadow-sm">
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-medium text-muted">Type</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {allTypes.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setExerciseType(t); setCustomType('') }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      exerciseType === t
                        ? 'bg-primary-500 text-white'
                        : 'bg-surface text-muted hover:bg-primary-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setExerciseType('__custom')}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    exerciseType === '__custom'
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface text-muted hover:bg-primary-100'
                  }`}
                >
                  Other...
                </button>
              </div>
              {exerciseType === '__custom' && (
                <input
                  type="text"
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  placeholder="Exercise name"
                  className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                  autoFocus
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="mb-3 flex items-center gap-1 text-xs text-primary-500 font-medium"
            >
              {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showDetails ? 'Hide details' : 'Add details (optional)'}
            </button>

            {showDetails && (
              <div className="mb-3 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted">Sets</label>
                    <input
                      type="number"
                      value={sets}
                      onChange={e => setSets(e.target.value)}
                      placeholder="—"
                      min="1"
                      className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted">Reps</label>
                    <input
                      type="number"
                      value={reps}
                      onChange={e => setReps(e.target.value)}
                      placeholder="—"
                      min="1"
                      className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={weightUsed}
                      onChange={e => setWeightUsed(e.target.value)}
                      placeholder="—"
                      min="0"
                      className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted">Duration (min)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      placeholder="—"
                      min="1"
                      className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={distance}
                      onChange={e => setDistance(e.target.value)}
                      placeholder="—"
                      min="0"
                      className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="How did it go?"
                    className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary focus:border-primary-400 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!selectedType || saving}
              className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              Log Exercise
            </button>
          </form>
        )}

        {todaysExercise && todaysExercise.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Today</h3>
            <div className="space-y-2">
              {todaysExercise.map(entry => (
                <ExerciseCard key={entry.id} entry={entry} onDelete={() => deleteExerciseEntry(entry.id!)} />
              ))}
            </div>
          </div>
        )}

        {history && history.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">History</h3>
            <div className="space-y-2">
              {history.filter(e => e.date !== getLogicalDate()).map(entry => (
                <ExerciseCard key={entry.id} entry={entry} onDelete={() => deleteExerciseEntry(entry.id!)} />
              ))}
            </div>
          </div>
        )}

        {!todaysExercise?.length && !history?.length && !showForm && (
          <p className="text-center text-sm text-muted py-8">No exercise logged yet. Tap "Log Exercise" to start.</p>
        )}
      </PageContainer>
    </>
  )
}

function ExerciseCard({ entry, onDelete }: { entry: { id?: number; date: string; exercise_type: string; sets: number | null; reps: number | null; weight_used_kg: number | null; duration_minutes: number | null; distance_km: number | null; notes: string | null; logged_at: string }; onDelete: () => void }) {
  const details: string[] = []
  if (entry.sets && entry.reps) details.push(`${entry.sets}×${entry.reps}`)
  else if (entry.sets) details.push(`${entry.sets} sets`)
  else if (entry.reps) details.push(`${entry.reps} reps`)
  if (entry.weight_used_kg) details.push(`${entry.weight_used_kg}kg`)
  if (entry.duration_minutes) details.push(`${entry.duration_minutes}min`)
  if (entry.distance_km) details.push(`${entry.distance_km}km`)

  return (
    <div className="flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm">
      <Dumbbell className="h-5 w-5 shrink-0 text-primary-400" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{entry.exercise_type}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted">
            {format(new Date(entry.date), 'EEE, MMM d')}
          </span>
          {details.length > 0 && (
            <span className="text-xs text-muted">· {details.join(' · ')}</span>
          )}
        </div>
        {entry.notes && (
          <p className="mt-0.5 text-xs text-muted italic">{entry.notes}</p>
        )}
      </div>
      <button onClick={onDelete} className="p-1 text-muted hover:text-danger">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
