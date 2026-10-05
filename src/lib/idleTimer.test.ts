import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { startIdleTimer } from './idleTimer'

describe('startIdleTimer', () => {
  let target: EventTarget
  let hidden: boolean
  let onIdle: Mock<() => void>
  let stop: () => void

  beforeEach(() => {
    vi.useFakeTimers()
    target = new EventTarget()
    hidden = false
    onIdle = vi.fn<() => void>()
    ;({ stop } = startIdleTimer({ timeoutMs: 1000, onIdle, target, isHidden: () => hidden }))
  })

  afterEach(() => {
    stop()
    vi.useRealTimers()
  })

  it('fires once after the timeout without activity', () => {
    vi.advanceTimersByTime(999)
    expect(onIdle).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onIdle).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(5000)
    expect(onIdle).toHaveBeenCalledTimes(1)
  })

  it.each(['pointermove', 'touchmove', 'scroll', 'wheel', 'keydown', 'input', 'pointerdown'])(
    'treats %s as activity',
    (event) => {
      vi.advanceTimersByTime(800)
      target.dispatchEvent(new Event(event))
      vi.advanceTimersByTime(800)
      expect(onIdle).not.toHaveBeenCalled()
      vi.advanceTimersByTime(200)
      expect(onIdle).toHaveBeenCalledTimes(1)
    },
  )

  it('never fires while the user keeps interacting', () => {
    for (let i = 0; i < 20; i++) {
      vi.advanceTimersByTime(500)
      target.dispatchEvent(new Event('scroll'))
    }
    expect(onIdle).not.toHaveBeenCalled()
  })

  it('can fire again after new activity', () => {
    vi.advanceTimersByTime(1000)
    target.dispatchEvent(new Event('pointerdown'))
    vi.advanceTimersByTime(1000)
    expect(onIdle).toHaveBeenCalledTimes(2)
  })

  it('pauses while the app is hidden and restarts the countdown when visible', () => {
    vi.advanceTimersByTime(500)
    hidden = true
    target.dispatchEvent(new Event('visibilitychange'))
    vi.advanceTimersByTime(10_000)
    expect(onIdle).not.toHaveBeenCalled()

    hidden = false
    target.dispatchEvent(new Event('visibilitychange'))
    vi.advanceTimersByTime(999)
    expect(onIdle).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onIdle).toHaveBeenCalledTimes(1)
  })

  it('stops listening after stop()', () => {
    stop()
    vi.advanceTimersByTime(5000)
    expect(onIdle).not.toHaveBeenCalled()
  })
})
