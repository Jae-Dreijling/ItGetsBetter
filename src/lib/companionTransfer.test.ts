import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { EMPTY_MESSAGES } from '../hooks/useCompanion'
import { buildCompanionExport, parseCompanionFile, planCompanionImport, applyCompanionImport, withFolder } from './companionTransfer'
import type { Companion } from '../types'

function companion(name: string, values: Partial<Companion> = {}): Companion {
  return {
    name, avatar: null, is_default: false, is_active: true, personality_group_id: null,
    messages: { ...EMPTY_MESSAGES, general: [`Hi from ${name}`] }, created_at: '2026-10-01T00:00:00Z', ...values,
  }
}

async function exportedText() {
  return JSON.stringify(await buildCompanionExport())
}

describe('companion export and import', () => {
  beforeEach(clearDb)

  it('exports only the companions you made, with avatar, group and lover lines', async () => {
    const groupId = await db.personalityGroups.add({ name: 'Cheerful', description: 'Upbeat', messages: { ...EMPTY_MESSAGES, idle: ['Yay'] }, created_at: '' }) as number
    await db.personalityGroups.add({ name: 'Unused', description: '', messages: EMPTY_MESSAGES, created_at: '' })
    await db.companions.add(companion('Built-in', { is_default: true }))
    const lunaId = await db.companions.add(companion('Luna', { personality_group_id: groupId, avatar: new Blob(['png'], { type: 'image/png' }), movement: 'lively', traits: { proud: 2 } })) as number
    await db.gameCompanionAffinity.add({ companion_id: lunaId, affinity: 40, is_lover: true, lover_dialogue: ['Missed you'], home_region: 'canterlot', is_discovered: true, last_visit_at: null, created_at: '' })

    const file = await buildCompanionExport()
    expect(file.companions.map(c => c.name)).toEqual(['Luna'])
    expect(file.companions[0]).toMatchObject({ personality_group: 'Cheerful', lover_dialogue: ['Missed you'], home_region: 'canterlot', movement: 'lively' })
    expect(file.companions[0].traits).toEqual({ playful: 1, proud: 2, shy: 0, sassy: 0, romantic: 0, nerdy: 0, caring: 1 })
    const parsed = parseCompanionFile(JSON.stringify({ ...file, companions: [{ ...file.companions[0], traits: { proud: 2, sassy: 7 } }] }))
    if (!parsed.ok) throw new Error(parsed.error)
    expect(parsed.file.companions[0].traits).toEqual({ playful: 1, proud: 2, shy: 0, sassy: 0, romantic: 0, nerdy: 0, caring: 1 })
    expect(file.companions[0].avatar?.type).toBe('image/png')
    expect(file.personality_groups.map(g => g.name)).toEqual(['Cheerful'])
  })

  it('imports into another install: adds only, skips names you have, reuses groups', async () => {
    const groupId = await db.personalityGroups.add({ name: 'Cheerful', description: '', messages: EMPTY_MESSAGES, created_at: '' }) as number
    await db.companions.add(companion('Luna', { personality_group_id: groupId, avatar: new Blob(['png'], { type: 'image/png' }) }))
    await db.companions.add(companion('Rex'))
    const text = await exportedText()

    // The other install: has its own "luna" and nothing else.
    await clearDb()
    await db.companions.add(companion('luna', { messages: { ...EMPTY_MESSAGES, general: ['Mine'] } }))
    const parsed = parseCompanionFile(text)
    if (!parsed.ok) throw new Error(parsed.error)
    const plan = planCompanionImport(parsed.file, await db.companions.toArray(), await db.personalityGroups.toArray())
    expect(plan.add.map(c => c.name)).toEqual(['Rex'])
    expect(plan.skipped).toEqual(['Luna'])
    expect(await applyCompanionImport(plan)).toBe(1)

    const all = await db.companions.toArray()
    expect(all.map(c => c.name).sort()).toEqual(['Rex', 'luna'])
    expect(all.find(c => c.name === 'luna')!.messages.general).toEqual(['Mine'])
    expect(all.find(c => c.name === 'Rex')!.messages.general).toEqual(['Hi from Rex'])

    // Importing the same file again adds nothing.
    const again = planCompanionImport(parsed.file, await db.companions.toArray(), await db.personalityGroups.toArray())
    expect(again.add).toHaveLength(0)
  })

  it('brings a personality group along when needed, and the avatar survives', async () => {
    const groupId = await db.personalityGroups.add({ name: 'Cheerful', description: 'Upbeat', messages: { ...EMPTY_MESSAGES, idle: ['Yay'] }, created_at: '' }) as number
    await db.companions.add(companion('Luna', { personality_group_id: groupId, avatar: new Blob(['png-bytes'], { type: 'image/png' }) }))
    const text = await exportedText()
    await clearDb()

    const parsed = parseCompanionFile(text)
    if (!parsed.ok) throw new Error(parsed.error)
    const plan = planCompanionImport(parsed.file, [], [])
    expect(plan.newGroups.map(g => g.name)).toEqual(['Cheerful'])
    await applyCompanionImport(plan)

    const luna = (await db.companions.toArray())[0]
    const group = await db.personalityGroups.get(luna.personality_group_id!)
    expect(group?.messages.idle).toEqual(['Yay'])
    expect(await luna.avatar!.text()).toBe('png-bytes')
  })

  it("folders travel by name: reused when you have one, made when you don't", async () => {
    const folderId = await db.folders.add({ area: 'companions', name: 'Obey Me', emoji: '😈', created_at: '' }) as number
    await db.companions.add(companion('Lucifer', { folder_id: folderId }))
    await db.companions.add(companion('Kyle'))
    const text = await exportedText()

    await clearDb()
    await db.folders.add({ area: 'companions', name: 'obey me', emoji: '⭐', created_at: '' })
    const parsed = parseCompanionFile(text)
    if (!parsed.ok) throw new Error(parsed.error)
    const folders = await db.folders.toArray()
    // Kyle has no folder in the file; "put them in a folder" gives him one.
    const plan = withFolder(planCompanionImport(parsed.file, [], [], folders), 'South Park', folders)
    expect(plan.newFolders).toEqual([{ name: 'South Park', emoji: '📁' }])
    await applyCompanionImport(plan)

    const byName = new Map((await db.folders.toArray()).map(f => [f.name, f.id]))
    const all = await db.companions.toArray()
    expect(all.find(c => c.name === 'Lucifer')!.folder_id).toBe(byName.get('obey me'))
    expect(all.find(c => c.name === 'Kyle')!.folder_id).toBe(byName.get('South Park'))
  })

  it('explains a wrong file', () => {
    expect(parseCompanionFile('nope')).toMatchObject({ ok: false })
    expect(parseCompanionFile(JSON.stringify({ version: 6, tables: {} }))).toMatchObject({ ok: false })
    expect(parseCompanionFile(JSON.stringify({ format: 'itgetsbetter-companions', version: 1, companions: [] }))).toMatchObject({ ok: false })
  })
})
