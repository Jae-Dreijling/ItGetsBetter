import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { addWeightEntry } from './useWeightEntries'
import { registerCompanionMessageHandler } from '../lib/companionMessenger'
import type { CompanionEvent } from './useCompanion'

function captureCompanionEvents() {
  const events: CompanionEvent[] = []
  registerCompanionMessageHandler(e => events.push(e))
  return events
}

describe('addWeightEntry', () => {
  beforeEach(async () => {
    await clearDb()
    registerCompanionMessageHandler(null)
  })

  it('saves the entry with the given value and date', async () => {
    await addWeightEntry(80, '2026-01-01')
    const entries = await db.weightEntries.toArray()
    expect(entries).toHaveLength(1)
    expect(entries[0].value_kg).toBe(80)
    expect(entries[0].date).toBe('2026-01-01')
  })

  it('triggers first_milestone for the very first entry', async () => {
    const events = captureCompanionEvents()
    await addWeightEntry(80, '2026-01-01')
    expect(events).toContain('first_milestone')
  })

  it('triggers weight_loss when lighter than the previous entry', async () => {
    await addWeightEntry(80, '2026-01-01')
    const events = captureCompanionEvents()
    await addWeightEntry(79, '2026-01-02')
    expect(events).toContain('weight_loss')
    expect(events).not.toContain('weight_gain')
  })

  it('triggers weight_gain when heavier than the previous entry', async () => {
    await addWeightEntry(80, '2026-01-01')
    const events = captureCompanionEvents()
    await addWeightEntry(81, '2026-01-02')
    expect(events).toContain('weight_gain')
    expect(events).not.toContain('weight_loss')
  })

  it('does not trigger personal_best on a gain that is still above the historical low', async () => {
    // Regression test: this whole flow used to throw a SchemaError (value_kg
    // wasn't an indexed field), which silently discarded every weight entry
    // instead of saving it — see addWeightEntry in useWeightEntries.ts.
    await addWeightEntry(80, '2026-01-01')
    await addWeightEntry(70, '2026-01-02') // new all-time low
    const events = captureCompanionEvents()
    await addWeightEntry(71, '2026-01-03') // up from 70, but not a new low
    expect(events).toContain('weight_gain')
    expect(events).not.toContain('personal_best')
  })

  it('correctly finds the historical lowest across many entries', async () => {
    for (const [i, v] of [80, 78, 76, 74, 90].entries()) {
      await addWeightEntry(v, `2026-01-0${i + 1}`)
    }
    const events = captureCompanionEvents()
    await addWeightEntry(73, '2026-01-06') // new all-time low (below 74)
    expect(events).toContain('personal_best')
  })

  it('does not award points or trigger companion messages for backfilled entries', async () => {
    const events = captureCompanionEvents()
    await addWeightEntry(80, '2026-01-01', true)
    expect(events).toHaveLength(0)
    const points = await db.pointsTransactions.toArray()
    expect(points).toHaveLength(0)
  })

  it('only awards weight_logged points once per day', async () => {
    await addWeightEntry(80, '2026-01-01')
    await addWeightEntry(79, '2026-01-01')
    const points = await db.pointsTransactions.where('source_type').equals('weight_logged').toArray()
    expect(points).toHaveLength(1)
  })
})
