import { describe, it, expect } from 'vitest'
import { lastContact, dueDate, dueSoon, dueLine, nextBirthday, upcomingBirthdays, birthdayLine, socialReminders } from './social'
import type { Person, SocialContact } from '../types'

function person(id: number, values: Partial<Person> = {}): Person {
  return {
    id, name: `P${id}`, emoji: '🙂', group: 'friend', birthday: null, birth_year: null, notes: null,
    rhythm_days: 14, prefer: 'either', archived: false, created_at: '2026-09-01T10:00:00Z', ...values,
  }
}
const contact = (person_id: number, date: string, kind: SocialContact['kind'] = 'talked'): SocialContact =>
  ({ person_id, date, kind, logged_at: date })

describe('social rhythm', () => {
  it('counts from the last contact, or from when the person was added', () => {
    expect(dueDate(person(1), [])).toBe('2026-09-15')
    expect(dueDate(person(1), [contact(1, '2026-10-01'), contact(1, '2026-10-10')])).toBe('2026-10-24')
    expect(dueDate(person(1, { rhythm_days: null }), [])).toBeNull()
  })

  it('only counts meeting up for people you prefer to see in person', () => {
    const p = person(1, { prefer: 'in_person' })
    expect(lastContact(p, [contact(1, '2026-10-01', 'saw'), contact(1, '2026-10-10', 'talked')])).toBe('2026-10-01')
  })

  it('lists who is due or coming up, longest wait first, warmly', () => {
    const people = [person(1), person(2, { name: 'Sam' }), person(3, { name: 'Ana' }), person(4, { archived: true })]
    const contacts = [contact(1, '2026-10-15'), contact(2, '2026-09-20'), contact(3, '2026-10-08')]
    const due = dueSoon(people, contacts, '2026-10-20')
    // P1 due 29 Oct (not soon), Ana due 22 Oct (in 2 days), Sam due 4 Oct.
    expect(due.map(d => [d.person.name, d.daysUntil])).toEqual([['Sam', -16], ['Ana', 2]])
    expect(dueLine(due[0])).toBe("It's been a while since you caught up with Sam. Want to plan something?")
    expect(dueLine(due[1])).toBe('Coming up with Ana in 2 days.')
  })
})

describe('birthdays', () => {
  it('finds the next birthday, rolling into next year', () => {
    expect(nextBirthday('11-02', '2026-10-20')).toBe('2026-11-02')
    expect(nextBirthday('10-20', '2026-10-20')).toBe('2026-10-20')
    expect(nextBirthday('03-01', '2026-10-20')).toBe('2027-03-01')
    expect(nextBirthday('02-29', '2026-10-20')).toBe('2027-02-28')
    expect(nextBirthday('02-29', '2027-10-20')).toBe('2028-02-29')
  })

  it('lists upcoming birthdays with the age they turn', () => {
    const people = [person(1, { name: 'Mo', birthday: '10-21', birth_year: 1996 }), person(2, { birthday: '12-25' })]
    const upcoming = upcomingBirthdays(people, '2026-10-20')
    expect(upcoming).toHaveLength(1)
    expect(birthdayLine(upcoming[0])).toBe("Mo's birthday is tomorrow (30) 🎂")
  })
})

describe('social reminders', () => {
  it('nudges once, three days before someone is due, and around birthdays', () => {
    const people = [person(1, { name: 'Sam' }), person(2, { name: 'Mo', birthday: '10-24', rhythm_days: null })]
    const contacts = [contact(1, '2026-10-10')] // Sam due 24 Oct
    const dates = ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24']
    const r = socialReminders(people, contacts, dates)
    expect(r.get('2026-10-21')).toEqual(['Maybe plan something with Sam this week?'])
    expect(r.get('2026-10-23')).toEqual(["Mo's birthday is tomorrow 🎂"])
    expect(r.get('2026-10-24')).toEqual(["It's Mo's birthday today 🎂"])
    expect(r.has('2026-10-20')).toBe(false)
  })

  it("doesn't repeat for someone who stays due", () => {
    const r = socialReminders([person(1)], [contact(1, '2026-09-01')], ['2026-10-20', '2026-10-21'])
    expect(r.size).toBe(0)
  })
})
