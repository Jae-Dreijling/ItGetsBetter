import { useState } from 'react'
import { Plus, Trash2, Play, Pause, Pencil } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import LabelPicker from '../../components/LabelPicker'
import LabelBadge from '../../components/LabelBadge'
import { useActiveHabits, useQueuedHabits, useInactiveHabits, addHabit, updateHabit, activateHabit, deactivateHabit, deleteHabit } from '../../hooks/useHabits'
import { useLabels } from '../../hooks/useLabels'
import type { HabitFrequency, Weekday, Habit, Label } from '../../types'

const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
]

function FrequencyLabel({ habit }: { habit: Habit }) {
  if (habit.frequency === 'custom' && habit.custom_days?.length) {
    const dayLabels: Record<Weekday, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }
    return <span className="text-xs text-muted">{habit.custom_days.map(d => dayLabels[d]).join(', ')}</span>
  }
  return <span className="text-xs text-muted capitalize">{habit.frequency}</span>
}

export default function HabitsPage() {
  const activeHabits = useActiveHabits()
  const queuedHabits = useQueuedHabits()
  const inactiveHabits = useInactiveHabits()
  const labels = useLabels()
  const [showForm, setShowForm] = useState(false)

  const labelsMap = new Map(labels?.map(l => [l.id!, l]))

  return (
    <>
      <TopBar title="Habits" />
      <PageContainer>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'New Habit'}
        </button>

        {showForm && (
          <HabitForm labels={labels ?? []} onSave={() => setShowForm(false)} />
        )}

        {activeHabits && activeHabits.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Active ({activeHabits.length})</h2>
            <div className="space-y-2">
              {activeHabits.map(habit => (
                <HabitItem key={habit.id} habit={habit} labelsMap={labelsMap} allLabels={labels ?? []} status="active" />
              ))}
            </div>
          </div>
        )}

        {queuedHabits && queuedHabits.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Queue ({queuedHabits.length})</h2>
            <p className="mb-2 text-xs text-muted">Waiting to be activated</p>
            <div className="space-y-2">
              {queuedHabits.map(habit => (
                <HabitItem key={habit.id} habit={habit} labelsMap={labelsMap} allLabels={labels ?? []} status="queued" />
              ))}
            </div>
          </div>
        )}

        {inactiveHabits && inactiveHabits.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Paused ({inactiveHabits.length})</h2>
            <div className="space-y-2">
              {inactiveHabits.map(habit => (
                <HabitItem key={habit.id} habit={habit} labelsMap={labelsMap} allLabels={labels ?? []} status="inactive" />
              ))}
            </div>
          </div>
        )}

        {!activeHabits?.length && !queuedHabits?.length && !inactiveHabits?.length && !showForm && (
          <p className="text-center text-sm text-muted py-8">No habits yet. Tap "New Habit" to start.</p>
        )}
      </PageContainer>
    </>
  )
}

function HabitForm({ labels, onSave, initial }: {
  labels: Label[]
  onSave: () => void
  initial?: Habit
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [frequency, setFrequency] = useState<HabitFrequency>(initial?.frequency ?? 'daily')
  const [customDays, setCustomDays] = useState<Weekday[]>(initial?.custom_days ?? [])
  const [selectedLabels, setSelectedLabels] = useState<number[]>(initial?.label_ids ?? [])
  const [isQueued, setIsQueued] = useState(initial?.is_queued ?? false)

  function toggleDay(day: Weekday) {
    setCustomDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    if (frequency === 'custom' && customDays.length === 0) return

    if (initial?.id) {
      await updateHabit(initial.id, {
        title: title.trim(),
        label_ids: selectedLabels,
        frequency,
        custom_days: frequency === 'custom' ? customDays : [],
      })
    } else {
      await addHabit({
        title: title.trim(),
        label_ids: selectedLabels,
        frequency,
        custom_days: frequency === 'custom' ? customDays : [],
        is_queued: isQueued,
      })
    }
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-xl bg-card p-4 shadow-sm">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Habit name"
        className="mb-3 w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
        autoFocus
      />

      <div className="mb-3">
        <p className="mb-1.5 text-xs font-medium text-muted">Frequency</p>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly', 'custom'] as HabitFrequency[]).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-colors ${
                frequency === f ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {frequency === 'custom' && (
        <div className="mb-3">
          <p className="mb-1.5 text-xs font-medium text-muted">Repeat on</p>
          <div className="flex gap-1.5">
            {WEEKDAYS.map((day, i) => (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  customDays.includes(day.key)
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface text-muted hover:bg-primary-100'
                }`}
                title={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}
              >
                {day.label}
              </button>
            ))}
          </div>
          {frequency === 'custom' && customDays.length === 0 && (
            <p className="mt-1 text-xs text-danger">Select at least one day</p>
          )}
        </div>
      )}

      {labels.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-xs font-medium text-muted">Labels</p>
          <LabelPicker labels={labels} selected={selectedLabels} onChange={setSelectedLabels} />
        </div>
      )}

      {!initial && (
        <label className="mb-4 flex items-center gap-2 text-sm text-text-primary cursor-pointer">
          <input
            type="checkbox"
            checked={isQueued}
            onChange={e => setIsQueued(e.target.checked)}
            className="rounded"
          />
          Add to queue (activate later)
        </label>
      )}

      <button
        type="submit"
        disabled={!title.trim() || (frequency === 'custom' && customDays.length === 0)}
        className="w-full rounded-lg bg-secondary-500 py-2.5 font-semibold text-white transition-colors hover:bg-secondary-600 disabled:opacity-50"
      >
        {initial ? 'Save Changes' : isQueued ? 'Add to Queue' : 'Add Habit'}
      </button>
    </form>
  )
}

function HabitItem({ habit, labelsMap, allLabels, status }: {
  habit: Habit
  labelsMap: Map<number, Label>
  allLabels: Label[]
  status: 'active' | 'queued' | 'inactive'
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return <HabitForm labels={allLabels} initial={habit} onSave={() => setEditing(false)} />
  }

  return (
    <div className={`flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm ${status === 'inactive' ? 'opacity-60' : status === 'queued' ? 'opacity-75' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{habit.title}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          <FrequencyLabel habit={habit} />
          {habit.label_ids.map(id => {
            const l = labelsMap.get(id)
            return l ? <LabelBadge key={id} name={l.name} color={l.color} /> : null
          })}
        </div>
      </div>
      <button onClick={() => setEditing(true)} className="p-1.5 text-muted hover:text-primary-500" title="Edit">
        <Pencil className="h-4 w-4" />
      </button>
      {status === 'active' && (
        <button onClick={() => deactivateHabit(habit.id!)} className="p-1.5 text-muted hover:text-warning" title="Pause">
          <Pause className="h-4 w-4" />
        </button>
      )}
      {(status === 'queued' || status === 'inactive') && (
        <button onClick={() => activateHabit(habit.id!)} className="p-1.5 text-muted hover:text-success" title="Activate">
          <Play className="h-4 w-4" />
        </button>
      )}
      <button onClick={() => deleteHabit(habit.id!)} className="p-1.5 text-muted hover:text-danger" title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
