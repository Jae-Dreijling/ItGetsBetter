import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, type Variants } from 'motion/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { useSessionCompanion, getCompanionMessage } from '../hooks/useCompanion'
import { useProfile } from '../hooks/useProfile'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { fadeUp, transitions } from '../lib/animations'
import { onCompanionMoment } from '../lib/companionMessenger'
import { BIG_MOMENTS, readVisits } from '../lib/companionVisits'
import { traitsOf } from '../lib/companionPersonality'
import { isAloneTime } from '../lib/aloneTime'
import { isQuietToday } from '../lib/softDay'
import { groupCheerers, groupCheerCooledDown, markGroupCheer, MAX_SHOWN } from '../lib/groupCheer'
import type { Companion } from '../types'

const SHOW_MS = 4200

// One after another, like a crowd noticing (staggered reactions).
const row: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const bounceIn: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.6 },
  visible: { opacity: 1, y: 0, scale: 1, transition: transitions.springy },
}

// On a big moment, the switched-on companions who aren't on screen cheer too
// (ROADMAP 2.2): a short row of their portraits and one cheer line. Not
// during alone time or a quiet day, and at most once every 20 minutes.
export default function GroupCheer() {
  const companions = useLiveQuery(() => db.companions.toArray())
  const current = useSessionCompanion()
  const { profile } = useProfile()
  const [cheer, setCheer] = useState<{ crowd: Companion[]; line: string; speaker: string; more: number; n: number } | null>(null)
  const latest = useRef({ companions, current, name: profile?.display_name ?? 'friend' })
  useEffect(() => { latest.current = { companions, current, name: profile?.display_name ?? 'friend' } })

  useEffect(() => onCompanionMoment(event => {
    if (!BIG_MOMENTS.has(event) || isAloneTime() || isQuietToday() || !groupCheerCooledDown()) return
    const { companions, current, name } = latest.current
    const onScreen = [current?.id, ...readVisits().map(v => v.companionId)]
    const crowd = groupCheerers(companions ?? [], onScreen)
    if (crowd.length === 0) return
    markGroupCheer()
    const speaker = crowd[Math.floor(Math.random() * crowd.length)]
    // A beat after the companion with you has spoken.
    setTimeout(() => setCheer(c => ({
      crowd: crowd.slice(0, MAX_SHOWN),
      more: Math.max(0, crowd.length - MAX_SHOWN),
      speaker: speaker.name,
      line: getCompanionMessage(speaker.messages, 'cheer', name, {}, traitsOf(speaker)),
      n: (c?.n ?? 0) + 1,
    })), 900)
  }), [])

  useEffect(() => {
    if (!cheer) return
    const t = setTimeout(() => setCheer(null), SHOW_MS)
    return () => clearTimeout(t)
  }, [cheer])

  return (
    <AnimatePresence>
      {cheer && (
        <m.div
          key={cheer.n}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={() => setCheer(null)}
          role="status"
          className="fixed inset-x-4 top-28 z-40 mx-auto max-w-sm rounded-2xl border border-primary-100 bg-card/95 p-3 shadow-lg dark:border-primary-900"
        >
          <m.div variants={row} initial="hidden" animate="visible" className="flex items-center justify-center gap-1.5">
            <span className="text-lg" aria-hidden>🎉</span>
            {cheer.crowd.map(c => <CheerPortrait key={c.id} companion={c} />)}
            {cheer.more > 0 && <span className="text-xs font-medium text-muted">+{cheer.more}</span>}
            <span className="text-lg" aria-hidden>🎉</span>
          </m.div>
          <p className="mt-2 text-center text-xs font-medium leading-relaxed text-text-primary">{cheer.line}</p>
          <p className="mt-0.5 text-center text-[11px] text-muted">— {cheer.speaker} and everyone</p>
        </m.div>
      )}
    </AnimatePresence>
  )
}

function CheerPortrait({ companion }: { companion: Companion }) {
  const avatar = useObjectUrl(companion.avatar)
  return (
    <m.div variants={bounceIn} className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-accent-200 bg-surface dark:border-accent-800">
      {avatar ? <img src={avatar} alt={companion.name} className="h-full w-full object-cover" /> : <span className="text-sm" aria-label={companion.name}>💬</span>}
    </m.div>
  )
}
