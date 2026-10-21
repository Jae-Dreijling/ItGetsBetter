import { useState } from 'react'
import { format, parseISO, addDays } from 'date-fns'
import Sheet from '../../components/Sheet'
import { useLastNonScaleCheck, saveNonScaleCheck } from '../../hooks/useNonScale'
import { getLogicalDate } from '../../lib/date'
import { NON_SCALE_ITEMS, CHECK_EVERY_DAYS, isCheckDue, summary, type NonScaleAnswer } from '../../lib/nonScale'

// "Beyond the scale": a monthly check-in next to the weight trend (step 9c).
export default function BeyondScale() {
  const last = useLastNonScaleCheck()
  const [open, setOpen] = useState(false)
  if (last === undefined) return null

  const due = isCheckDue(last?.date ?? null, getLogicalDate())
  const lastSummary = last ? summary(last.answers) : null

  return (
    <div className={`mb-4 rounded-xl p-4 shadow-sm ${due ? 'bg-secondary-100 dark:bg-secondary-900/30' : 'bg-card'}`}>
      <p className="text-sm font-medium text-text-primary">🌟 Beyond the scale</p>
      {last ? (
        <p className="mt-1 text-xs text-muted">
          Last time ({format(parseISO(last.date), 'd MMM')}): {lastSummary ?? 'about the same'}{last.note ? ` · ${last.note}` : ''}
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted">Energy, clothes, sleep, cravings: the changes a scale doesn't show. Once a month, a minute.</p>
      )}
      <button
        onClick={() => setOpen(true)}
        className={`mt-3 w-full rounded-lg py-2 text-sm font-medium ${due ? 'bg-secondary-500 text-white' : 'bg-surface text-text-primary'}`}
      >
        {due ? 'Time for a check-in' : `Check in (next one around ${format(addDays(parseISO(last!.date), CHECK_EVERY_DAYS), 'd MMM')})`}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Beyond the scale">
        <CheckIn onDone={() => setOpen(false)} />
      </Sheet>
    </div>
  )
}

function CheckIn({ onDone }: { onDone: () => void }) {
  const [answers, setAnswers] = useState<Record<string, NonScaleAnswer>>({})
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState<string | null>(null)

  function pick(key: string, answer: NonScaleAnswer) {
    setAnswers(prev => {
      const next = { ...prev }
      if (next[key] === answer) delete next[key]
      else next[key] = answer
      return next
    })
  }

  async function save() {
    await saveNonScaleCheck(answers, note)
    const better = summary(answers)
    setSaved(better ? `Into your wins jar: ${better}.` : 'Thanks for checking in. Steady is good too.')
  }

  if (saved) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-4xl" aria-hidden>🌟</p>
        <p className="text-text-primary">{saved}</p>
        <button onClick={onDone} className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white">Done</button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Compared to a month ago. Skip anything that doesn't apply.</p>
      {NON_SCALE_ITEMS.map(item => (
        <div key={item.key} className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>{item.emoji}</span>
          <span className="min-w-0 flex-1 text-sm text-text-primary">{item.label}</span>
          {(['better', 'same'] as NonScaleAnswer[]).map(answer => (
            <button
              key={answer}
              onClick={() => pick(item.key, answer)}
              aria-pressed={answers[item.key] === answer}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                answers[item.key] === answer ? 'bg-primary-500 text-white' : 'bg-surface text-muted'
              }`}
            >
              {answer === 'better' ? 'Better' : 'Same'}
            </button>
          ))}
        </div>
      ))}
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Anything else that feels easier? (optional)"
        rows={2}
        className="w-full rounded-lg border border-primary-100 bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none dark:border-primary-900"
      />
      <button onClick={save} className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white">Save check-in</button>
    </div>
  )
}
