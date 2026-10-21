import { describe, it, expect } from 'vitest'
import { trendSeries, trendOn, trendChange, jumpNote, changeText, weeklyAverages } from './weightTrend'

const e = (date: string, value_kg: number) => ({ date, value_kg })

describe('weight trend', () => {
  it('starts at the first weigh-in and moves 10% a day towards new ones', () => {
    const s = trendSeries([e('2026-10-01', 80), e('2026-10-02', 81)])
    expect(s[0]).toEqual({ date: '2026-10-01', weight: 80, trend: 80 })
    expect(s[1].trend).toBe(80.1)
  })

  it('counts a gap of several days as several days of smoothing', () => {
    // 1 - 0.9^4 = 0.3439 of the way after 4 days.
    const s = trendSeries([e('2026-10-01', 80), e('2026-10-05', 82)])
    expect(s[1].trend).toBe(80.7)
  })

  it('averages several weigh-ins on one day, in any order', () => {
    const s = trendSeries([e('2026-10-02', 81), e('2026-10-01', 80), e('2026-10-02', 81.4)])
    expect(s.map(p => p.date)).toEqual(['2026-10-01', '2026-10-02'])
    expect(s[1].weight).toBe(81.2)
  })

  it('a one-day spike barely moves the trend', () => {
    const steady = Array.from({ length: 10 }, (_, i) => e(`2026-10-${String(i + 1).padStart(2, '0')}`, 80))
    const s = trendSeries([...steady, e('2026-10-11', 82)])
    expect(s.at(-1)!.trend).toBe(80.2)
    expect(jumpNote(s.at(-1))).toContain('water')
    expect(jumpNote(s[5])).toBeNull()
  })

  it('reports the change over two weeks calmly', () => {
    const days = Array.from({ length: 30 }, (_, i) => e(`2026-10-${String(i + 1).padStart(2, '0')}`, 90 - i * 0.1))
    const s = trendSeries(days)
    const change = trendChange(s, '2026-10-30')!
    expect(change).toBeLessThan(0)
    expect(changeText(change)).toMatch(/^−\d\.\d kg in 2 weeks$/)
    expect(changeText(0.1)).toBe('Steady over 2 weeks')
    expect(changeText(0.5)).toBe('+0.5 kg in 2 weeks')
    expect(trendChange(s, '2026-10-05')).toBeNull()
    expect(trendOn(s, '2026-09-01')).toBeNull()
  })

  it('makes weekly averages, newest first', () => {
    const weeks = weeklyAverages([e('2026-10-19', 80), e('2026-10-21', 81), e('2026-10-13', 82)])
    expect(weeks).toEqual([
      { weekStart: '2026-10-19', average: 80.5, weighIns: 2 },
      { weekStart: '2026-10-12', average: 82, weighIns: 1 },
    ])
  })
})
