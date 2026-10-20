import { useState } from 'react'
import { savePerson, logContact } from '../../hooks/useSocial'
import { RHYTHMS, GROUPS } from '../../lib/social'
import type { Person, SocialContact } from '../../types'

const EMOJIS = ['🙂', '😊', '🥰', '💞', '👩', '👨', '🧑', '👵', '👴', '🐶']
const inputClass = 'w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none dark:border-primary-900'
const chip = (on: boolean) => `rounded-full px-3 py-1 text-sm transition-colors ${on ? 'bg-primary-500 text-white' : 'bg-surface text-muted'}`

export function PersonForm({ person, onSaved }: { person?: Person; onSaved: (id: number) => void }) {
  const [emoji, setEmoji] = useState(person?.emoji ?? EMOJIS[0])
  const [name, setName] = useState(person?.name ?? '')
  const [group, setGroup] = useState<Person['group']>(person?.group ?? 'friend')
  const [rhythm, setRhythm] = useState<number | null>(person ? person.rhythm_days : 30)
  const [prefer, setPrefer] = useState<Person['prefer']>(person?.prefer ?? 'either')
  // Birthday as a date input; the year is optional.
  const [birthday, setBirthday] = useState(person?.birthday ? `${person.birth_year ?? 2000}-${person.birthday}` : '')
  const [knowYear, setKnowYear] = useState(person ? person.birth_year !== null : true)
  const [notes, setNotes] = useState(person?.notes ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const id = await savePerson({
      name: name.trim(),
      emoji,
      group,
      rhythm_days: rhythm,
      prefer,
      birthday: birthday ? birthday.slice(5) : null,
      birth_year: birthday && knowYear ? Number(birthday.slice(0, 4)) : null,
      notes: notes.trim() || null,
    }, person?.id)
    onSaved(id)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {EMOJIS.map(e => (
          <button key={e} type="button" onClick={() => setEmoji(e)} aria-pressed={emoji === e}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${emoji === e ? 'bg-primary-100 ring-2 ring-primary-400' : 'bg-surface'}`}>
            {e}
          </button>
        ))}
      </div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className={inputClass} autoFocus={!person} />
      <div className="flex flex-wrap gap-1.5">
        {GROUPS.map(g => <button key={g.value} type="button" onClick={() => setGroup(g.value)} className={chip(group === g.value)}>{g.label}</button>)}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">How often would you like to connect?</p>
        <div className="flex flex-wrap gap-1.5">
          {RHYTHMS.map(r => <button key={r.label} type="button" onClick={() => setRhythm(r.days)} className={chip(rhythm === r.days)}>{r.label}</button>)}
        </div>
      </div>
      {rhythm !== null && (
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setPrefer('either')} className={chip(prefer === 'either')}>Calls & texts count</button>
          <button type="button" onClick={() => setPrefer('in_person')} className={chip(prefer === 'in_person')}>Only meeting up counts</button>
        </div>
      )}
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Birthday (optional)</p>
        <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className={inputClass} aria-label="Birthday" />
        {birthday && (
          <label className="mt-1.5 flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={!knowYear} onChange={e => setKnowYear(!e.target.checked)} className="h-4 w-4 accent-primary-500" />
            I don't know the year
          </label>
        )}
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes, like 'likes board games' (optional)" rows={2} className={inputClass} />
      <button type="submit" disabled={!name.trim()} className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50">
        {person ? 'Save' : 'Add person'}
      </button>
    </form>
  )
}

export const THANKS = 'Logged. Time with people counts 🌟'

// "Saw them" / "Talked" in one tap, with a moment of thanks. Where logging
// makes the person drop off the list, the list shows the thanks via onLogged.
export function ContactButtons({ person, compact = false, onLogged }: { person: Person; compact?: boolean; onLogged?: () => void }) {
  const [logged, setLogged] = useState<SocialContact['kind'] | null>(null)

  async function log(kind: SocialContact['kind']) {
    await logContact(person.id!, kind)
    onLogged?.()
    setLogged(kind)
    setTimeout(() => setLogged(null), 2500)
  }

  if (logged) {
    return <p className={`text-center text-sm font-medium text-success ${compact ? 'py-1.5' : 'py-2'}`}>{THANKS}</p>
  }
  const button = `flex-1 rounded-lg text-sm font-medium ${compact ? 'py-1.5' : 'py-2'}`
  return (
    <div className="flex gap-2">
      <button onClick={() => log('saw')} className={`${button} bg-primary-100 text-primary-700`}>Saw them</button>
      <button onClick={() => log('talked')} className={`${button} bg-surface text-muted`}>Talked</button>
    </div>
  )
}
