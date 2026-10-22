import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Activity, Feather, Repeat, SlidersHorizontal, Trash2 } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import LabelPicker from '../../components/LabelPicker'
import Sheet from '../../components/Sheet'
import { useHabit, updateHabit, activateHabit, deactivateHabit, deleteHabit } from '../../hooks/useHabits'
import { useLabels } from '../../hooks/useLabels'
import { formatProgressionValue } from '../../lib/progression'
import DetailRow from './DetailRow'
import { HabitForm } from './HabitsPage'
import type { Habit, HabitFrequency, Weekday } from '../../types'

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Days' },
]
const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'M' }, { key: 'tue', label: 'T' }, { key: 'wed', label: 'W' }, { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' }, { key: 'sat', label: 'S' }, { key: 'sun', label: 'S' },
]

export default function HabitDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const habit = useHabit(Number(id))

  return (
    <>
      <TopBar title="Habit" onBack={() => navigate(-1)} />
      <PageContainer>
        {habit === undefined ? null : habit === null ? (
          <p className="py-8 text-center text-sm text-muted">This habit doesn't exist anymore.</p>
        ) : (
          <HabitDetails key={habit.id} habit={habit} onDeleted={() => navigate('/todo', { replace: true })} />
        )}
      </PageContainer>
    </>
  )
}

function HabitDetails({ habit, onDeleted }: { habit: Habit; onDeleted: () => void }) {
  const labels = useLabels() ?? []
  const [title, setTitle] = useState(habit.title)
  const [cantFail, setCantFail] = useState(habit.cant_fail_description ?? '')
  const [moreOpen, setMoreOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = (changes: Parameters<typeof updateHabit>[1]) => updateHabit(habit.id!, changes)
  const prog = habit.progression?.enabled ? habit.progression : null

  function chooseFrequency(frequency: HabitFrequency) {
    // "Days" starts from today's weekday, so it's never an empty schedule.
    const today = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as Weekday[])[new Date().getDay()]
    set({ frequency, custom_days: frequency === 'custom' ? (habit.custom_days.length ? habit.custom_days : [today]) : [] })
  }

  function toggleDay(day: Weekday) {
    const days = habit.custom_days.includes(day) ? habit.custom_days.filter(d => d !== day) : [...habit.custom_days, day]
    if (days.length > 0) set({ custom_days: days })
  }

  async function remove() {
    if (!confirmDelete) return setConfirmDelete(true)
    await deleteHabit(habit.id!)
    onDeleted()
  }

  const status = habit.is_active ? 'active' : habit.is_queued ? 'queued' : 'paused'

  return (
    <div>
      <div className="mb-4">
        <LabelPicker labels={labels} selected={habit.label_ids} onChange={ids => set({ label_ids: ids })} />
      </div>

      <textarea
        value={title}
        onChange={e => setTitle(e.target.value.replace(/\n/g, ''))}
        onBlur={() => title.trim() && title.trim() !== habit.title && set({ title: title.trim() })}
        rows={1}
        aria-label="Title"
        className="field-sizing-content mb-2 w-full resize-none bg-transparent text-xl font-semibold text-text-primary focus:outline-none"
      />

      <div className="border-t border-primary-100 dark:border-primary-900">
        <DetailRow
          icon={Repeat}
          label="How often"
          below={
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {FREQUENCIES.map(f => (
                  <button
                    key={f.value}
                    onClick={() => chooseFrequency(f.value)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${habit.frequency === f.value ? 'bg-primary-500 text-white' : 'bg-surface text-muted'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {habit.frequency === 'custom' && (
                <div className="flex gap-1.5">
                  {WEEKDAYS.map(d => (
                    <button
                      key={d.key}
                      onClick={() => toggleDay(d.key)}
                      aria-pressed={habit.custom_days.includes(d.key)}
                      aria-label={d.key}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${habit.custom_days.includes(d.key) ? 'bg-primary-500 text-white' : 'bg-surface text-muted'}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        />

        <DetailRow
          icon={Feather}
          label="Can't-fail version"
          below={
            <input
              value={cantFail}
              onChange={e => setCantFail(e.target.value)}
              onBlur={() => cantFail.trim() !== (habit.cant_fail_description ?? '') && set({ cant_fail_description: cantFail.trim() || null })}
              placeholder="e.g. 10 minutes instead of 30"
              className="w-full rounded-lg bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:outline-none"
            />
          }
        />

        <DetailRow icon={Activity} label="Status">
          <div className="flex gap-1 rounded-lg bg-surface p-0.5">
            <button
              onClick={() => status !== 'active' && activateHabit(habit.id!)}
              className={`rounded-md px-3 py-1 text-sm ${status === 'active' ? 'bg-primary-500 text-white' : 'text-muted'}`}
            >
              Active
            </button>
            <button
              onClick={() => status === 'active' && deactivateHabit(habit.id!)}
              className={`rounded-md px-3 py-1 text-sm ${status !== 'active' ? 'bg-primary-500 text-white' : 'text-muted'}`}
            >
              {status === 'queued' ? 'Queued' : 'Paused'}
            </button>
          </div>
        </DetailRow>

        <DetailRow icon={SlidersHorizontal} label="Progression">
          <button onClick={() => setMoreOpen(true)} className="rounded-lg bg-surface px-3 py-1.5 text-sm text-text-primary">
            {prog ? formatProgressionValue(prog.current_value, prog.unit) : 'Off'}
          </button>
        </DetailRow>
      </div>

      <button onClick={remove} className="mt-6 flex w-full items-center justify-center gap-1.5 py-2 text-sm text-muted hover:text-danger">
        <Trash2 className="h-4 w-4" />
        {confirmDelete ? 'Tap again to delete (its history goes too)' : 'Delete habit'}
      </button>

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More settings">
        <HabitForm labels={labels} initial={habit} onSave={() => setMoreOpen(false)} />
      </Sheet>
    </div>
  )
}
