import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { reorder, autoFromText, autoReached } from '../lib/goals'
import { trendSeries } from '../lib/weightTrend'
import { awardPoints } from './usePoints'
import { triggerCompanionMessage } from '../lib/companionMessenger'
import type { GoalMilestone, GoalTrack, MilestoneAuto } from '../types'

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
      track_id: trackId, text: text.trim(), order, done_at: null, aim_for: null, treat: null, points_given: false,
      auto: autoFromText(text), created_at: now,
    })))
    return trackId
  }).then(async trackId => {
    await checkAutoMilestones()
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
    done_at: null, aim_for: null, treat: null, points_given: false, auto: autoFromText(text), created_at: nowISO(),
  })
  await checkAutoMilestones()
}

export async function updateMilestone(id: number, changes: Partial<Pick<GoalMilestone, 'text' | 'aim_for' | 'treat'>>) {
  // Renaming to "−3 kg from where I started" makes the step tick itself.
  const auto = changes.text ? autoFromText(changes.text) : null
  await db.goalMilestones.update(id, auto ? { ...changes, auto } : changes)
  if (auto) await checkAutoMilestones()
}

export async function setMilestoneAuto(id: number, auto: MilestoneAuto | null) {
  await db.goalMilestones.update(id, { auto })
  await checkAutoMilestones()
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

  await reach(milestone, track)
}

// The celebration for reaching a step, by hand or by itself. The step is
// claimed in a transaction first, so two checks running at once (a weigh-in
// right as the app opens) can't celebrate it twice.
async function reach(milestone: GoalMilestone, track: GoalTrack | undefined) {
  const claimed = await db.transaction('rw', db.goalMilestones, async () => {
    const fresh = await db.goalMilestones.get(milestone.id!)
    if (!fresh || fresh.done_at) return false
    await db.goalMilestones.update(milestone.id!, { done_at: nowISO(), points_given: true })
    return true
  })
  if (!claimed) return
  await db.wins.add({ date: getLogicalDate(), text: winText(track, milestone), source: 'milestone', logged_at: nowISO() })
  if (!milestone.points_given) await awardPoints('milestone_reached', milestone.id)
  triggerCompanionMessage('achievement_unlocked')
}

// Ticks automatic weight steps the trend has reached (after a weigh-in and on
// app start). Only ever ticks: a reached step stays reached, whatever the
// trend does afterwards. Put-away goals are left alone.
export async function checkAutoMilestones(): Promise<number> {
  const open = await db.goalMilestones.filter(m => !!m.auto && !m.done_at).toArray()
  if (open.length === 0) return 0
  const trend = trendSeries(await db.weightEntries.toArray()).at(-1)?.trend ?? null
  const profile = await db.userProfile.toCollection().first()
  let reached = 0
  for (const milestone of open) {
    const track = await db.goalTracks.get(milestone.track_id)
    if (!track || track.archived) continue
    if (autoReached(milestone.auto!, trend, profile?.starting_weight_kg)) {
      await reach(milestone, track)
      reached++
    }
  }
  return reached
}
