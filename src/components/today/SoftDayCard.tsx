import { useMemo, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useSessionCompanion, useEffectiveMessages, getCompanionMessage } from '../../hooks/useCompanion'
import { useTodaysMoodScore } from '../../hooks/useMood'
import { useProfile } from '../../hooks/useProfile'
import { useObjectUrl } from '../../hooks/useObjectUrl'
import { getLogicalDate } from '../../lib/date'
import { fadeUp } from '../../lib/animations'
import { traitsOf } from '../../lib/companionPersonality'
import { triggerCompanionMessage } from '../../lib/companionMessenger'
import { LOW_MOOD, isQuietToday, setQuietToday } from '../../lib/softDay'
import BreathingMoment from '../BreathingMoment'

const CLOSED_KEY = 'igb_soft_day_closed'

// After a low mood today (COMPANION-PLAN 11f): your companion offers to
// breathe together for a minute, or to be quiet for the rest of the day.
export default function SoftDayCard() {
  const today = getLogicalDate()
  const mood = useTodaysMoodScore()
  const companion = useSessionCompanion()
  const messages = useEffectiveMessages(companion)
  const { profile } = useProfile()
  const avatar = useObjectUrl(companion?.avatar)
  const [closed, setClosed] = useState(() => {
    try { return localStorage.getItem(CLOSED_KEY) === today } catch { return false }
  })
  const [breathing, setBreathing] = useState(false)
  const [quiet, setQuiet] = useState(() => isQuietToday())
  // Picked once its lines are loaded, so the words don't change while you read them.
  const name = profile?.display_name ?? 'friend'
  const line = useMemo(
    () => (messages ? getCompanionMessage(messages, 'mood_low', name, {}, traitsOf(companion)) : null),
    [messages, name, companion],
  )

  if (mood == null || mood > LOW_MOOD || closed || !companion) return null

  function close() {
    try { localStorage.setItem(CLOSED_KEY, today) } catch { /* fine */ }
    setClosed(true)
  }

  function goQuiet() {
    setQuietToday(true)
    setQuiet(true)
    triggerCompanionMessage('quiet_today_on')
  }

  return (
    <>
      <m.div variants={fadeUp} initial="hidden" animate="visible" className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">
            {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span aria-hidden>🫶</span>}
          </div>
          <p className="text-xs font-medium text-muted">Hard day? {companion.name} is here</p>
        </div>
        {line && <p className="text-text-primary">{line}</p>}
        <div className="mt-3 space-y-2">
          <button onClick={() => setBreathing(true)} className="w-full rounded-lg bg-primary-500 py-2.5 text-sm font-semibold text-white">Breathe with me for a minute</button>
          {quiet ? (
            <p className="py-1 text-center text-sm text-muted">🤫 {companion.name} is quiet for today</p>
          ) : (
            <button onClick={goQuiet} className="w-full rounded-lg bg-surface py-2.5 text-sm font-medium text-text-primary">Be quiet today</button>
          )}
          <button onClick={close} className="w-full py-1.5 text-sm text-muted hover:text-text-primary">I'm okay</button>
        </div>
      </m.div>
      <AnimatePresence>
        {breathing && <BreathingMoment companionName={companion.name} onDone={() => setBreathing(false)} />}
      </AnimatePresence>
    </>
  )
}
