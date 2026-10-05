// Calls `onIdle` once after `timeoutMs` without any user activity, then waits
// for the next activity before it can fire again. Listens in the capture
// phase on the document, so scrolling inside any container counts (scroll
// events don't bubble). Paused while the app is in the background.
const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'touchstart', 'touchmove', 'wheel', 'scroll', 'keydown', 'input'] as const

export interface IdleTimerOptions {
  timeoutMs: number
  onIdle: () => void
  target?: EventTarget
  isHidden?: () => boolean
}

export function startIdleTimer({
  timeoutMs,
  onIdle,
  target = document,
  isHidden = () => document.visibilityState === 'hidden',
}: IdleTimerOptions): { stop: () => void } {
  let lastActivity = Date.now()
  let timer: ReturnType<typeof setTimeout> | null = null

  // Activity only records a timestamp (pointermove and scroll fire many times
  // a second); the single pending timeout re-checks it when it runs.
  function schedule(delay: number) {
    timer = setTimeout(check, delay)
  }

  function check() {
    timer = null
    if (isHidden()) return
    const idleFor = Date.now() - lastActivity
    if (idleFor < timeoutMs) {
      schedule(timeoutMs - idleFor)
      return
    }
    onIdle()
  }

  function onActivity() {
    lastActivity = Date.now()
    if (timer === null && !isHidden()) schedule(timeoutMs)
  }

  function onVisibilityChange() {
    if (isHidden()) {
      if (timer !== null) clearTimeout(timer)
      timer = null
    } else {
      onActivity()
    }
  }

  for (const event of ACTIVITY_EVENTS) target.addEventListener(event, onActivity, { capture: true, passive: true })
  target.addEventListener('visibilitychange', onVisibilityChange)
  if (!isHidden()) schedule(timeoutMs)

  return {
    stop() {
      for (const event of ACTIVITY_EVENTS) target.removeEventListener(event, onActivity, { capture: true })
      target.removeEventListener('visibilitychange', onVisibilityChange)
      if (timer !== null) clearTimeout(timer)
      timer = null
    },
  }
}
