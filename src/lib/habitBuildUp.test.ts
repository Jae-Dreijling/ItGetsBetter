import { describe, it, expect, beforeEach } from 'vitest'
import { addDays, format, parseISO } from 'date-fns'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { pickHabitPrompt, score, fillLine } from './habitBuildUp'
import { answerSettled, markHabitBuilt, callBackHabit, snoozeHabitPrompt } from '../hooks/useHabitBuildUp'
import type { Habit } from '../types'

const TODAY = '2026-10-21'
const back = (n: number) => format(addDays(parseISO(TODAY), -n), 'yyyy-MM-dd')

function habit(id: number, values: Partial<Habit> = {}): Habit {
  return {
    id, title: `Habit ${id}`, label_ids: [], frequency: 'daily', custom_days: [], cant_fail_description: null, progression: null,
    chain_id: null, chain_order: 0, is_active: true, is_queued: false, activated_at: `${back(40)}T12:00:00`, created_at: '', ...values,
  }
}

// Done on every day from `from` days ago up to yesterday, except the skipped ones.
const doneDays = (from: number, skip: number[] = []) => new Set(Array.from({ length: from }, (_, i) => i + 1).filter(n => !skip.includes(n)).map(back))

describe('scoring a habit', () => {
  it('counts only scheduled days for custom habits, and weeks for weekly ones', () => {
    const done = doneDays(30)
    expect(score({ frequency: 'daily', custom_days: [] }, done, back(1))).toEqual({ done: 30, total: 30 })
    const mondays = score({ frequency: 'custom', custom_days: ['mon'] }, done, back(1))!
    expect(mondays.total).toBeGreaterThanOrEqual(4)
    expect(mondays.done).toBe(mondays.total)
    expect(score({ frequency: 'weekly', custom_days: [] }, new Set([back(3), back(20)]), back(1))).toEqual({ done: 2, total: 4 })
    expect(score({ frequency: 'monthly', custom_days: [] }, done, back(1))).toBeNull()
  })
})

describe('which question to ask', () => {
  it('asks to take on another habit after a month at 70%', () => {
    // 26 of 30 days, like the example.
    const prompt = pickHabitPrompt([habit(1)], new Map([[1, doneDays(30, [3, 9, 15, 22])]]), TODAY)!
    expect(prompt.kind).toBe('settled')
    expect(prompt.score).toEqual({ done: 26, total: 30 })
  })

  it('waits a full month, and stays quiet below 70%', () => {
    expect(pickHabitPrompt([habit(1, { activated_at: `${back(20)}T12:00:00` })], new Map([[1, doneDays(20)]]), TODAY)).toBeNull()
    const skip = Array.from({ length: 10 }, (_, i) => i * 3 + 1)
    expect(pickHabitPrompt([habit(1)], new Map([[1, doneDays(30, skip)]]), TODAY)).toBeNull()
  })

  it('a morning without today done is not held against you', () => {
    // Done every day but today: still 30 of 30 up to yesterday.
    expect(pickHabitPrompt([habit(1)], new Map([[1, doneDays(30)]]), TODAY)!.score).toEqual({ done: 30, total: 30 })
  })

  it('asks only once after you answered, and not while snoozed', () => {
    const done = new Map([[1, doneDays(30)]])
    expect(pickHabitPrompt([habit(1, { settled_at: 'x' })], done, TODAY)).toBeNull()
    expect(pickHabitPrompt([habit(1, { prompt_snooze_until: back(-3) })], done, TODAY)).toBeNull()
    expect(pickHabitPrompt([habit(1, { prompt_snooze_until: TODAY })], done, TODAY)).not.toBeNull()
  })

  it('calls it built at 90% two months in a row, before anything else', () => {
    const habits = [habit(1, { activated_at: `${back(70)}T12:00:00`, settled_at: 'x' }), habit(2)]
    const done = new Map([[1, doneDays(60, [5, 40])], [2, doneDays(30)]])
    const prompt = pickHabitPrompt(habits, done, TODAY)!
    expect(prompt.kind).toBe('built')
    expect(prompt.habit.id).toBe(1)
    // One weak month in between is not built yet.
    const weak = new Map([[1, doneDays(60, [35, 38, 41, 44, 47, 50])]])
    expect(pickHabitPrompt([habits[0]], weak, TODAY)).toBeNull()
  })

  it('fills in the line', () => {
    expect(fillLine('{name}: {habit} {done}/{total}, {name}!', { name: 'Jae', habit: 'Water', done: 26, total: 30 })).toBe('Jae: Water 26/30, Jae!')
  })
})

describe('answering', () => {
  beforeEach(clearDb)

  it('taking on a queued habit starts it, and the settled one stops asking', async () => {
    await db.habits.bulkAdd([habit(1), habit(2, { is_active: false, is_queued: true, activated_at: null })])
    await answerSettled(1, 2)
    expect((await db.habits.get(1))!.settled_at).toBeTruthy()
    expect(await db.habits.get(2)).toMatchObject({ is_active: true, is_queued: false })
  })

  it('a built habit leaves the list with a win, and can be called back', async () => {
    await db.habits.add(habit(1, { is_floor: true }))
    await markHabitBuilt((await db.habits.get(1))!)
    expect(await db.habits.get(1)).toMatchObject({ is_active: false, is_floor: false })
    expect((await db.wins.toArray()).map(w => w.text)).toEqual(['Made “Habit 1” a real habit'])

    await callBackHabit(1)
    expect(await db.habits.get(1)).toMatchObject({ is_active: true, built_at: null, settled_at: null })
  })

  it('"not yet" waits two weeks', async () => {
    await db.habits.add(habit(1))
    await snoozeHabitPrompt(1, 14)
    expect((await db.habits.get(1))!.prompt_snooze_until! > TODAY).toBe(true)
  })
})
