import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { reorder } from '../lib/goals'
import { awardPoints } from './usePoints'
import { triggerCompanionMessage } from '../lib/companionMessenger'
import type { GoalMilestone, GoalTrack } from '../types'

export function useTracks() {
  return useLiveQuery(() => db.goalTracks.orderBy('created_at').filter(t => !t.archived).toArray())
}

// undefined while loading, null when it doesn't exist.
export function useTrack(id: number) {
  return useLiveQuery(async () => (await db.goalTracks.get(id)) ?? null, [id])
}

export function useMilestones(trackId?: number) {
  return useLiveQuery(
    () => trackId === undefined ? db.goalMilestones.toArray() : db.goalMilestones.where('track_id').equals(trackId).toArray(),
    [trackId]
  ) ?? []
}

export async function createTrack(name: string, emoji: string, milestones: string[]): Promise<number> {
  return db.transaction('rw', db.goalTracks, db.goalMilestones, async () => {
    const now = nowISO()
    const trackId = await db.goalTracks.add({ name, emoji, archived: false, created_at: now }) as number
    await db.goalMilestones.bulkAdd(milestones.filter(t => t.trim()).map((text, order) => ({
      track_id: trackId, text: text.trim(), order, done_at: null, aim_for: null, treat: null, points_given: false, created_at: now,
    })))
    return trackId
  })
}

export async function updateTrack(id: number, changes: Partial<Pick<GoalTrack, 'name' | 'emoji'>>) {
  await db.goalTracks.update(id, changes)
}

// Putting a track away isn't failing it: it's hidden, and its history stays.
export async function archiveTrack(id: number) {
  await db.goalTracks.update(id, { archived: true })
}

export async function deleteTrack(id: number) {
  await db.transaction('rw', db.goalTracks, db.goalMilestones, async () => {
    await db.goalMilestones.where('track_id').equals(id).delete()
    await db.goalTracks.delete(id)
  })
}

export async function addMilestone(trackId: number, text: string) {
  const last = await db.goalMilestones.where('track_id').equals(trackId).toArray()
  await db.goalMilestones.add({
    track_id: trackId, text: text.trim(), order: last.reduce((max, m) => Math.max(max, m.order + 1), 0),
    done_at: null, aim_for: null, treat: null, points_given: false, created_at: nowISO(),
  })
}

export async function updateMilestone(id: number, changes: Partial<Pick<GoalMilestone, 'text' | 'aim_for' | 'treat'>>) {
  await db.goalMilestones.update(id, changes)
}

export async function deleteMilestone(id: number) {
  await db.goalMilestones.delete(id)
}

export async function moveMilestone(trackId: number, id: number, direction: -1 | 1) {
  const milestones = await db.goalMilestones.where('track_id').equals(trackId).toArray()
  const orders = reorder(milestones, id, direction)
  await db.transaction('rw', db.goalMilestones, async () => {
    for (const [mid, order] of orders) await db.goalMilestones.update(mid, { order })
  })
}

function winText(track: GoalTrack | undefined, milestone: GoalMilestone): string {
  return track ? `${track.emoji} ${track.name}: ${milestone.text}` : milestone.text
}

// Reached: celebrate with points (once per milestone), a win in the wins jar
// and the companion's achievement lines. Ticking again undoes a mis-tap.
export async function toggleMilestone(id: number) {
  const milestone = await db.goalMilestones.get(id)
  if (!milestone) return
  const track = await db.goalTracks.get(milestone.track_id)

  if (milestone.done_at) {
    await db.goalMilestones.update(id, { done_at: null })
    await db.wins.filter(w => w.source === 'milestone' && w.text === winText(track, milestone)).delete()
    return
  }

  await db.goalMilestones.update(id, { done_at: nowISO(), points_given: true })
  await db.wins.add({ date: getLogicalDate(), text: winText(track, milestone), source: 'milestone', logged_at: nowISO() })
  if (!milestone.points_given) await awardPoints('milestone_reached', id)
  triggerCompanionMessage('achievement_unlocked')
}
