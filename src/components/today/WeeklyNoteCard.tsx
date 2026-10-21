import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addDays, format, parseISO } from 'date-fns'
import { m } from 'motion/react'
import { db } from '../../db'
import { useSessionCompanion } from '../../hooks/useCompanion'
import { useProfile } from '../../hooks/useProfile'
import { useObjectUrl } from '../../hooks/useObjectUrl'
import { getLogicalDate } from '../../lib/date'
import { fadeUp } from '../../lib/animations'
import { fillPlaceholders } from '../../lib/companionTriggers'
import { dominantTrait, traitsOf } from '../../lib/companionPersonality'
import { buildWeeklyNote, type WeekStats } from '../../lib/weeklyNote'

const READ_KEY = 'igb_weekly_note_read'

// On Mondays: a note from your companion about last week (COMPANION-PLAN
// 11d), until you close it.
export default function WeeklyNoteCard() {
  const today = getLogicalDate()
  const isMonday = parseISO(today).getDay() === 1
  const [closed, setClosed] = useState(() => {
    try { return localStorage.getItem(READ_KEY) === today } catch { return false }
  })
  const companion = useSessionCompanion()
  const { profile } = useProfile()
  const avatar = useObjectUrl(companion?.avatar)
  const stats = useLiveQuery(async (): Promise<WeekStats | null> => {
    if (!isMonday) return null
    const from = format(addDays(parseISO(today), -7), 'yyyy-MM-dd')
    const to = format(addDays(parseISO(today), -1), 'yyyy-MM-dd')
    const [ticks, wins, contacts, workouts, cravings, opens, people, steps] = await Promise.all([
      db.habitCompletions.where('date').between(from, to, true, true).toArray(),
      db.wins.where('date').between(from, to, true, true).toArray(),
      db.socialContacts.where('date').between(from, to, true, true).toArray(),
      db.exerciseEntries.where('date').between(from, to, true, true).toArray(),
      db.cravingEvents.where('date').between(from, to, true, true).toArray(),
      db.appOpenLog.where('date').between(from, to, true, true).toArray(),
      db.people.toArray(),
      db.goalMilestones.filter(s => !!s.done_at && getLogicalDate(new Date(s.done_at)) >= from && getLogicalDate(new Date(s.done_at)) <= to).toArray(),
    ])
    const names = new Map(people.map(p => [p.id!, p.name]))
    return {
      habitTicks: ticks.length,
      wins: wins.length,
      people: [...new Set(contacts.map(c => names.get(c.person_id)).filter((n): n is string => !!n))],
      goalSteps: steps.map(s => s.text),
      workouts: workouts.length,
      cravingsPassed: cravings.filter(c => c.outcome === 'passed').length,
      daysOpened: new Set(opens.map(o => o.date)).size,
    }
  }, [today, isMonday])

  if (!isMonday || closed || !stats || !companion) return null
  const name = profile?.display_name ?? 'friend'
  const lines = buildWeeklyNote(stats, dominantTrait(traitsOf(companion))).map(l => fillPlaceholders(l, name))

  function close() {
    try { localStorage.setItem(READ_KEY, today) } catch { /* shown again today, fine */ }
    setClosed(true)
  }

  return (
    <m.div variants={fadeUp} initial="hidden" animate="visible" className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span aria-hidden>💌</span>}
        </div>
        <p className="text-xs font-medium text-muted">A note from {companion.name} about last week</p>
      </div>
      <div className="space-y-1.5 text-sm text-text-primary">
        {lines.map((line, i) => <p key={i}>{line}</p>)}
      </div>
      <button onClick={close} className="mt-3 w-full rounded-lg bg-surface py-2 text-sm font-medium text-text-primary">Thanks, {companion.name}</button>
    </m.div>
  )
}
