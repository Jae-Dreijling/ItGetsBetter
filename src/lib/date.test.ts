import { describe, it, expect } from 'vitest'
import { getLogicalDate } from './date'

describe('getLogicalDate', () => {
  it('returns previous day at 2:59 AM (just before boundary)', () => {
    const timestamp = new Date('2026-06-18T02:59:00')
    expect(getLogicalDate(timestamp)).toBe('2026-06-17')
  })

  it('returns current day at 3:00 AM (exactly at boundary)', () => {
    const timestamp = new Date('2026-06-18T03:00:00')
    expect(getLogicalDate(timestamp)).toBe('2026-06-18')
  })

  it('returns current day at 3:01 AM (just after boundary)', () => {
    const timestamp = new Date('2026-06-18T03:01:00')
    expect(getLogicalDate(timestamp)).toBe('2026-06-18')
  })

  it('returns previous day at midnight', () => {
    const timestamp = new Date('2026-06-18T00:00:00')
    expect(getLogicalDate(timestamp)).toBe('2026-06-17')
  })

  it('returns current day at midday', () => {
    const timestamp = new Date('2026-06-18T12:00:00')
    expect(getLogicalDate(timestamp)).toBe('2026-06-18')
  })

  it('returns current day at 11:59 PM (late night)', () => {
    const timestamp = new Date('2026-06-18T23:59:00')
    expect(getLogicalDate(timestamp)).toBe('2026-06-18')
  })

  it('handles year boundary (Jan 1 at 2:30 AM belongs to Dec 31)', () => {
    const timestamp = new Date('2026-01-01T02:30:00')
    expect(getLogicalDate(timestamp)).toBe('2025-12-31')
  })

  it('handles year boundary (Jan 1 at 3:00 AM belongs to Jan 1)', () => {
    const timestamp = new Date('2026-01-01T03:00:00')
    expect(getLogicalDate(timestamp)).toBe('2026-01-01')
  })

  it('returns previous day at 1:00 AM', () => {
    const timestamp = new Date('2026-06-18T01:00:00')
    expect(getLogicalDate(timestamp)).toBe('2026-06-17')
  })

  it('handles month boundary (Mar 1 at 2:00 AM belongs to Feb 28)', () => {
    const timestamp = new Date('2026-03-01T02:00:00')
    expect(getLogicalDate(timestamp)).toBe('2026-02-28')
  })

  it('handles leap year month boundary (Mar 1 2028 at 2:00 AM belongs to Feb 29)', () => {
    const timestamp = new Date('2028-03-01T02:00:00')
    expect(getLogicalDate(timestamp)).toBe('2028-02-29')
  })
})
