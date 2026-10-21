import { useState } from 'react'
import { m } from 'motion/react'
import { useSessionCompanion, useEffectiveMessages, getCompanionMessage } from '../../hooks/useCompanion'
import { useProfile } from '../../hooks/useProfile'
import { useObjectUrl } from '../../hooks/useObjectUrl'
import { awardPoints } from '../../hooks/usePoints'
import { getLogicalDate } from '../../lib/date'
import { fadeUp } from '../../lib/animations'
import { traitsOf } from '../../lib/companionPersonality'
import { changeCloseness } from '../../lib/closeness'
import { REQUESTS, REQUEST_CLOSENESS, REQUEST_POINTS, hashSeed } from '../../lib/companionFun'
import { isQuietToday } from '../../lib/softDay'

const DONE_KEY = 'igb_companion_request'

// About half the days, between late morning and evening, the companion asks
// for one tiny thing (COMPANION-PLAN 11h). Doing it earns a few points and
// some closeness; "not now" costs nothing.
export default function CompanionRequestCard() {
  const today = getLogicalDate()
  const hour = new Date().getHours()
  const companion = useSessionCompanion()
  const messages = useEffectiveMessages(companion)
  const { profile } = useProfile()
  const avatar = useObjectUrl(companion?.avatar)
  const [done, setDone] = useState(() => {
    try { return localStorage.getItem(DONE_KEY) === today } catch { return false }
  })
  const [thanks, setThanks] = useState<string | null>(null)

  if (!companion?.id) return null
  const seed = Math.abs(hashSeed(`request:${today}:${companion.id}`))
  const asks = seed % 2 === 0 && hour >= 11 && hour < 20 && !isQuietToday()
  if (!thanks && (done || !asks)) return null
  const request = REQUESTS[seed % REQUESTS.length]

  function close() {
    try { localStorage.setItem(DONE_KEY, today) } catch { /* fine */ }
    setDone(true)
  }

  async function didIt() {
    close()
    await awardPoints('companion_request')
    await changeCloseness(companion!.id!, REQUEST_CLOSENESS)
    setThanks(getCompanionMessage(messages, 'request_done', profile?.display_name ?? 'friend', {}, traitsOf(companion)))
  }

  return (
    <m.div variants={fadeUp} initial="hidden" animate="visible" className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span aria-hidden>🙋</span>}
        </div>
        <p className="text-xs font-medium text-muted">A small request from {companion.name}</p>
      </div>
      {thanks ? (
        <>
          <p className="text-text-primary">{thanks}</p>
          <p className="mt-1 text-xs font-medium text-primary-500">+{REQUEST_POINTS} points · 💗 a little closer</p>
          <button onClick={() => setThanks(null)} className="mt-3 w-full rounded-lg bg-surface py-2 text-sm font-medium text-text-primary">OK</button>
        </>
      ) : (
        <>
          <p className="text-text-primary">{request}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={didIt} className="flex-1 rounded-lg bg-primary-500 py-2.5 text-sm font-semibold text-white">Done! 💪</button>
            <button onClick={close} className="flex-1 rounded-lg bg-surface py-2.5 text-sm font-medium text-text-primary">Not now</button>
          </div>
        </>
      )}
    </m.div>
  )
}
