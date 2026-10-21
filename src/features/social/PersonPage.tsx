import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { format, parseISO } from 'date-fns'
import { Pencil, X } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import Sheet from '../../components/Sheet'
import { usePerson, useContacts, logContact, deleteContact, archivePerson, deletePerson } from '../../hooks/useSocial'
import { getLogicalDate } from '../../lib/date'
import { GROUPS, rhythmLabel, lastContact, dueDate, nextBirthday } from '../../lib/social'
import { PersonForm, ContactButtons } from './parts'
import type { Person } from '../../types'

export default function PersonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const person = usePerson(Number(id))

  return (
    <>
      <TopBar title={person ? person.name : 'Person'} onBack={() => navigate('/me/social')} />
      <PageContainer>
        {person === undefined ? null : person === null ? (
          <p className="py-8 text-center text-sm text-muted">This person isn't on your list anymore.</p>
        ) : (
          <PersonDetails person={person} onGone={() => navigate('/me/social', { replace: true })} />
        )}
      </PageContainer>
    </>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-primary-100 py-2.5 text-sm dark:border-primary-900">
      <span className="text-muted">{label}</span>
      <span className="text-right text-text-primary">{value}</span>
    </div>
  )
}

function PersonDetails({ person, onGone }: { person: Person; onGone: () => void }) {
  const contacts = useContacts(person.id)
  const [editing, setEditing] = useState(false)
  const [earlierDate, setEarlierDate] = useState('')
  const [confirm, setConfirm] = useState<'archive' | 'delete' | null>(null)
  const today = getLogicalDate()

  const last = lastContact(person, contacts)
  const due = dueDate(person, contacts)

  async function act(which: 'archive' | 'delete') {
    if (confirm !== which) return setConfirm(which)
    if (which === 'archive') await archivePerson(person.id!)
    else await deletePerson(person.id!)
    onGone()
  }

  return (
    <div>
      <div className="mb-4 rounded-xl bg-card p-5 text-center shadow-sm">
        <p className="text-4xl" aria-hidden>{person.emoji}</p>
        <p className="mt-1 text-xl font-semibold text-text-primary">{person.name}</p>
        <p className="mb-4 text-sm text-muted">{GROUPS.find(g => g.value === person.group)?.label}</p>
        <ContactButtons person={person} />
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted">
          Earlier?
          <input type="date" value={earlierDate} max={today} onChange={e => setEarlierDate(e.target.value)} className="rounded-md bg-surface px-2 py-1 text-text-primary" aria-label="Date of an earlier contact" />
          {earlierDate && (
            <>
              <button onClick={() => { logContact(person.id!, 'saw', earlierDate); setEarlierDate('') }} className="font-medium text-primary-500">Saw</button>
              <button onClick={() => { logContact(person.id!, 'talked', earlierDate); setEarlierDate('') }} className="font-medium text-primary-500">Talked</button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <Info label="Rhythm" value={person.rhythm_days ? `${rhythmLabel(person.rhythm_days)}${person.prefer === 'in_person' ? ', in person' : ''}` : 'No rhythm'} />
        <Info label="Last time" value={last ? format(parseISO(last), 'EEE d MMM') : 'Nothing logged yet'} />
        {due && <Info label="Nice to connect again" value={due <= today ? 'Whenever suits you' : `Around ${format(parseISO(due), 'd MMM')}`} />}
        {person.birthday && (
          <Info
            label="Birthday"
            value={`${format(parseISO(nextBirthday(person.birthday, today)), 'd MMMM')}${person.birth_year ? ` (${parseISO(nextBirthday(person.birthday, today)).getFullYear() - person.birth_year})` : ''}`}
          />
        )}
      </div>

      {person.notes && (
        <section className="mb-4 rounded-xl bg-card p-4 shadow-sm">
          <p className="mb-0.5 text-xs font-medium text-muted">Notes</p>
          <p className="whitespace-pre-line text-sm text-text-primary">{person.notes}</p>
        </section>
      )}

      {contacts.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-sm font-semibold text-muted">Times together</h2>
          <div className="space-y-1">
            {[...contacts].reverse().slice(0, 30).map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm shadow-sm">
                <span className="text-text-primary">
                  {format(parseISO(c.date), 'EEE d MMM')}
                  <span className="text-muted"> · {c.kind === 'saw' ? 'saw them' : 'talked'}</span>
                </span>
                <button onClick={() => deleteContact(c.id!)} className="p-1 text-muted hover:text-text-primary" aria-label="Remove, logged by mistake">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-1 border-t border-primary-100 pt-3 dark:border-primary-900">
        <button onClick={() => setEditing(true)} className="flex w-full items-center justify-center gap-1.5 py-2 text-sm text-muted hover:text-text-primary">
          <Pencil className="h-4 w-4" /> Edit
        </button>
        <button onClick={() => act('archive')} className="w-full py-2 text-sm text-muted hover:text-text-primary">
          {confirm === 'archive' ? 'Tap again to take them off the list (history is kept)' : 'Take off the list'}
        </button>
        <button onClick={() => act('delete')} className="w-full py-2 text-sm text-muted hover:text-danger">
          {confirm === 'delete' ? 'Tap again to delete them and their history' : 'Delete'}
        </button>
      </div>

      <Sheet open={editing} onClose={() => setEditing(false)} title={`Edit ${person.name}`}>
        <PersonForm person={person} onSaved={() => setEditing(false)} />
      </Sheet>
    </div>
  )
}
