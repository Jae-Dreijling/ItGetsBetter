import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate } from '../lib/date'
import { buildStops, periodStart, type ReplayPeriod } from '../lib/replay'

// Everything the progress walk stops at (lib/replay), live.
export function useReplayStops(period: ReplayPeriod, withPhotos: boolean) {
  return useLiveQuery(async () => {
    const today = getLogicalDate()
    const [profile, weights, tracks, milestones, counters, events, achievements, wins, cravings, letters, people, contacts, checkIns, photos] = await Promise.all([
      db.userProfile.toCollection().first(),
      db.weightEntries.toArray(),
      db.goalTracks.toArray(),
      db.goalMilestones.filter(m => !!m.done_at).toArray(),
      db.abstinenceCounters.toArray(),
      db.abstinenceEvents.filter(e => e.kind === 'slip').toArray(),
      db.achievements.filter(a => !!a.unlocked_at).toArray(),
      db.wins.toArray(),
      db.cravingEvents.filter(c => c.outcome === 'passed').toArray(),
      db.futureLetters.filter(l => !!l.opened_at).toArray(),
      db.people.toArray(),
      db.socialContacts.toArray(),
      db.habitCompletions.toArray(),
      withPhotos ? db.progressPhotos.toArray() : Promise.resolve([]),
    ])
    const started = profile ? getLogicalDate(new Date(profile.created_at)) : today
    const firstWeigh = weights.reduce((min, w) => (w.date < min ? w.date : min), started)
    const since = periodStart(period, today, firstWeigh)
    const trackEmoji = new Map(tracks.map(t => [t.id!, t.emoji]))
    const names = new Map(people.map(p => [p.id!, p.name]))

    return {
      since,
      stops: buildStops({
        since,
        today,
        milestones: milestones.map(m => ({ text: m.text, emoji: trackEmoji.get(m.track_id) ?? '🎯', done_at: m.done_at! })),
        counters: counters.map(c => ({ name: c.name, emoji: c.emoji, started_at: c.started_at, slips: events.filter(e => e.counter_id === c.id).map(e => e.at) })),
        achievements: achievements.map(a => ({ name: a.name, unlocked_at: a.unlocked_at! })),
        weights,
        wins: wins.map(w => ({ date: w.date, text: w.text })),
        cravingsPassed: cravings.map(c => c.date),
        lettersOpened: letters.map(l => l.opened_at!),
        contacts: contacts.map(c => ({ date: c.date, name: names.get(c.person_id) ?? 'someone' })),
        habitCheckIns: checkIns.map(c => c.date),
        photos: photos.map(p => ({ id: p.id!, date: p.date })),
      }),
    }
  }, [period, withPhotos])
}
