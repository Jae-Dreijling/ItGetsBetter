import { useState, useEffect, useRef, useCallback } from 'react'
import { useSessionCompanion, useEffectiveMessages, getCompanionMessage, ensureDefaultCompanion, type CompanionEvent } from '../hooks/useCompanion'
import { useProfile } from '../hooks/useProfile'
import CompanionChat from './CompanionChat'
import { tryGetMotivationMessage } from '../hooks/useMotivationNotes'
import { useLatestMoodScore } from '../hooks/useMood'
import { useIsPhoneFreeTime, useIsGoodnightTime } from '../hooks/useSchedule'
import { useCompanionAffinityFor } from '../hooks/useGame'
import { getDataAwareNudge } from '../lib/companionNudges'
import { registerCompanionMessageHandler } from '../lib/companionMessenger'
import { startIdleTimer } from '../lib/idleTimer'

const POSITION_KEY = 'igb_companion_position'
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
  const [position, setPosition] = useState(() => {
    const clamp = (p: { x: number; y: number }) => ({
      x: Math.max(0, Math.min(window.innerWidth - 56, p.x)),
      y: Math.max(56, Math.min(window.innerHeight - 120, p.y)),
    })
    const saved = localStorage.getItem(POSITION_KEY)
    if (saved) return clamp(JSON.parse(saved) as { x: number; y: number })
    return { x: window.innerWidth - 70, y: window.innerHeight - 200 }
  })
  const [dragging, setDragging] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasLongPress = useRef(false)
  const name = profile?.display_name ?? 'friend'

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

  const showMessage = useCallback((event: CompanionEvent) => {
    const msg = getCompanionMessage(messagesRef.current, event, nameRef.current)
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
      setPosition(p => ({
        x: Math.max(0, Math.min(window.innerWidth - 56, p.x)),
        y: Math.max(56, Math.min(window.innerHeight - 120, p.y)),
      }))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  function handleTap() {
    if (!dragging && !wasLongPress.current) {
      showMessage('general')
    }
    wasLongPress.current = false
  }

  function startLongPress() {
    wasLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      wasLongPress.current = true
      setChatOpen(true)
    }, 500)
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]
    dragOffset.current = { x: touch.clientX - position.x, y: touch.clientY - position.y }
    setDragging(false)
    startLongPress()
  }

  function handleTouchMove(e: React.TouchEvent) {
    cancelLongPress()
    const touch = e.touches[0]
    const newX = Math.max(0, Math.min(window.innerWidth - 56, touch.clientX - dragOffset.current.x))
    const newY = Math.max(56, Math.min(window.innerHeight - 120, touch.clientY - dragOffset.current.y))
    setPosition({ x: newX, y: newY })
    setDragging(true)
  }

  function handleTouchEnd() {
    cancelLongPress()
    localStorage.setItem(POSITION_KEY, JSON.stringify(position))
    setTimeout(() => setDragging(false), 100)
  }

  function handleMouseDown(e: React.MouseEvent) {
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    setDragging(false)
    startLongPress()

    function onMouseMove(ev: MouseEvent) {
      cancelLongPress()
      const newX = Math.max(0, Math.min(window.innerWidth - 56, ev.clientX - dragOffset.current.x))
      const newY = Math.max(56, Math.min(window.innerHeight - 120, ev.clientY - dragOffset.current.y))
      setPosition({ x: newX, y: newY })
      setDragging(true)
    }

    function onMouseUp() {
      cancelLongPress()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      localStorage.setItem(POSITION_KEY, JSON.stringify(position))
      setTimeout(() => setDragging(false), 100)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  if (chatOpen) {
    return <CompanionChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
  }

  const iconCenter = position.x + 28
  const bubbleOnLeft = iconCenter > window.innerWidth / 2

  return (
    <>
      {message && (
        <div
          className="fixed z-50 rounded-2xl bg-card p-3 shadow-lg border border-primary-100 dark:border-primary-900"
          style={{
            ...(bubbleOnLeft
              ? { right: window.innerWidth - position.x + 8, maxWidth: position.x - 16 }
              : { left: position.x + 62, maxWidth: window.innerWidth - position.x - 70 }),
            top: position.y - 10,
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
        </div>
      )}

      <div
        className="fixed left-0 top-0 z-50 flex h-14 w-14 touch-none items-center justify-center rounded-full bg-card shadow-lg border-2 border-primary-200 dark:border-primary-800 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-xl"
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={companion?.name ?? 'Companion'} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-xl">💬</span>
        )}
      </div>
    </>
  )
}
