import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { getLogicalDate } from '../../lib/date'
import { backAfterBreak } from '../../lib/why'
import ReasonCard from '../ReasonCard'

// After a few days away: a warm hello and one of your reasons, for that day
// only. Never says how long it's been (Rulebook 5.2).
export default function WelcomeBackCard() {
  const today = getLogicalDate()
  const dates = useLiveQuery(async () => [...new Set((await db.appOpenLog.toArray()).map(o => o.date))], [])
  if (!dates || !backAfterBreak(dates, today)) return null
  return <ReasonCard seed={`back:${today}`} intro="Good to see you. One of your reasons" className="mb-4 bg-card shadow-sm" />
}
