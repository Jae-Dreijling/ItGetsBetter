import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { updateLoverDialogue, setLoverStatus, getCompanionAffinityRecord } from './game'

describe('updateLoverDialogue', () => {
  beforeEach(clearDb)

  it('creates an affinity record when none exists yet (regression: used to silently no-op)', async () => {
    await updateLoverDialogue(42, ['Hello there'])
    const record = await getCompanionAffinityRecord(42)
    expect(record?.lover_dialogue).toEqual(['Hello there'])
  })

  it('updates lover_dialogue on an existing record without resetting other fields', async () => {
    await db.gameCompanionAffinity.add({
      companion_id: 7,
      affinity: 55,
      is_lover: true,
      lover_dialogue: ['old line'],
      home_region: 'ponyville',
      is_discovered: true,
      last_visit_at: null,
      created_at: new Date().toISOString(),
    })
    await updateLoverDialogue(7, ['new line 1', 'new line 2'])
    const record = await getCompanionAffinityRecord(7)
    expect(record?.lover_dialogue).toEqual(['new line 1', 'new line 2'])
    expect(record?.affinity).toBe(55)
    expect(record?.is_lover).toBe(true)
  })
})

describe('setLoverStatus', () => {
  beforeEach(clearDb)

  it('sets is_lover on an existing affinity record', async () => {
    await db.gameCompanionAffinity.add({
      companion_id: 3,
      affinity: 100,
      is_lover: false,
      lover_dialogue: [],
      home_region: 'ponyville',
      is_discovered: true,
      last_visit_at: null,
      created_at: new Date().toISOString(),
    })
    await setLoverStatus(3, true)
    const record = await getCompanionAffinityRecord(3)
    expect(record?.is_lover).toBe(true)
  })
})
