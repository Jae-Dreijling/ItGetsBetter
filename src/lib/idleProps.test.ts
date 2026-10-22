import { describe, it, expect } from 'vitest'
import { idleProp } from './idleProps'
import { traitsOf } from './companionPersonality'

describe('idle props', () => {
  it('uses its own props, a trait prop otherwise, and 💤 at night', () => {
    expect(idleProp(['☕'], traitsOf(undefined), 14, 0.5)).toBe('☕')
    expect(['📖', '🔭']).toContain(idleProp(undefined, traitsOf({ traits: { nerdy: 2, playful: 0, caring: 0 } }), 14, 0.3))
    expect(idleProp(['☕'], traitsOf(undefined), 1, 0.5)).toBe('💤')
  })
})
