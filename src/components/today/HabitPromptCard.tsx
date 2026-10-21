import { useState } from 'react'
import { useObjectUrl } from '../../hooks/useObjectUrl'
import { useNavigate } from 'react-router'
import { m } from 'motion/react'
import { useHabitPrompt, answerSettled, snoozeHabitPrompt, markHabitBuilt } from '../../hooks/useHabitBuildUp'
import { useSessionCompanion, useEffectiveMessages } from '../../hooks/useCompanion'
import { useFeatureTiers } from '../../hooks/useFeatures'
import { useProfile } from '../../hooks/useProfile'
import { isOn } from '../../lib/features'
import { getLogicalDate } from '../../lib/date'
import { fadeUp } from '../../lib/animations'
import { DEFAULT_PROMPT_LINES, SNOOZE_BUILT_DAYS, SNOOZE_SETTLED_DAYS, fillLine } from '../../lib/habitBuildUp'

const primary = 'w-full rounded-lg bg-primary-500 py-2.5 text-sm font-semibold text-white'
const secondary = 'w-full rounded-lg bg-surface py-2.5 text-sm font-medium text-text-primary'
const quiet = 'w-full py-1.5 text-sm text-muted hover:text-text-primary'

// A stable pick for the day, so the line doesn't change on every render.
function pickLine(lines: string[], seed: string): string {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return lines[Math.abs(hash) % lines.length]
}

// The companion asks about building habits up (lib/habitBuildUp): take on
// another one once a habit has settled, or stop tracking one that's built.
export default function HabitPromptCard() {
  const navigate = useNavigate()
  const tiers = useFeatureTiers()
  const state = useHabitPrompt()
  const companion = useSessionCompanion()
  const messages = useEffectiveMessages(companion)
  const { profile } = useProfile()
  // Shown after answering, until you close it.
  const [answer, setAnswer] = useState<string | null>(null)
  const avatar = useObjectUrl(companion?.avatar)

  if (!isOn(tiers, 'habits')) return null
  if (!answer && !state?.prompt) return null

  const speaker = (
    <div className="mb-2 flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span aria-hidden>💬</span>}
      </div>
      <p className="text-xs font-medium text-muted">{companion?.name ?? 'Your companion'}</p>
    </div>
  )

  if (answer) {
    return (
      <m.div variants={fadeUp} initial="hidden" animate="visible" className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
        {speaker}
        <p className="text-text-primary">{answer}</p>
        <button onClick={() => setAnswer(null)} className={`mt-3 ${secondary}`}>OK</button>
      </m.div>
    )
  }

  const { prompt, queue } = state!
  const { habit, kind, score } = prompt!
  const own = messages?.[kind === 'settled' ? 'habit_settled' : 'habit_built']
  const lines = own?.length ? own : DEFAULT_PROMPT_LINES[kind]
  const line = fillLine(pickLine(lines, `${getLogicalDate()}:${habit.id}:${kind}`), {
    name: profile?.display_name ?? 'friend', habit: habit.title, done: score.done, total: score.total,
  })

  async function takeOn(pickedId: number, title: string) {
    await answerSettled(habit.id!, pickedId)
    setAnswer(`“${title}” is on your list now. One step at a time, and I'm right here.`)
  }

  async function chooseMyself() {
    await answerSettled(habit.id!, null)
    navigate('/todo/habits/manage')
  }

  async function built() {
    await markHabitBuilt(habit)
    setAnswer(`“${habit.title}” is with your built habits now. A win for the jar! If it ever slips, you can call it back from there.`)
  }

  return (
    <m.div variants={fadeUp} initial="hidden" animate="visible" className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      {speaker}
      <p className="text-text-primary">{line}</p>
      <div className="mt-3 space-y-2">
        {kind === 'settled' ? (
          <>
            {queue.slice(0, 2).map(h => (
              <button key={h.id} onClick={() => takeOn(h.id!, h.title)} className={primary}>➕ {h.title}</button>
            ))}
            <button onClick={chooseMyself} className={secondary}>
              {queue.length ? 'Choose a habit myself' : 'Make a new habit'}
            </button>
            <button onClick={() => snoozeHabitPrompt(habit.id!, SNOOZE_SETTLED_DAYS)} className={quiet}>Not yet</button>
          </>
        ) : (
          <>
            <button onClick={built} className={primary}>Yes, it's mine now</button>
            <button onClick={() => snoozeHabitPrompt(habit.id!, SNOOZE_BUILT_DAYS)} className={quiet}>Keep tracking it</button>
          </>
        )}
      </div>
    </m.div>
  )
}
