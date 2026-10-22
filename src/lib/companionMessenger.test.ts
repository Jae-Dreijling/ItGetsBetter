import { describe, it, expect, vi, afterEach } from 'vitest'
import { registerCompanionMessageHandler, registerVisitorSpeaker, triggerCompanionMessage, idleTurnForVisitor } from './companionMessenger'

describe('taking turns with visitors', () => {
  afterEach(() => registerCompanionMessageHandler(null))

  it('your moments alternate between your companion and a visitor; big moments stay with yours', () => {
    const main = vi.fn()
    const visitor = vi.fn()
    registerCompanionMessageHandler(main)
    const stop = registerVisitorSpeaker(7, visitor)

    for (let i = 0; i < 4; i++) triggerCompanionMessage('habit_completed')
    expect(main).toHaveBeenCalledTimes(2)
    expect(visitor).toHaveBeenCalledTimes(2)

    triggerCompanionMessage('goal_completed')
    expect(main).toHaveBeenCalledTimes(3)
    expect(visitor).toHaveBeenCalledTimes(2)

    // Idle chats are shared too.
    const idle = [idleTurnForVisitor(), idleTurnForVisitor()]
    expect(idle.filter(Boolean)).toHaveLength(1)

    stop()
    triggerCompanionMessage('habit_completed')
    triggerCompanionMessage('habit_completed')
    expect(visitor).toHaveBeenCalledTimes(3)
    expect(main).toHaveBeenCalledTimes(5)
  })
})
