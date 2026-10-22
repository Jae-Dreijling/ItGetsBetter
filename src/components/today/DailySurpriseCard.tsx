import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useEffectiveMessages, getCompanionMessage } from '../../hooks/useCompanion'
import { useCompanionTurn } from '../../hooks/useCompanionTurn'
import { markTurn } from '../../lib/companionTurns'
import type { Companion } from '../../types'
import { useProfile } from '../../hooks/useProfile'
import { useObjectUrl } from '../../hooks/useObjectUrl'
import { receiveGift } from '../../hooks/useCompanionFun'
import { getLogicalDate } from '../../lib/date'
import { fadeUp, pop } from '../../lib/animations'
import { traitsOf, allows } from '../../lib/companionPersonality'
import { changeCloseness } from '../../lib/closeness'
import { surpriseFor, surpriseKinds, hashSeed } from '../../lib/companionFun'

// A small surprise from a companion (COMPANION-PLAN 11h): a fortune, a fun
// fact, a "would you rather", a compliment or a tiny gift for the gift safe.
// Each companion brings one on its own clock, every 2 or 3 days
// (lib/companionTurns).
export default function DailySurpriseCard() {
  const today = getLogicalDate()
  const turn = useCompanionTurn('surprise', 'surprises', today)
  // Once opened, it stays this companion's surprise until you close it.
  const [held, setHeld] = useState<Companion | null>(null)
  const companion = held ?? turn ?? undefined
  const messages = useEffectiveMessages(companion)
  const { profile } = useProfile()
  const avatar = useObjectUrl(companion?.avatar)
  const [open, setOpen] = useState(false)
  const [reply, setReply] = useState<string | null>(null)

  if (!companion?.id) return null
  const traits = traitsOf(companion)
  const surprise = surpriseFor(hashSeed(`${today}:${companion.id}`), surpriseKinds(traits, allows(companion, 'gifts'), companion.surprises), traits.romantic > 0, companion.surprises)
  const name = profile?.display_name ?? 'friend'

  async function reveal() {
    setHeld(companion!)
    setOpen(true)
    // The turn is used on opening, so a gift can't be handed out twice.
    markTurn(companion!.id!, 'surprise', today)
    if (surprise.kind === 'gift') {
      await receiveGift(companion!, surprise.gift)
      setReply(getCompanionMessage(messages, 'gift_for_you', name, { gift: `${surprise.gift.emoji} ${surprise.gift.name}` }, traitsOf(companion)))
    }
  }

  async function choose(option: string, mine: string) {
    await changeCloseness(companion!.id!, 1)
    setReply(option === mine ? `Same! We'd ${mine} together.` : `Ooh, good one. I'd ${mine}, but I get it!`)
  }

  function finish() {
    setHeld(null)
    setOpen(false)
    setReply(null)
  }

  return (
    <m.div variants={fadeUp} initial="hidden" animate="visible" className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span aria-hidden>🎁</span>}
        </div>
        <p className="text-xs font-medium text-muted">🎁 {companion.name} has a little surprise for you</p>
      </div>
      <AnimatePresence mode="wait">
        {!open ? (
          <m.button key="closed" exit={{ opacity: 0 }} onClick={reveal} className="w-full rounded-lg bg-primary-500 py-2.5 text-sm font-semibold text-white">
            Open it
          </m.button>
        ) : (
          <m.div key="open" variants={pop} initial="hidden" animate="visible" className="space-y-3">
            {surprise.kind === 'fortune' && <p className="text-text-primary">🥠 “{surprise.text}”</p>}
            {surprise.kind === 'fact' && <p className="text-text-primary">💡 {surprise.text}</p>}
            {surprise.kind === 'compliment' && <p className="text-text-primary">💛 {surprise.text}</p>}
            {surprise.kind === 'gift' && (
              <div className="text-center">
                <p className="text-5xl" aria-hidden>{surprise.gift.emoji}</p>
                <p className="mt-1 text-sm text-muted">{surprise.gift.name}, now in your gift safe</p>
              </div>
            )}
            {surprise.kind === 'would_you_rather' && !reply && (
              <>
                <p className="text-text-primary">Would you rather…</p>
                {surprise.options.map((o, i) => (
                  <button key={o} onClick={() => choose(o, surprise.options[(hashSeed(today) & 1) === 0 ? 0 : 1])} className="w-full rounded-lg bg-surface px-3 py-2.5 text-left text-sm text-text-primary">
                    {i === 0 ? '🅰️' : '🅱️'} {o}
                  </button>
                ))}
              </>
            )}
            {reply && <p className="text-sm text-text-primary">{reply}</p>}
            {(surprise.kind !== 'would_you_rather' || reply) && (
              <button onClick={finish} className="w-full rounded-lg bg-surface py-2 text-sm font-medium text-text-primary">Thank you, {companion.name}</button>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  )
}
