import { useState, useEffect, useRef, useCallback } from 'react'
import { useActiveCompanion, getCompanionMessage, type CompanionEvent } from '../hooks/useCompanion'
import { useProfile } from '../hooks/useProfile'
import CompanionChat from './CompanionChat'

const POSITION_KEY = 'igb_companion_position'
const IDLE_TIMEOUT = 10000

let showMessageFn: ((event: CompanionEvent) => void) | null = null

export function triggerCompanionMessage(event: CompanionEvent) {
  if (showMessageFn) showMessageFn(event)
}

export default function FloatingCompanion() {
  const companion = useActiveCompanion()
  const { profile } = useProfile()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem(POSITION_KEY)
    if (saved) return JSON.parse(saved) as { x: number; y: number }
    return { x: window.innerWidth - 70, y: window.innerHeight - 200 }
  })
  const [dragging, setDragging] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasLongPress = useRef(false)
  const name = profile?.display_name ?? 'friend'

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
    const msg = getCompanionMessage(companion, event, name)
    setMessage(msg)
    if (messageTimer.current) clearTimeout(messageTimer.current)
    messageTimer.current = setTimeout(() => setMessage(null), 5000)
  }, [companion, name])

  useEffect(() => {
    showMessageFn = showMessage
    return () => { showMessageFn = null }
  }, [showMessage])

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      showMessage('idle')
    }, IDLE_TIMEOUT)
  }, [showMessage])

  useEffect(() => {
    const events = ['touchstart', 'mousedown', 'scroll', 'keydown'] as const
    const handler = () => resetIdleTimer()
    events.forEach(e => window.addEventListener(e, handler, { passive: true }))
    resetIdleTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, handler))
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [resetIdleTimer])

  function handleTap() {
    if (!dragging && !wasLongPress.current) {
      showMessage('general')
      resetIdleTimer()
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

  if (!companion) return null

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
          <p className="mt-1 text-[11px] text-muted">— {companion.name}</p>
          <div
            className={`absolute top-4 w-2 h-2 bg-card border border-primary-100 dark:border-primary-900 rotate-45 ${
              bubbleOnLeft ? 'right-[-5px] border-l-0 border-b-0' : 'left-[-5px] border-r-0 border-t-0'
            }`}
          />
        </div>
      )}

      <div
        className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-lg border-2 border-primary-200 dark:border-primary-800 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-xl"
        style={{ left: position.x, top: position.y }}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={companion.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-xl">💬</span>
        )}
      </div>
    </>
  )
}
