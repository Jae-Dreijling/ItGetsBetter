import { useState } from 'react'
import { m } from 'motion/react'
import { useEffectiveMessages, getCompanionMessage } from '../../hooks/useCompanion'
import { useCompanionTurn } from '../../hooks/useCompanionTurn'
import { markTurn } from '../../lib/companionTurns'
import type { Companion } from '../../types'
import { useProfile } from '../../hooks/useProfile'
import { useObjectUrl } from '../../hooks/useObjectUrl'
import { awardPoints } from '../../hooks/usePoints'
import { getLogicalDate } from '../../lib/date'
import { fadeUp } from '../../lib/animations'
import { traitsOf } from '../../lib/companionPersonality'
import { changeCloseness } from '../../lib/closeness'
import { REQUESTS, REQUEST_CLOSENESS, REQUEST_POINTS, hashSeed } from '../../lib/companionFun'
import { isQuietToday } from '../../lib/softDay'

// Between late morning and evening, a companion asks for one tiny thing
// (COMPANION-PLAN 11h), each on its own clock, every 2 or 3 days
// (lib/companionTurns). Doing it earns a few points and some closeness;
// "not now" costs nothing.
export default function CompanionRequestCard() {
  const today = getLogicalDate()
  const hour = new Date().getHours()
  const turn = useCompanionTurn('request', 'requests', today)
  // Who asked stays on the card while its thanks shows.
  const [held, setHeld] = useState<Companion | null>(null)
  const companion = held ?? turn ?? undefined
  const messages = useEffectiveMessages(companion)
  const { profile } = useProfile()
  const avatar = useObjectUrl(companion?.avatar)
  const [thanks, setThanks] = useState<string | null>(null)

  if (!companion?.id) return null
  if (!thanks && (hour < 11 || hour >= 20 || isQuietToday())) return null
  const seed = Math.abs(hashSeed(`request:${today}:${companion.id}`))
  const request = REQUESTS[seed % REQUESTS.length]

  function close() {
    markTurn(companion!.id!, 'request', today)
  }

  async function didIt() {
    setHeld(companion!)
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
          <button onClick={() => { setThanks(null); setHeld(null) }} className="mt-3 w-full rounded-lg bg-surface py-2 text-sm font-medium text-text-primary">OK</button>
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
