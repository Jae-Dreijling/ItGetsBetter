import { useState } from 'react'
import { useNavigate } from 'react-router'
import { format, parseISO } from 'date-fns'
import { Plus } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import Sheet from '../../components/Sheet'
import { usePeople, useContacts } from '../../hooks/useSocial'
import { getLogicalDate } from '../../lib/date'
import { GROUPS, dueSoon, dueLine, upcomingBirthdays, birthdayLine, lastContact, rhythmLabel } from '../../lib/social'
import { PersonForm, ContactButtons, THANKS } from './parts'
import { useThanks } from './useThanks'

export default function SocialPage() {
  const navigate = useNavigate()
  const people = usePeople()
  const contacts = useContacts()
  const [adding, setAdding] = useState(false)
  const [thanks, showThanks] = useThanks()
  const today = getLogicalDate()

  const due = dueSoon(people ?? [], contacts, today)
  const birthdays = upcomingBirthdays(people ?? [], today)

  return (
    <>
      <TopBar title="Social" onBack={() => navigate('/me')} />
      <PageContainer>
        {people && people.length === 0 && (
          <div className="mb-4 rounded-xl bg-card p-5 text-center shadow-sm">
            <p className="mb-1 text-3xl" aria-hidden>🫂</p>
            <p className="font-medium text-text-primary">The people you want to keep close.</p>
            <p className="mt-1 text-sm text-muted">Pick how often you'd like to see someone, and you'll get a gentle "want to plan something?" when it's been a while.</p>
          </div>
        )}

        {(due.length > 0 || birthdays.length > 0) && (
          <section className="mb-5 space-y-2">
            <h2 className="text-sm font-semibold text-muted">Coming up</h2>
            {birthdays.map(b => (
              <button key={`b${b.person.id}`} onClick={() => navigate(`/me/social/${b.person.id}`)} className="block w-full rounded-xl bg-card px-4 py-3 text-left text-sm text-text-primary shadow-sm">
                {birthdayLine(b)}
              </button>
            ))}
            {due.map(d => (
              <div key={`d${d.person.id}`} className="rounded-xl bg-card p-4 shadow-sm">
                <button onClick={() => navigate(`/me/social/${d.person.id}`)} className="mb-2 flex w-full items-start gap-2 text-left">
                  <span className="text-xl" aria-hidden>{d.person.emoji}</span>
                  <span className="text-sm text-text-primary">{dueLine(d)}</span>
                </button>
                <ContactButtons person={d.person} compact onLogged={showThanks} />
              </div>
            ))}
          </section>
        )}
        {thanks && <p className="mb-4 text-sm font-medium text-success">{THANKS}</p>}
        {people && people.length > 0 && due.length === 0 && !thanks && (
          <p className="mb-4 text-sm text-muted">Everyone's caught up for now 🌿</p>
        )}

        {GROUPS.map(group => {
          const members = (people ?? []).filter(p => p.group === group.value)
          if (members.length === 0) return null
          return (
            <section key={group.value} className="mb-4">
              <h2 className="mb-2 text-sm font-semibold text-muted">{group.label}</h2>
              <div className="space-y-1.5">
                {members.map(p => {
                  const last = lastContact(p, contacts)
                  return (
                    <button key={p.id} onClick={() => navigate(`/me/social/${p.id}`)} className="flex w-full items-center gap-3 rounded-xl bg-card px-3.5 py-2.5 text-left shadow-sm">
                      <span className="text-xl" aria-hidden>{p.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] text-text-primary">{p.name}</span>
                        <span className="block text-xs text-muted">
                          {p.rhythm_days ? rhythmLabel(p.rhythm_days) : 'No rhythm'}
                          {last ? ` · last: ${format(parseISO(last), 'd MMM')}` : ''}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}

        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary-200 py-3 text-sm font-medium text-muted hover:bg-primary-50 dark:border-primary-800"
        >
          <Plus className="h-4 w-4" /> Add someone
        </button>
      </PageContainer>

      <Sheet open={adding} onClose={() => setAdding(false)} title="Add someone">
        <PersonForm onSaved={() => setAdding(false)} />
      </Sheet>
    </>
  )
}
