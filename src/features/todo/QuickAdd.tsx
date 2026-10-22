import { useState } from 'react'
import { addTask } from '../../hooks/useTasks'
import { addHabit } from '../../hooks/useHabits'
import { useLabels } from '../../hooks/useLabels'
import { getLogicalDate } from '../../lib/date'
import { shiftDate } from '../../lib/mealPlan'
import LabelPicker from '../../components/LabelPicker'
import type { HabitFrequency } from '../../types'

type Kind = 'task' | 'habit'
type Due = 'none' | 'today' | 'tomorrow' | 'pick'

const inputClass = 'w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none dark:border-primary-900'

function Choice<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1.5">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
            value === v ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// One sheet to add a task or a habit straight from the Plan tab. Only the
// title is needed; everything else can be set later on the item's page.
export default function QuickAdd({ kinds, initialKind, labelId, onAdded }: {
  kinds: Kind[]
  initialKind: Kind
  // The label chip that's selected on the list, so the new item shows up there.
  labelId: number | null
  onAdded: () => void
}) {
  const [kind, setKind] = useState<Kind>(kinds.includes(initialKind) ? initialKind : kinds[0])
  const [title, setTitle] = useState('')
  const [due, setDue] = useState<Due>('none')
  const [pickedDate, setPickedDate] = useState(getLogicalDate())
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  // "Later" puts the habit in the queue, to take on once another one settles.
  const [when, setWhen] = useState<'now' | 'later'>('now')
  const [labelIds, setLabelIds] = useState<number[]>(labelId !== null ? [labelId] : [])
  const labels = useLabels() ?? []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const today = getLogicalDate()
    if (kind === 'task') {
      const dueDate = due === 'today' ? today : due === 'tomorrow' ? shiftDate(today, 1) : due === 'pick' ? pickedDate : null
      await addTask({ title: title.trim(), due_date: dueDate, label_ids: labelIds })
    } else {
      await addHabit({
        title: title.trim(),
        label_ids: labelIds,
        frequency,
        custom_days: [],
        cant_fail_description: null,
        progression: null,
        is_queued: when === 'later',
      })
    }
    onAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {kinds.length > 1 && (
        <Choice value={kind} options={[['task', 'Task'], ['habit', 'Habit']]} onChange={setKind} />
      )}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder={kind === 'task' ? 'What needs doing?' : 'New habit'}
        className={inputClass}
        autoFocus
        enterKeyHint="done"
      />

      {kind === 'task' ? (
        <div className="space-y-2">
          <Choice value={due} options={[['none', 'No date'], ['today', 'Today'], ['tomorrow', 'Tomorrow'], ['pick', 'Pick…']]} onChange={setDue} />
          {due === 'pick' && (
            <input type="date" value={pickedDate} onChange={e => setPickedDate(e.target.value)} className={inputClass} />
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Choice value={frequency} options={[['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']]} onChange={setFrequency} />
          <Choice value={when} options={[['now', 'Start now'], ['later', 'Later (queue)']]} onChange={setWhen} />
        </div>
      )}

      <LabelPicker labels={labels} selected={labelIds} onChange={setLabelIds} />

      <button
        type="submit"
        disabled={!title.trim()}
        className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
      >
        {kind === 'habit' && when === 'later' ? 'Add to the queue' : `Add ${kind}`}
      </button>
    </form>
  )
}
