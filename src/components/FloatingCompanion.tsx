import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, animate, m, useMotionValue, useReducedMotion } from 'motion/react'
import { pop, transitions } from '../lib/animations'
import { nextDelay, pickMove } from '../lib/companionMotion'
import { useSessionCompanion, useEffectiveMessages, getCompanionMessage, ensureDefaultCompanion, type CompanionEvent } from '../hooks/useCompanion'
import { useProfile } from '../hooks/useProfile'
import CompanionChat from './CompanionChat'
import { tryGetMotivationMessage } from '../hooks/useMotivationNotes'
import { useLatestMoodScore } from '../hooks/useMood'
import { useIsPhoneFreeTime, useIsGoodnightTime } from '../hooks/useSchedule'
import { useCompanionAffinityFor } from '../hooks/useGame'
import { getDataAwareNudge } from '../lib/companionNudges'
import { registerCompanionMessageHandler } from '../lib/companionMessenger'
import type { TriggerValues } from '../lib/companionTriggers'
import { startIdleTimer } from '../lib/idleTimer'

const POSITION_KEY = 'igb_companion_position'
const SIZE = 56
// A finger rarely stays perfectly still: movement under this many pixels
// still counts as a tap, so a slightly wobbly tap isn't swallowed by a drag.
const TAP_SLOP = 10
const LONG_PRESS_MS = 500

function clampToScreen(p: { x: number; y: number }) {
  return {
    x: Math.max(0, Math.min(window.innerWidth - SIZE, p.x)),
    y: Math.max(56, Math.min(window.innerHeight - 120, p.y)),
  }
}

function screenBounds() {
  return { left: 0, right: window.innerWidth - SIZE, top: 56, bottom: window.innerHeight - 120 }
}
// Size while it's quiet; it grows to full size to talk or be dragged.
const IDLE_SCALE = 0.5
// It doesn't wander within this long after a scroll, tap or key press.
const QUIET_BEFORE_MOVING = 4000

// "Idle" means the user stepped away: no touch, scroll or typing anywhere.
const IDLE_TIMEOUT = 2 * 60 * 1000
// During phone-free time the companion nudges regardless of activity.
const PHONE_FREE_NUDGE_INTERVAL = 60 * 1000

export default function FloatingCompanion() {
  const companion = useSessionCompanion()
  const effectiveMessages = useEffectiveMessages(companion)
  const affinity = useCompanionAffinityFor(companion?.id)
  const { profile } = useProfile()
  const latestMoodScore = useLatestMoodScore()
  const isPhoneFreeTime = useIsPhoneFreeTime()
  const isGoodnightTime = useIsGoodnightTime()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  // Resting position, used to place the speech bubble. While dragging, the
  // companion moves through the x/y motion values only, outside React, so a
  // drag doesn't re-render this component on every frame.
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem(POSITION_KEY)
    if (saved) return clampToScreen(JSON.parse(saved) as { x: number; y: number })
    return { x: window.innerWidth - 70, y: window.innerHeight - 200 }
  })
  const x = useMotionValue(position.x)
  const y = useMotionValue(position.y)
  const [dragging, setDragging] = useState(false)
  const [bounds, setBounds] = useState(screenBounds)
  const [chatOpen, setChatOpen] = useState(false)
  const pressStart = useRef<{ x: number; y: number } | null>(null)
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasLongPress = useRef(false)
  const name = profile?.display_name ?? 'friend'
  // Each companion has its own way of moving around.
  const movement = companion?.movement ?? 'calm'
  const reduceMotion = useReducedMotion()
  const lastActivity = useRef(0)
  // Talking, being dragged or chatting: no wandering then.
  const busyRef = useRef(false)
  useEffect(() => { busyRef.current = !!message || dragging || chatOpen }, [message, dragging, chatOpen])

  // Kept in refs (rather than useCallback deps) so showMessage/handleIdle
  // never change identity when this reactive data updates — otherwise the
  // effect that starts the idle timer would re-run and restart the countdown.
  const messagesRef = useRef(effectiveMessages)
  const nameRef = useRef(name)
  const moodScoreRef = useRef(latestMoodScore)
  const isPhoneFreeTimeRef = useRef(isPhoneFreeTime)
  const isGoodnightTimeRef = useRef(isGoodnightTime)
  const affinityRef = useRef(affinity)
  useEffect(() => { messagesRef.current = effectiveMessages }, [effectiveMessages])
  useEffect(() => { nameRef.current = name }, [name])
  useEffect(() => { moodScoreRef.current = latestMoodScore }, [latestMoodScore])
  useEffect(() => { isPhoneFreeTimeRef.current = isPhoneFreeTime }, [isPhoneFreeTime])
  useEffect(() => { isGoodnightTimeRef.current = isGoodnightTime }, [isGoodnightTime])
  useEffect(() => { affinityRef.current = affinity }, [affinity])

  useEffect(() => {
    ensureDefaultCompanion()
  }, [])

  useEffect(() => {
    if (companion?.avatar) {
      const url = URL.createObjectURL(companion.avatar)
      setAvatarUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setAvatarUrl(null)
    }
  }, [companion?.avatar])

  const showMessage = useCallback((event: CompanionEvent, values?: TriggerValues) => {
    const msg = getCompanionMessage(messagesRef.current, event, nameRef.current, values)
    setMessage(msg)
    if (messageTimer.current) clearTimeout(messageTimer.current)
    messageTimer.current = setTimeout(() => setMessage(null), 5000)
  }, [])

  const showRawText = useCallback((text: string, durationMs = 7000) => {
    setMessage(text)
    if (messageTimer.current) clearTimeout(messageTimer.current)
    messageTimer.current = setTimeout(() => setMessage(null), durationMs)
  }, [])

  useEffect(() => {
    registerCompanionMessageHandler(showMessage)
    return () => registerCompanionMessageHandler(null)
  }, [showMessage])

  const handleIdle = useCallback(async () => {
    // Phone-free time has its own repeating nudge (below) and takes over completely.
    if (isPhoneFreeTimeRef.current) return

    // Very late at night (1 to 4 AM), now and then a gentle word.
    const hour = new Date().getHours()
    if (hour >= 1 && hour < 4 && Math.random() < 0.4) {
      showMessage('late_night')
      return
    }

    // One-time wind-down nudge in the 30 minutes before phone-free kicks in.
    if (isGoodnightTimeRef.current && Math.random() < 0.6) {
      showMessage('goodnight')
      return
    }

    if (Math.random() < 0.2) {
      const motMsg = await tryGetMotivationMessage()
      if (motMsg) {
        showRawText(`💭 "${motMsg}"`)
        return
      }
    }

    if (Math.random() < 0.2) {
      const nudge = await getDataAwareNudge(nameRef.current)
      if (nudge) {
        showRawText(nudge)
        return
      }
    }

    const moodIsLow = moodScoreRef.current !== null && moodScoreRef.current !== undefined && moodScoreRef.current <= 3
    if (moodIsLow && Math.random() < 0.7) {
      showMessage('mood_low')
      return
    }

    // Affinity bleeding into the home screen: a Lover with high affinity
    // occasionally shows one of their Lover Messages instead of plain idle text.
    const currentAffinity = affinityRef.current
    if (currentAffinity?.is_lover && currentAffinity.affinity >= 60 && currentAffinity.lover_dialogue.length > 0 && Math.random() < 0.3) {
      const line = currentAffinity.lover_dialogue[Math.floor(Math.random() * currentAffinity.lover_dialogue.length)]
      showRawText(line.replace('{name}', nameRef.current), 5000)
      return
    }

    showMessage('idle')
  }, [showMessage, showRawText])

  useEffect(() => {
    function handleResize() {
      const next = clampToScreen({ x: x.get(), y: y.get() })
      x.set(next.x)
      y.set(next.y)
      setPosition(next)
      setBounds(screenBounds())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [x, y])

  useEffect(() => {
    const timer = startIdleTimer({ timeoutMs: IDLE_TIMEOUT, onIdle: () => void handleIdle() })
    return () => timer.stop()
  }, [handleIdle])

  // Phone-free time: the point is to put the phone down, so the nudge repeats
  // while the app is open, whatever the user is doing.
  useEffect(() => {
    if (!isPhoneFreeTime) return
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') showMessage('phone_free')
    }, PHONE_FREE_NUDGE_INTERVAL)
    return () => clearInterval(interval)
  }, [isPhoneFreeTime, showMessage])

  // Remember when the user last did something, so wandering never happens
  // under a finger or while reading a scrolling page.
  useEffect(() => {
    const mark = () => { lastActivity.current = Date.now() }
    const events = ['pointerdown', 'keydown', 'scroll', 'input'] as const
    for (const e of events) window.addEventListener(e, mark, { capture: true, passive: true })
    return () => { for (const e of events) window.removeEventListener(e, mark, { capture: true }) }
  }, [])

  // Idle wandering: a small move after a random wait (see lib/companionMotion).
  useEffect(() => {
    if (movement === 'still' || reduceMotion) return
    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    function schedule(ms: number | null) {
      if (ms !== null && !cancelled) timer = setTimeout(() => void wander(), ms)
    }

    async function wander() {
      const quiet = Date.now() - lastActivity.current > QUIET_BEFORE_MOVING
      if (document.visibilityState !== 'visible' || busyRef.current || !quiet) {
        schedule(5000 + Math.random() * 5000)
        return
      }
      const move = pickMove({ x: x.get(), y: y.get() }, screenBounds(), SIZE, Math.random)
      const walk = { type: 'tween', duration: 0.9, ease: 'easeInOut' } as const
      if (move.type === 'drift') {
        await animate(y, move.y, walk)
      } else if (move.type === 'peek') {
        const home = x.get()
        await animate(x, move.x, { type: 'tween', duration: 0.5, ease: 'easeOut' })
        await animate(x, home, { type: 'tween', duration: 0.6, ease: 'easeInOut', delay: 0.8 })
      } else {
        await animate(x, move.exitX, walk)
        x.set(move.enterX)
        await animate(x, move.endX, walk)
      }
      if (cancelled) return
      const next = clampToScreen({ x: x.get(), y: y.get() })
      setPosition(next)
      localStorage.setItem(POSITION_KEY, JSON.stringify(next))
      schedule(nextDelay(movement, Math.random()))
    }

    schedule(nextDelay(movement, Math.random()))
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [movement, reduceMotion, x, y])

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // Taps and long presses are detected from the pointer itself; Motion only
  // handles the dragging. A press that moved less than TAP_SLOP is a tap.
  function handlePointerDown(e: React.PointerEvent) {
    pressStart.current = { x: e.clientX, y: e.clientY }
    wasLongPress.current = false
    cancelLongPress()
    longPressTimer.current = setTimeout(() => {
      wasLongPress.current = true
      setChatOpen(true)
    }, LONG_PRESS_MS)
  }

  function movedBeyondSlop(e: React.PointerEvent) {
    const start = pressStart.current
    return !start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > TAP_SLOP
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (pressStart.current && movedBeyondSlop(e)) cancelLongPress()
  }

  function handlePointerUp(e: React.PointerEvent) {
    cancelLongPress()
    const isTap = !movedBeyondSlop(e) && !wasLongPress.current
    pressStart.current = null
    if (isTap) showMessage('general')
  }

  // Called once the companion has come to rest, after any momentum glide.
  function handleDragSettled() {
    const next = clampToScreen({ x: x.get(), y: y.get() })
    setPosition(next)
    setDragging(false)
    localStorage.setItem(POSITION_KEY, JSON.stringify(next))
  }

  if (chatOpen) {
    return <CompanionChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
  }

  const iconCenter = position.x + 28
  const bubbleOnLeft = iconCenter > window.innerWidth / 2

  return (
    <>
      <AnimatePresence mode="wait">
      {message && !dragging && (
        <m.div
          key={message}
          variants={pop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed z-50 rounded-2xl bg-card p-3 shadow-lg border border-primary-100 dark:border-primary-900"
          style={{
            ...(bubbleOnLeft
              ? { right: window.innerWidth - position.x + 8, maxWidth: position.x - 16 }
              : { left: position.x + 62, maxWidth: window.innerWidth - position.x - 70 }),
            top: position.y - 10,
            // Grows out of the side the companion is on.
            transformOrigin: bubbleOnLeft ? 'right top' : 'left top',
          }}
          onClick={() => setMessage(null)}
        >
          <p className="text-xs font-medium text-text-primary leading-relaxed">{message}</p>
          <p className="mt-1 text-[11px] text-muted">— {companion?.name ?? 'Companion'}</p>
          <div
            className={`absolute top-4 w-2 h-2 bg-card border border-primary-100 dark:border-primary-900 rotate-45 ${
              bubbleOnLeft ? 'right-[-5px] border-l-0 border-b-0' : 'left-[-5px] border-r-0 border-t-0'
            }`}
          />
        </m.div>
      )}
      </AnimatePresence>

      <m.div
        className="fixed left-0 top-0 z-50 flex h-14 w-14 touch-none select-none items-center justify-center rounded-full bg-card shadow-lg border-2 border-primary-200 dark:border-primary-800 cursor-grab active:cursor-grabbing"
        style={{ x, y }}
        initial={false}
        animate={{ scale: message || dragging ? 1 : IDLE_SCALE }}
        transition={transitions.springy}
        drag
        dragConstraints={bounds}
        dragElastic={0.15}
        dragTransition={{ power: 0.2, timeConstant: 200, bounceStiffness: 400, bounceDamping: 30 }}
        whileTap={{ scale: 0.94 }}
        whileDrag={{ scale: 1.08, boxShadow: '0 12px 28px rgba(0, 0, 0, 0.22)' }}
        onDragStart={() => {
          cancelLongPress()
          setDragging(true)
        }}
        onDragTransitionEnd={handleDragSettled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={cancelLongPress}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={companion?.name ?? 'Companion'} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-xl">💬</span>
        )}
      </m.div>
    </>
  )
}
