import { describe, it, expect } from 'vitest'
import { seasonFor, resolveColorTheme } from './themes'

describe('themes', () => {
  it.each([
    ['2026-03-01', 'spring'], ['2026-05-31', 'spring'],
    ['2026-06-01', 'summer'], ['2026-08-31', 'summer'],
    ['2026-09-01', 'autumn'], ['2026-11-30', 'autumn'],
    ['2026-12-01', 'winter'], ['2027-02-28', 'winter'],
  ])('%s is %s', (date, season) => {
    expect(seasonFor(new Date(`${date}T12:00:00`))).toBe(season)
  })

  it('resolves the setting to a theme', () => {
    const october = new Date('2026-10-05T12:00:00')
    expect(resolveColorTheme(undefined, october)).toBe('coral')
    expect(resolveColorTheme('winter', october)).toBe('winter')
    expect(resolveColorTheme('seasonal', october)).toBe('autumn')
  })
})
