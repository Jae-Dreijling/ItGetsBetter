import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { AnimatePresence, m, useMotionValue } from 'motion/react'
import { db } from '../db'
import { useSessionCompanion, useEffectiveMessages, getCompanionMessage, type CompanionEvent } from '../hooks/useCompanion'
import { useProfile } from '../hooks/useProfile'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { useIsPhoneFreeTime } from '../hooks/useSchedule'
import { fadeUp, pop } from '../lib/animations'
import { traitsOf, isCalmPlace } from '../lib/companionPersonality'
import { changeCloseness } from '../lib/closeness'
import { onCompanionMoment, askMainCompanion, msSinceLastMoment } from '../lib/companionMessenger'
import {
  readVisit, startVisit, endVisit, markKnock, knockCooledDown, visitsOff, pickVisitor,
  BIG_MOMENTS, CHECK_EVERY_MS, ACCEPT_CLOSENESS, type Visit,
} from '../lib/companionVisits'
import type { TriggerValues } from '../lib/companionTriggers'
import type { Companion } from '../types'

const SIZE = 48

// Another companion knocking, and visiting for a while when you let it in
// (COMPANION-PLAN 11e). Lives next to the floating companion in the shell.
export default function CompanionVisits() {
  const location = useLocation()
  const current = useSessionCompanion()
  const companions = useLiveQuery(() => db.companions.toArray())
  const bonds = useLiveQuery(() => db.gameCompanionAffinity.toArray())
  const isPhoneFreeTime = useIsPhoneFreeTime()
  const { profile } = useProfile()
  const name = profile?.display_name ?? 'friend'
  const [visit, setVisit] = useState<Visit | null>(readVisit)
  const [knock, setKnock] = useState<{ companion: Companion; line: string; declined: boolean } | null>(null)
  const [greeting, setGreeting] = useState<string | null>(null)

  // Everything the check needs, read when it runs.
  const latest = useRef({ current, companions, bonds, isPhoneFreeTime, path: location.pathname, visit, knock, name })
  useEffect(() => {
    latest.current = { current, companions, bonds, isPhoneFreeTime, path: location.pathname, visit, knock, name }
  })

  useEffect(() => {
    function check() {
      const s = latest.current
      if (s.visit || s.knock || !s.companions || !s.current || visitsOff() || !knockCooledDown()) return
      if (s.isPhoneFreeTime || isCalmPlace(s.path) || document.visibilityState !== 'visible') return
      const others = s.companions.filter(c => c.id !== s.current!.id)
      const id = pickVisitor(others.map(c => ({ id: c.id!, affinity: s.bonds?.find(b => b.companion_id === c.id)?.affinity ?? null })), Math.random)
      const companion = others.find(c => c.id === id)
      if (!companion) return
      markKnock()
      setKnock({ companion, declined: false, line: getCompanionMessage(companion.messages, 'visit_knock', s.name, {}, traitsOf(companion)) })
    }
    const first = setTimeout(check, 25_000)
    const every = setInterval(check, CHECK_EVERY_MS)
    return () => { clearTimeout(first); clearInterval(every) }
  }, [])

  async function accept() {
    if (!knock) return
    const v = startVisit(knock.companion.id!)
    await changeCloseness(knock.companion.id!, ACCEPT_CLOSENESS)
    setGreeting(getCompanionMessage(knock.companion.messages, 'visit_accepted', name, {}, traitsOf(knock.companion)))
    setKnock(null)
    setVisit(v)
  }

  function decline() {
    if (!knock) return
    setKnock({ ...knock, declined: true, line: getCompanionMessage(knock.companion.messages, 'visit_declined', name, {}, traitsOf(knock.companion)) })
    setTimeout(() => setKnock(null), 2800)
  }

  const visitor = visit ? companions?.find(c => c.id === visit.companionId) : undefined

  return (
    <>
      <AnimatePresence>
        {knock && <KnockCard key="knock" knock={knock} onAccept={accept} onDecline={decline} />}
      </AnimatePresence>
      {visit && visitor && visitor.id !== current?.id && (
        <Visitor
          visitor={visitor}
          mainName={current?.name ?? 'your companion'}
          until={visit.until}
          greeting={greeting}
          onLeft={() => { endVisit(); setVisit(null); setGreeting(null) }}
        />
      )}
    </>
  )
}

function KnockCard({ knock, onAccept, onDecline }: {
  knock: { companion: Companion; line: string; declined: boolean }
  onAccept: () => void
  onDecline: () => void
}) {
  const avatar = useObjectUrl(knock.companion.avatar)
  return (
    <m.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-x-4 bottom-20 z-40 rounded-2xl border border-primary-100 bg-card p-4 shadow-lg dark:border-primary-900"
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span aria-hidden>🚪</span>}
        </div>
        <p className="text-xs font-medium text-muted">{knock.declined ? knock.companion.name : `🚪 Knock knock! ${knock.companion.name} would like to visit`}</p>
      </div>
      <p className="text-sm text-text-primary">{knock.line}</p>
      {!knock.declined && (
        <div className="mt-3 flex gap-2">
          <button onClick={onAccept} className="flex-1 rounded-lg bg-primary-500 py-2 text-sm font-semibold text-white">Let {knock.companion.name} in</button>
          <button onClick={onDecline} className="flex-1 rounded-lg bg-surface py-2 text-sm font-medium text-text-primary">Not now</button>
        </div>
      )}
    </m.div>
  )
}

// The visitor: a second, simpler companion on screen. It cheers on big
// moments, chats now and then (sometimes with your companion) and says
// goodbye when its visit is over.
function Visitor({ visitor, mainName, until, greeting, onLeft }: {
  visitor: Companion
  mainName: string
  until: number
  greeting: string | null
  onLeft: () => void
}) {
  const messages = useEffectiveMessages(visitor)
  const avatar = useObjectUrl(visitor.avatar)
  const { profile } = useProfile()
  const [line, setLine] = useState<string | null>(greeting)
  const x = useMotionValue(12)
  const y = useMotionValue(window.innerHeight - 260)
  const [spot, setSpot] = useState({ x: 12, y: window.innerHeight - 260 })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ref = useRef({ messages, name: profile?.display_name ?? 'friend', mainName, onLeft })
  useEffect(() => { ref.current = { messages, name: profile?.display_name ?? 'friend', mainName, onLeft } })

  const say = useCallback((event: CompanionEvent, values?: TriggerValues, ms = 5000) => {
    setLine(getCompanionMessage(ref.current.messages, event, ref.current.name, values, traitsOf(visitor)))
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setLine(null), ms)
  }, [visitor])

  // The greeting fades like any other line.
  useEffect(() => {
    if (!greeting) return
    const t = setTimeout(() => setLine(null), 5000)
    return () => clearTimeout(t)
  }, [greeting])

  // Joins in on big moments, a beat after your companion.
  useEffect(() => onCompanionMoment(event => {
    if (BIG_MOMENTS.has(event)) setTimeout(() => say('cheer'), 1300)
  }), [say])

  // Now and then: a bit of banter with your companion, or just a word.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    function schedule() {
      t = setTimeout(() => {
        if (document.visibilityState === 'visible' && msSinceLastMoment() > 8000) {
          if (Math.random() < 0.6) {
            say('banter', { other: ref.current.mainName })
            setTimeout(() => askMainCompanion('banter_reply', { other: visitor.name }), 2800)
          } else {
            say('idle')
          }
        }
        schedule()
      }, 180_000 + Math.random() * 180_000)
    }
    schedule()
    return () => clearTimeout(t)
  }, [say, visitor.name])

  // Time to go: a goodbye, then gone.
  useEffect(() => {
    const t = setTimeout(() => {
      say('visit_leaving', undefined, 4500)
      setTimeout(() => ref.current.onLeft(), 4500)
    }, Math.max(0, until - Date.now()))
    return () => clearTimeout(t)
  }, [until, say])

  const bubbleOnLeft = spot.x > window.innerWidth / 2

  return (
    <>
      <AnimatePresence mode="wait">
        {line && (
          <m.div
            key={line}
            variants={pop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setLine(null)}
            className="fixed z-50 max-w-[60vw] rounded-2xl border border-primary-100 bg-card p-3 shadow-lg dark:border-primary-900"
            style={{ ...(bubbleOnLeft ? { right: window.innerWidth - spot.x + 8 } : { left: spot.x + SIZE + 8 }), top: spot.y - 10 }}
          >
            <p className="text-xs font-medium leading-relaxed text-text-primary">{line}</p>
            <p className="mt-1 text-[11px] text-muted">— {visitor.name} (visiting)</p>
          </m.div>
        )}
      </AnimatePresence>
      <m.div
        className="fixed left-0 top-0 z-50 flex touch-none select-none items-center justify-center overflow-hidden rounded-full border-2 border-accent-200 bg-card shadow-lg dark:border-accent-800"
        style={{ x, y, width: SIZE, height: SIZE }}
        initial={{ scale: 0 }}
        animate={{ scale: line ? 1 : 0.8 }}
        drag
        dragMomentum={false}
        dragConstraints={{ left: 0, right: window.innerWidth - SIZE, top: 56, bottom: window.innerHeight - 120 }}
        onDragEnd={() => setSpot({ x: x.get(), y: y.get() })}
        onTap={() => say('general')}
        aria-label={`${visitor.name} is visiting`}
      >
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span aria-hidden>🧳</span>}
      </m.div>
    </>
  )
}
