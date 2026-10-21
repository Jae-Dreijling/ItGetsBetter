import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { insteadList, triggerCounts, isWin, DEFAULT_INSTEAD } from './craving'
import { finishCraving, addInsteadIdea } from '../hooks/useCravings'

describe('craving flow logic', () => {
  it('puts your own instead ideas first, without duplicates', () => {
    const list = insteadList(['Play a song', ' Make a cup of tea '])
    expect(list.slice(0, 2)).toEqual(['Play a song', 'Make a cup of tea'])
    expect(list).toHaveLength(DEFAULT_INSTEAD.length + 1)
    expect(insteadList(undefined)).toEqual(DEFAULT_INSTEAD)
  })

  it('counts triggers, most common first', () => {
    expect(triggerCounts(['bored', null, 'stressed', 'bored'])).toEqual([['bored', 2], ['stressed', 1]])
  })

  it('treats riding it out and a portion as wins, never judging the rest', () => {
    expect(isWin('passed')).toBe(true)
    expect(isWin('portion')).toBe(true)
    expect(isWin('had_it')).toBe(false)
    expect(isWin('hungry')).toBe(false)
  })
})

describe('finishing the flow', () => {
  beforeEach(clearDb)

  it('logs it, adds wins, and pays points up to three times a day', async () => {
    await finishCraving({ hungry: false, trigger: 'bored', instead: 'Five slow breaths', outcome: 'passed' })
    await finishCraving({ hungry: false, trigger: 'stressed', instead: null, outcome: 'portion' })
    await finishCraving({ hungry: false, trigger: 'tired', instead: null, outcome: 'had_it' })
    await finishCraving({ hungry: true, trigger: null, instead: null, outcome: 'hungry' })

    expect(await db.cravingEvents.count()).toBe(4)
    expect((await db.wins.toArray()).map(w => w.text)).toEqual(['Rode out a craving (bored)', 'Had a portion on purpose (stressed)'])
    expect(await db.pointsTransactions.where('source_type').equals('craving_checked').count()).toBe(3)
  })

  it('keeps your own instead ideas on the profile', async () => {
    await db.userProfile.add({ display_name: 'T' } as never)
    await addInsteadIdea('Play a song')
    await addInsteadIdea('Play a song')
    expect((await db.userProfile.toCollection().first())!.craving_instead).toEqual(['Play a song'])
  })
})
