import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, m } from 'motion/react'
import { Check } from 'lucide-react'
import { fadeUp } from '../lib/animations'
import type { CheckKind } from '../lib/dailyCheck'
import { useDailyCheck, addWin } from '../hooks/useDailyCheck'
import { QuickWeight, QuickSleep, QuickMood, QuickWater, primaryButton } from './quickLog'

const QUESTIONS: Record<CheckKind, { emoji: string; question: string; hint: string }> = {
  weight: { emoji: '⚖️', question: 'Quick weigh-in?', hint: 'One number. The trend matters, not today.' },
  sleep: { emoji: '😴', question: 'How did you sleep?', hint: 'Roughly is fine.' },
  mood: { emoji: '🙂', question: "How's your mood?", hint: 'Any answer is a good answer.' },
  water: { emoji: '💧', question: 'Had some water today?', hint: 'Add a glass or a bottle.' },
  measurements: { emoji: '📏', question: 'Time for a monthly measurement?', hint: 'Takes about a minute.' },
  photo: { emoji: '📸', question: 'Progress photo this month?', hint: 'Just for you. It stays on this phone.' },
  win: { emoji: '🌱', question: 'Anything feel easier lately?', hint: 'Stairs, clothes, energy, mood... small counts.' },
}

// Today's one tracking question (step 3 of the 2.0 plan). Answering takes one
// or two taps; "Not today" always works and costs nothing.
// After answering, the thank-you shows for a minute and then disappears.
const DONE_MESSAGE_MS = 60 * 1000

export default function DailyCheckCard() {
  const { kind, status, answeredAt, markAnswered, dismiss } = useDailyCheck()
  const [doneExpired, setDoneExpired] = useState(false)

  useEffect(() => {
    if (status !== 'answered' || answeredAt === null) return
    const timer = setTimeout(() => setDoneExpired(true), Math.max(0, answeredAt + DONE_MESSAGE_MS - Date.now()))
    return () => clearTimeout(timer)
  }, [status, answeredAt])

  if (!kind || !status || status === 'dismissed') return null
  // Logged elsewhere (no answeredAt) or the minute is over: nothing to show.
  if (status === 'answered' && (answeredAt === null || doneExpired)) return null
  const q = QUESTIONS[kind]

  return (
    <AnimatePresence mode="wait">
      {status === 'answered' ? (
        <m.div
          key="done"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-4 flex items-center gap-2 rounded-2xl bg-secondary-50 px-4 py-3 text-sm font-medium text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300"
        >
          <Check className="h-4 w-4" />
          Today's check is done. Thank you!
        </m.div>
      ) : (
        <m.section
          key="ask"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          aria-label="Daily check"
          className="mb-4 rounded-2xl bg-card p-4 shadow-sm"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Today's check</p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">
            <span aria-hidden className="mr-1.5">{q.emoji}</span>
            {q.question}
          </h2>
          <p className="text-sm text-muted">{q.hint}</p>

          <div className="mt-3">
            <Answer kind={kind} onAnswered={markAnswered} />
          </div>

          <button onClick={dismiss} className="mt-3 text-sm font-medium text-muted">
            Not today
          </button>
        </m.section>
      )}
    </AnimatePresence>
  )
}

// Each answer marks the check as answered first (that state update happens
// synchronously), then saves the entry, so the card goes straight to "done".
function Answer({ kind, onAnswered }: { kind: CheckKind; onAnswered: () => Promise<void> }) {
  switch (kind) {
    case 'weight': return <QuickWeight onLogged={onAnswered} />
    case 'sleep': return <QuickSleep onLogged={onAnswered} />
    case 'mood': return <QuickMood onLogged={onAnswered} />
    case 'water': return <QuickWater onLogged={onAnswered} />
    case 'measurements': return <OpenPageAnswer label="Measure now" path="/me/measurements" />
    case 'photo': return <OpenPageAnswer label="Take a photo" path="/me/photos" />
    case 'win': return <WinAnswer onAnswered={onAnswered} />
  }
}

// Measurements and photos have their own pages; the check counts as done as
// soon as one is saved there today.
function OpenPageAnswer({ label, path }: { label: string; path: string }) {
  const navigate = useNavigate()
  return <button onClick={() => navigate(path)} className={primaryButton}>{label}</button>
}

function WinAnswer({ onAnswered }: { onAnswered: () => Promise<void> }) {
  const [text, setText] = useState('')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    const answered = onAnswered()
    await addWin(text)
    await answered
  }

  return (
    <form onSubmit={save} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="e.g. walked up the stairs easily"
        aria-label="Your win"
        className="min-w-0 flex-1 rounded-xl border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
      />
      <button type="submit" disabled={!text.trim()} className={primaryButton}>Save</button>
    </form>
  )
}
