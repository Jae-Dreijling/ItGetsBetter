import { describe, it, expect } from 'vitest'
import { mergeQuotesIntoCompanions } from './quotesMigration'

const def = { id: 1, is_default: true, messages: { general: ['Hi {name}'], idle: ['...'] } }
const custom: { id: number; is_default: boolean; messages: { general: string[]; idle?: string[] } } = { id: 2, is_default: false, messages: { general: [] } }

describe('mergeQuotesIntoCompanions', () => {
  it("adds quotes to the default companion's General lines", () => {
    const [d, c] = mergeQuotesIntoCompanions([def, custom], [{ text: 'Keep going' }, { text: ' Breathe ' }])
    expect(d.messages.general).toEqual(['Hi {name}', 'Keep going', 'Breathe'])
    expect(d.messages.idle).toEqual(['...'])
    expect(c).toBe(custom)
  })

  it('skips blanks and lines the companion already has', () => {
    const [d] = mergeQuotesIntoCompanions([def], [{ text: 'Hi {name}' }, { text: '' }, { text: 'New' }, { text: 'New' }])
    expect(d.messages.general).toEqual(['Hi {name}', 'New'])
  })

  it('falls back to the first companion when there is no default', () => {
    const [c] = mergeQuotesIntoCompanions([custom], [{ text: 'Keep going' }])
    expect(c.messages.general).toEqual(['Keep going'])
  })

  it('changes nothing without quotes or companions', () => {
    const list = [def]
    expect(mergeQuotesIntoCompanions(list, [])).toBe(list)
    expect(mergeQuotesIntoCompanions([], [{ text: 'Lost?' }])).toEqual([])
  })
})
