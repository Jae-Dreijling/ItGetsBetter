import { describe, it, expect } from 'vitest'
import { abstinenceStats, formatDuration, slipMessage, contextCounts, MILESTONES } from './abstinence'

const at = (s: string) => new Date(s).toISOString()

describe('abstinence stats', () => {
  it('counts a clean run from the start', () => {
    const s = abstinenceStats(at('2026-10-10T12:00:00'), [], new Date('2026-10-20T16:00:00'))
    expect(s.currentRunMs).toBe(s.longestRunMs)
    expect(s.freeInWindow).toBe(11) // 10th through 20th
    expect(s.windowDays).toBe(11)
    expect(s.totalFreeDays).toBe(11)
    expect(s.milestonesReached).toBe(3) // 1 day, 3 days, 1 week
  })

  it('keeps the good days after a slip instead of dropping to zero', () => {
    const s = abstinenceStats(at('2026-08-01T12:00:00'), [at('2026-10-19T20:00:00')], new Date('2026-10-20T20:00:00'))
    expect(s.freeInWindow).toBe(29)
    expect(s.windowDays).toBe(30)
    expect(s.currentRunMs).toBe(24 * 60 * 60 * 1000)
    // The run of ~79 days before the slip still counts.
    expect(s.longestRunMs).toBeGreaterThan(78 * 24 * 60 * 60 * 1000)
    expect(s.milestonesReached).toBe(MILESTONES.filter(m => m.days <= 78).length)
  })

  it('puts a slip after midnight on the evening before (3 AM boundary)', () => {
    const s = abstinenceStats(at('2026-10-15T12:00:00'), [at('2026-10-18T01:30:00')], new Date('2026-10-20T12:00:00'))
    // Slip day is the 17th, so 15, 16, 18, 19, 20 are free.
    expect(s.freeInWindow).toBe(5)
    expect(s.windowDays).toBe(6)
  })

  it('counts several slips on one day as one day', () => {
    const s = abstinenceStats(at('2026-10-15T12:00:00'), [at('2026-10-17T10:00:00'), at('2026-10-17T18:00:00')], new Date('2026-10-20T12:00:00'))
    expect(s.freeInWindow).toBe(5)
  })

  it('ignores slips from before the start', () => {
    const s = abstinenceStats(at('2026-10-15T12:00:00'), [at('2026-10-01T10:00:00')], new Date('2026-10-16T12:00:00'))
    expect(s.freeInWindow).toBe(2)
    expect(s.currentRunMs).toBe(24 * 60 * 60 * 1000)
  })
})

describe('abstinence wording', () => {
  it('formats durations', () => {
    expect(formatDuration(5 * 60000)).toBe('5 min')
    expect(formatDuration((3 * 60 + 20) * 60000)).toBe('3 hours, 20 min')
    expect(formatDuration((12 * 1440 + 4 * 60) * 60000)).toBe('12 days, 4 hours')
    expect(formatDuration(1440 * 60000)).toBe('1 day, 0 hours')
  })

  it('leads with the good days after a slip', () => {
    const s = { currentRunMs: 0, longestRunMs: 0, freeInWindow: 27, windowDays: 30, totalFreeDays: 100, milestonesReached: 4 }
    expect(slipMessage(s)).toBe("27 of 30 is still 27 good days. The timer's running again.")
  })

  it('counts contexts, most common first', () => {
    expect(contextCounts(['bored', null, 'stressed', 'bored'])).toEqual([['bored', 2], ['stressed', 1]])
  })
})
