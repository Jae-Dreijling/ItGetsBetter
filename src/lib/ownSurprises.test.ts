import { describe, it, expect } from 'vitest'
import { surpriseFor, surpriseKinds, FUN_FACTS } from './companionFun'
import { traitsOf } from './companionPersonality'

describe("a character's own surprises", () => {
  it('replace the shared list for that kind, and make the kind possible', () => {
    const own = { facts: ['The Devildom has no sun, only a very dramatic moon.'] }
    const plain = traitsOf({ traits: { nerdy: 0, playful: 0 } })
    expect(surpriseKinds(plain, false)).not.toContain('fact')
    expect(surpriseKinds(plain, false, own)).toContain('fact')
    const s = surpriseFor(1, ['fact'], false, own)
    expect(s).toEqual({ kind: 'fact', text: own.facts[0] })
    expect(FUN_FACTS).toContain((surpriseFor(1, ['fact']) as { text: string }).text)
  })
})
