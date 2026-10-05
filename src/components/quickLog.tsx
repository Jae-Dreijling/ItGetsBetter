import { useState } from 'react'
import { m } from 'motion/react'
import { fadeUp } from '../lib/animations'
import { MOOD_COLORS, MOOD_LABELS } from '../lib/mood'
import { useLatestWeight, addWeightEntry } from '../hooks/useWeightEntries'
import { addSleepEntry } from '../hooks/useSleep'
import { addMoodEntry } from '../hooks/useMood'
import { addWaterEntry } from '../hooks/useWater'

// One- or two-tap logging, shared by the Daily Check and the Today spotlight
// cards. onLogged runs before the entry is saved (see DailyCheckCard).

// Background and text colour are left to the caller, so a selected chip can
// swap them without two conflicting Tailwind classes.
export const chip = 'rounded-xl px-3 py-2.5 text-sm font-semibold transition-transform duration-100 active:scale-95'
export const chipIdle = 'bg-surface text-text-primary'
export const primaryButton = 'rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-transform duration-100 active:scale-95 disabled:opacity-40'

export function QuickWeight({ onLogged }: { onLogged?: () => Promise<void> }) {
  const latest = useLatestWeight()
  const [value, setValue] = useState('')
  const kg = parseFloat(value.replace(',', '.'))
  const valid = kg >= 30 && kg <= 300

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    const answered = onLogged?.()
    await addWeightEntry(kg)
    await answered
  }

  return (
    <form onSubmit={save} className="flex gap-2">
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={latest ? `${latest.value_kg}` : 'kg'}
        aria-label="Weight in kg"
        className="min-w-0 flex-1 rounded-xl border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
      />
      <button type="submit" disabled={!valid} className={primaryButton}>Save</button>
    </form>
  )
}

const SLEEP_HOURS = [{ label: '≤5h', hours: 5 }, { label: '6h', hours: 6 }, { label: '7h', hours: 7 }, { label: '8h', hours: 8 }, { label: '9h+', hours: 9 }]
const SLEEP_QUALITY = [{ label: '😫', value: 1 }, { label: '😕', value: 2 }, { label: '😐', value: 3 }, { label: '🙂', value: 4 }, { label: '😄', value: 5 }]

// Two taps: hours, then how it felt. Saves as soon as both are picked.
export function QuickSleep({ onLogged }: { onLogged?: () => Promise<void> }) {
  const [hours, setHours] = useState<number | null>(null)

  async function pickQuality(quality: number) {
    if (hours === null) return
    const answered = onLogged?.()
    await addSleepEntry({ hours_slept: hours, quality_rating: quality, wake_feeling: null })
    await answered
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5" role="group" aria-label="Hours slept">
        {SLEEP_HOURS.map(h => (
          <button
            key={h.label}
            onClick={() => setHours(h.hours)}
            aria-pressed={hours === h.hours}
            className={`${chip} flex-1 ${hours === h.hours ? 'bg-primary-500 text-white' : chipIdle}`}
          >
            {h.label}
          </button>
        ))}
      </div>
      {hours !== null && (
        <m.div variants={fadeUp} initial="hidden" animate="visible" className="flex gap-1.5" role="group" aria-label="How it felt">
          {SLEEP_QUALITY.map(q => (
            <button key={q.value} onClick={() => pickQuality(q.value)} aria-label={`Sleep quality ${q.value} of 5`} className={`${chip} ${chipIdle} flex-1 text-xl`}>
              {q.label}
            </button>
          ))}
        </m.div>
      )}
    </div>
  )
}

export function QuickMood({ onLogged }: { onLogged?: () => Promise<void> }) {
  async function pick(score: number) {
    const answered = onLogged?.()
    await addMoodEntry(score, [])
    await answered
  }

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(score => (
        <button
          key={score}
          onClick={() => pick(score)}
          className={`${chip} flex-1 px-1 text-xs text-white`}
          style={{ backgroundColor: MOOD_COLORS[score] }}
        >
          {MOOD_LABELS[score]}
        </button>
      ))}
    </div>
  )
}

export function QuickWater({ onLogged }: { onLogged?: () => Promise<void> }) {
  async function add(ml: number) {
    const answered = onLogged?.()
    await addWaterEntry(ml)
    await answered
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => add(250)} className={`${chip} ${chipIdle} flex-1`}>+ Glass (250 ml)</button>
      <button onClick={() => add(500)} className={`${chip} ${chipIdle} flex-1`}>+ Bottle (500 ml)</button>
    </div>
  )
}
