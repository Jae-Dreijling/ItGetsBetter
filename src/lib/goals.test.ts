import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { nextMilestone, progress, reorder, sortMilestones, autoFromText, autoReached, autoLabel } from './goals'
import { createTrack, toggleMilestone, moveMilestone, addMilestone, checkAutoMilestones, archiveTrack } from '../hooks/useGoals'
import type { GoalMilestone } from '../types'

function m(id: number, order: number, done = false): GoalMilestone {
  return { id, track_id: 1, text: `M${id}`, order, done_at: done ? '2026-10-20T10:00:00Z' : null, aim_for: null, treat: null, points_given: done, created_at: '' }
}

describe('goal logic', () => {
  it('finds the next milestone in order, skipping done ones', () => {
    const list = [m(1, 2), m(2, 0, true), m(3, 1)]
    expect(nextMilestone(list)?.id).toBe(3)
    expect(nextMilestone([m(1, 0, true)])).toBeNull()
    expect(progress(list)).toEqual({ done: 1, total: 3 })
  })

  it('moves a milestone up or down, and not past the ends', () => {
    const list = [m(1, 0), m(2, 1), m(3, 2)]
    expect([...reorder(list, 3, -1)].sort((a, b) => a[1] - b[1]).map(([id]) => id)).toEqual([1, 3, 2])
    expect([...reorder(list, 1, -1)].sort((a, b) => a[1] - b[1]).map(([id]) => id)).toEqual([1, 2, 3])
  })
})

describe('goal tracks', () => {
  beforeEach(clearDb)

  it('celebrates a milestone once: points, a win; undo removes the win', async () => {
    const trackId = await createTrack('Guitar', '🎸', ['Learn 4 chords', 'Play a song'])
    const [first] = sortMilestones(await db.goalMilestones.toArray())
    await toggleMilestone(first.id!)

    expect((await db.goalMilestones.get(first.id!))!.done_at).not.toBeNull()
    expect((await db.wins.toArray()).map(w => w.text)).toEqual(['🎸 Guitar: Learn 4 chords'])
    expect(await db.pointsTransactions.where('source_type').equals('milestone_reached').count()).toBe(1)

    await toggleMilestone(first.id!)
    expect(await db.wins.count()).toBe(0)
    await toggleMilestone(first.id!)
    expect(await db.pointsTransactions.where('source_type').equals('milestone_reached').count()).toBe(1)

    await addMilestone(trackId, 'Learn barre chords')
    const added = (await db.goalMilestones.toArray()).find(x => x.text === 'Learn barre chords')!
    expect(added.order).toBe(2)
    await moveMilestone(trackId, added.id!, -1)
    expect(sortMilestones(await db.goalMilestones.toArray()).map(x => x.text)).toEqual(['Learn 4 chords', 'Learn barre chords', 'Play a song'])
  })
})

describe('weight steps that tick themselves', () => {
  it('recognises "−2 kg from where I started" and "Reach 83 kg"', () => {
    expect(autoFromText('−2 kg from where I started')).toEqual({ kind: 'weight_down_kg', value: 2 })
    expect(autoFromText('-2,5 kg below where I started')).toEqual({ kind: 'weight_down_kg', value: 2.5 })
    expect(autoFromText('Reach 83 kg')).toEqual({ kind: 'weight_at_most_kg', value: 83 })
    expect(autoFromText('First smaller clothing size')).toBeNull()
  })

  it('compares the trend to the target', () => {
    const down2 = { kind: 'weight_down_kg' as const, value: 2 }
    expect(autoReached(down2, 88.1, 90)).toBe(false)
    expect(autoReached(down2, 88, 90)).toBe(true)
    expect(autoReached(down2, 80, null)).toBe(false)
    expect(autoReached({ kind: 'weight_at_most_kg', value: 83 }, 82.9, 90)).toBe(true)
    expect(autoLabel(down2, 88.4, 90)).toBe('Ticks itself at 88.0 kg · trend 88.4 kg')
  })
})

describe('auto-checking goal tracks', () => {
  beforeEach(clearDb)

  async function weighIns(...kgs: number[]) {
    for (let i = 0; i < kgs.length; i++) {
      await db.weightEntries.add({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, value_kg: kgs[i], logged_at: '', is_backfill: true })
    }
  }

  it('ticks a step once the trend gets there, pays once and never un-ticks', async () => {
    await db.userProfile.add({ starting_weight_kg: 90 } as never)
    await createTrack('Weight', '⚖️', ['−2 kg from where I started', '−5 kg from where I started', 'Reassess'])
    // One low day isn't enough: the trend has to get there.
    await weighIns(90, 87)
    expect(await checkAutoMilestones()).toBe(0)

    await db.weightEntries.clear()
    await weighIns(...Array.from({ length: 25 }, () => 87.5))
    expect(await checkAutoMilestones()).toBe(1)
    const steps = sortMilestones(await db.goalMilestones.toArray())
    expect(steps.map(m => !!m.done_at)).toEqual([true, false, false])
    expect(await db.pointsTransactions.where('source_type').equals('milestone_reached').count()).toBe(1)
    expect((await db.wins.toArray()).map(w => w.text)).toEqual(['⚖️ Weight: −2 kg from where I started'])

    // The trend going back up doesn't take it away.
    await db.weightEntries.clear()
    await weighIns(91)
    expect(await checkAutoMilestones()).toBe(0)
    expect((await db.goalMilestones.get(steps[0].id!))!.done_at).not.toBeNull()
  })

  it('celebrates once when two checks run at the same time', async () => {
    await db.userProfile.add({ starting_weight_kg: 90 } as never)
    await createTrack('Weight', '⚖️', ['Reach 95 kg'])
    await db.goalMilestones.toCollection().modify({ done_at: null })
    await weighIns(80)
    await Promise.all([checkAutoMilestones(), checkAutoMilestones()])
    expect(await db.wins.count()).toBe(1)
  })

  it('leaves put-away goals alone', async () => {
    await db.userProfile.add({ starting_weight_kg: 90 } as never)
    await weighIns(80)
    // Already below 95 kg: it ticks as soon as the goal is made.
    const id = await createTrack('Weight', '⚖️', ['Reach 95 kg'])
    expect((await db.goalMilestones.toArray())[0].done_at).not.toBeNull()
    await db.goalMilestones.toCollection().modify({ done_at: null })
    await archiveTrack(id)
    expect(await checkAutoMilestones()).toBe(0)
  })
})
