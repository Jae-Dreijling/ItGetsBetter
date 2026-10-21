import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { nextMilestone, progress, reorder, sortMilestones } from './goals'
import { createTrack, toggleMilestone, moveMilestone, addMilestone } from '../hooks/useGoals'
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
