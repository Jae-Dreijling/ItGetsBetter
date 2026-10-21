import { db } from '../db'
import { nowISO } from './date'
import { encodeBlob, decodeBlob, type EncodedBlob } from './backup'
import { EMPTY_MESSAGES } from '../hooks/useCompanion'
import type { Companion, CompanionMessages, Folder, PersonalityGroup } from '../types'
import type { CompanionMovement } from './companionMotion'
import { DEFAULT_TRAITS, OPTION_INFO, traitsOf, type CompanionTraits, type CompanionOptions, type Trait } from './companionPersonality'
import { EXPRESSIONS, type Expression } from './companionExpressions'

// Share companions between installs (or bulk-add them): export the ones you
// made, import a file that only ever *adds*. Nothing existing is changed or
// removed; a companion whose name you already have is skipped. Personality
// groups travel along and are matched by name. Game progress (affinity) stays
// personal; lover lines and home region are part of the character, so they go.
// Folders go by name too: a folder you already have is reused.
// Re-importing (a newer version of a character file) can also update the
// companions you already have: their lines are merged (nothing you wrote is
// lost), and personality, options, favourites, birthday and nicknames come
// from the file. Pictures you set, memories and closeness stay yours.

export const COMPANIONS_FORMAT = 'itgetsbetter-companions'

export interface CompanionFileEntry {
  name: string
  avatar: EncodedBlob | null
  personality_group: string | null
  messages: CompanionMessages
  lover_dialogue: string[]
  home_region: string | null
  // Optional; files from before this was added mean calm.
  movement?: CompanionMovement
  // The folder's name (lib/folders); optional, missing means none.
  folder?: string | null
  // Personality (lib/companionPersonality); optional, missing means the defaults.
  traits?: CompanionTraits
  // Its own favourites by memory topic (lib/companionMemory); optional. What
  // it remembers about you stays personal and is never exported.
  about?: Record<string, string>
  // On or off by hand (lib/companionPersonality); optional.
  options?: CompanionOptions
  // "MM-DD"; optional.
  birthday?: string | null
  // Optional extra pictures per expression (lib/companionExpressions).
  expressions?: Partial<Record<Expression, EncodedBlob>>
}

export interface CompanionFile {
  format: typeof COMPANIONS_FORMAT
  version: 1
  exported_at: string
  personality_groups: { name: string; description: string; messages: CompanionMessages }[]
  // The folders the companions are in, for their emoji. Optional.
  folders?: { name: string; emoji: string }[]
  companions: CompanionFileEntry[]
}

const key = (name: string) => name.trim().toLowerCase()
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string' && s.trim() !== '') : [])

// Only known message categories, each a list of strings; missing ones are empty.
function cleanMessages(v: unknown): CompanionMessages {
  const source = isObj(v) ? v : {}
  const messages = { ...EMPTY_MESSAGES }
  for (const k of Object.keys(EMPTY_MESSAGES) as (keyof CompanionMessages)[]) messages[k] = strings(source[k])
  return messages
}

// Only known traits, each 0, 1 or 2; anything else is left out.
function cleanTraits(v: unknown): CompanionTraits | undefined {
  if (!isObj(v)) return undefined
  const traits = { ...DEFAULT_TRAITS }
  for (const t of Object.keys(DEFAULT_TRAITS) as Trait[]) {
    if (v[t] === 0 || v[t] === 1 || v[t] === 2) traits[t] = v[t]
  }
  return traits
}

// The companions you made (not the built-in one), ready to save as a file.
export async function buildCompanionExport(): Promise<CompanionFile> {
  const companions = (await db.companions.toArray()).filter(c => !c.is_default)
  const groups = await db.personalityGroups.toArray()
  const affinities = await db.gameCompanionAffinity.toArray()
  const groupName = new Map(groups.map(g => [g.id!, g.name]))
  const folders = await db.folders.where('area').equals('companions').toArray()
  const folderOf = (id: number | null | undefined) => folders.find(f => f.id === id)
  const usedGroups = new Set(companions.map(c => c.personality_group_id).filter((id): id is number => id !== null))

  return {
    format: COMPANIONS_FORMAT,
    version: 1,
    exported_at: nowISO(),
    personality_groups: groups
      .filter(g => usedGroups.has(g.id!))
      .map(g => ({ name: g.name, description: g.description, messages: g.messages })),
    folders: folders
      .filter(f => companions.some(c => c.folder_id === f.id))
      .map(f => ({ name: f.name, emoji: f.emoji })),
    companions: await Promise.all(companions.map(async c => {
      const affinity = affinities.find(a => a.companion_id === c.id)
      return {
        name: c.name,
        avatar: c.avatar ? await encodeBlob(c.avatar) : null,
        personality_group: c.personality_group_id !== null ? groupName.get(c.personality_group_id) ?? null : null,
        messages: c.messages,
        lover_dialogue: affinity?.lover_dialogue ?? [],
        home_region: affinity?.home_region ?? null,
        movement: c.movement ?? 'calm',
        folder: folderOf(c.folder_id)?.name ?? null,
        traits: traitsOf(c),
        about: c.about ?? {},
        options: c.options ?? {},
        birthday: c.birthday ?? null,
        expressions: Object.fromEntries(await Promise.all(Object.entries(c.expressions ?? {}).map(async ([k, blob]) => [k, await encodeBlob(blob as Blob)]))),
      }
    })),
  }
}

export type ParsedCompanions = { ok: true; file: CompanionFile } | { ok: false, error: string }

export function parseCompanionFile(raw: string): ParsedCompanions {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { ok: false, error: "This file isn't readable. Was it made with \"Export my companions\"?" }
  }
  if (!isObj(data) || data.format !== COMPANIONS_FORMAT) {
    return { ok: false, error: "This isn't an ItGetsBetter companions file. (A full backup goes through Backup & Restore.)" }
  }
  if (data.version !== 1) return { ok: false, error: `This file is version ${String(data.version)}; this app reads version 1.` }

  const companions: CompanionFileEntry[] = (Array.isArray(data.companions) ? data.companions : [])
    .filter(isObj)
    .filter(c => typeof c.name === 'string' && c.name.trim() !== '')
    .map(c => {
      const avatar = isObj(c.avatar) && c.avatar.__blob === true && typeof c.avatar.base64 === 'string' ? c.avatar as unknown as EncodedBlob : null
      return {
        name: String(c.name).trim(),
        avatar,
        personality_group: typeof c.personality_group === 'string' && c.personality_group.trim() ? c.personality_group.trim() : null,
        messages: cleanMessages(c.messages),
        lover_dialogue: strings(c.lover_dialogue),
        home_region: typeof c.home_region === 'string' ? c.home_region : null,
        movement: c.movement === 'still' || c.movement === 'lively' ? c.movement : 'calm',
        folder: typeof c.folder === 'string' && c.folder.trim() ? c.folder.trim() : null,
        traits: cleanTraits(c.traits),
        about: isObj(c.about) ? Object.fromEntries(Object.entries(c.about).filter((e): e is [string, string] => typeof e[1] === 'string' && e[1].trim() !== '')) : undefined,
        options: isObj(c.options)
          ? Object.fromEntries(Object.entries(c.options).filter(([k, v]) => OPTION_INFO.some(o => o.option === k) && typeof v === 'boolean'))
          : undefined,
        birthday: typeof c.birthday === 'string' && /^\d{2}-\d{2}$/.test(c.birthday) ? c.birthday : null,
        expressions: isObj(c.expressions)
          ? Object.fromEntries(Object.entries(c.expressions).filter(([k, v]) => EXPRESSIONS.some(e => e.key === k) && isObj(v) && v.__blob === true)) as Partial<Record<Expression, EncodedBlob>>
          : undefined,
      }
    })
  if (companions.length === 0) return { ok: false, error: 'This file has no companions in it.' }

  const personality_groups = (Array.isArray(data.personality_groups) ? data.personality_groups : [])
    .filter(isObj)
    .filter(g => typeof g.name === 'string' && g.name.trim() !== '')
    .map(g => ({ name: String(g.name).trim(), description: typeof g.description === 'string' ? g.description : '', messages: cleanMessages(g.messages) }))

  const folders = (Array.isArray(data.folders) ? data.folders : [])
    .filter(isObj)
    .filter(f => typeof f.name === 'string' && f.name.trim() !== '')
    .map(f => ({ name: String(f.name).trim(), emoji: typeof f.emoji === 'string' && f.emoji ? f.emoji : '📁' }))

  return { ok: true, file: { format: COMPANIONS_FORMAT, version: 1, exported_at: String(data.exported_at ?? ''), personality_groups, folders, companions } }
}

export interface CompanionImportPlan {
  add: CompanionFileEntry[]
  // Names skipped because a companion with that name already exists (or
  // appears twice in the file).
  skipped: string[]
  // The skipped ones you already have, which an update can refresh.
  update: CompanionFileEntry[]
  newGroups: CompanionFile['personality_groups']
  // Folders the file uses that you don't have yet; made on import.
  newFolders: { name: string; emoji: string }[]
}

export function planCompanionImport(file: CompanionFile, existing: Companion[], existingGroups: PersonalityGroup[], existingFolders: Folder[] = []): CompanionImportPlan {
  const have = new Set(existing.map(c => key(c.name)))
  const taken = new Set(have)
  const add: CompanionFileEntry[] = []
  const update: CompanionFileEntry[] = []
  const skipped: string[] = []
  for (const c of file.companions) {
    if (taken.has(key(c.name))) {
      skipped.push(c.name)
      if (have.has(key(c.name)) && !update.some(u => key(u.name) === key(c.name))) update.push(c)
    } else {
      add.push(c)
      taken.add(key(c.name))
    }
  }
  const groupNames = new Set(existingGroups.map(g => key(g.name)))
  const needed = new Set([...add, ...update].map(c => c.personality_group).filter((n): n is string => !!n).map(key))
  const newGroups = file.personality_groups.filter(g => needed.has(key(g.name)) && !groupNames.has(key(g.name)))
  const folderNames = new Set(existingFolders.map(f => key(f.name)))
  const newFolders: CompanionImportPlan['newFolders'] = []
  for (const name of [...add, ...update].map(c => c.folder).filter((n): n is string => !!n)) {
    if (folderNames.has(key(name))) continue
    folderNames.add(key(name))
    newFolders.push({ name, emoji: file.folders?.find(f => key(f.name) === key(name))?.emoji ?? '📁' })
  }
  return { add, skipped, update, newGroups, newFolders }
}

// Lines per moment: what's there, plus the file's new ones.
function mergeMessages(mine: CompanionMessages, theirs: CompanionMessages): CompanionMessages {
  const merged = { ...mine }
  for (const k of Object.keys(theirs) as (keyof CompanionMessages)[]) {
    const lines = [...(mine[k] ?? []), ...(theirs[k] ?? [])]
    merged[k] = lines.filter((l, i) => lines.indexOf(l) === i)
  }
  return merged
}

// "Put them all in a folder" on import: every companion without a folder of
// its own goes into this one (made if it doesn't exist yet).
export function withFolder(plan: CompanionImportPlan, name: string, existingFolders: Folder[]): CompanionImportPlan {
  const folder = name.trim()
  if (!folder) return plan
  const add = plan.add.map(c => (c.folder ? c : { ...c, folder }))
  const exists = existingFolders.some(f => key(f.name) === key(folder)) || plan.newFolders.some(f => key(f.name) === key(folder))
  return { ...plan, add, newFolders: exists ? plan.newFolders : [...plan.newFolders, { name: folder, emoji: '📁' }] }
}

// Adds the planned companions (and groups they need) in one go, and with
// update on, refreshes the ones you already have. Imported companions start
// switched on, like a newly made one.
export async function applyCompanionImport(plan: CompanionImportPlan, { update = false } = {}): Promise<number> {
  await db.transaction('rw', [db.companions, db.personalityGroups, db.gameCompanionAffinity, db.folders], async () => {
    for (const f of plan.newFolders) await db.folders.add({ area: 'companions', name: f.name, emoji: f.emoji, created_at: nowISO() })
    const folderId = new Map((await db.folders.where('area').equals('companions').toArray()).map(f => [key(f.name), f.id!]))

    for (const g of plan.newGroups) {
      await db.personalityGroups.add({ name: g.name, description: g.description, messages: g.messages, created_at: nowISO() })
    }
    const groups = await db.personalityGroups.toArray()
    const groupId = new Map(groups.map(g => [key(g.name), g.id!]))

    for (const c of plan.add) {
      const id = await db.companions.add({
        name: c.name,
        avatar: c.avatar ? decodeBlob(c.avatar) : null,
        is_default: false,
        is_active: true,
        personality_group_id: c.personality_group ? groupId.get(key(c.personality_group)) ?? null : null,
        messages: c.messages,
        movement: c.movement ?? 'calm',
        folder_id: c.folder ? folderId.get(key(c.folder)) ?? null : null,
        ...(c.traits && { traits: c.traits }),
        ...(c.about && Object.keys(c.about).length > 0 && { about: c.about }),
        ...(c.options && Object.keys(c.options).length > 0 && { options: c.options }),
        ...(c.birthday && { birthday: c.birthday }),
        ...(c.expressions && Object.keys(c.expressions).length > 0 && {
          expressions: Object.fromEntries(Object.entries(c.expressions).map(([k, v]) => [k, decodeBlob(v as EncodedBlob)])),
        }),
        created_at: nowISO(),
      }) as number
      if (c.lover_dialogue.length > 0 || c.home_region) {
        await db.gameCompanionAffinity.add({
          companion_id: id,
          affinity: 0,
          is_lover: false,
          lover_dialogue: c.lover_dialogue,
          home_region: c.home_region ?? 'ponyville',
          is_discovered: false,
          last_visit_at: null,
          created_at: nowISO(),
        })
      }
    }

    if (!update) return
    const mine = await db.companions.toArray()
    for (const c of plan.update) {
      const current = mine.find(m => key(m.name) === key(c.name))
      if (!current) continue
      const expressions = { ...Object.fromEntries(Object.entries(c.expressions ?? {}).map(([k, v]) => [k, decodeBlob(v as EncodedBlob)])), ...current.expressions }
      await db.companions.update(current.id!, {
        messages: mergeMessages(current.messages, c.messages),
        ...(c.traits && { traits: c.traits }),
        ...(c.options && { options: c.options }),
        ...(c.about && Object.keys(c.about).length > 0 && { about: { ...current.about, ...c.about } }),
        ...(c.birthday && { birthday: c.birthday }),
        ...(!current.avatar && c.avatar && { avatar: decodeBlob(c.avatar) }),
        ...(Object.keys(expressions).length > 0 && { expressions }),
        ...(current.folder_id == null && c.folder && { folder_id: folderId.get(key(c.folder)) ?? null }),
        ...(current.personality_group_id == null && c.personality_group && { personality_group_id: groupId.get(key(c.personality_group)) ?? null }),
      })
      const bond = await db.gameCompanionAffinity.where('companion_id').equals(current.id!).first()
      if (bond) {
        const lines = [...bond.lover_dialogue, ...c.lover_dialogue]
        await db.gameCompanionAffinity.update(bond.id!, { lover_dialogue: lines.filter((l, i) => lines.indexOf(l) === i) })
      } else if (c.lover_dialogue.length > 0 || c.home_region) {
        await db.gameCompanionAffinity.add({
          companion_id: current.id!, affinity: 0, is_lover: false, lover_dialogue: c.lover_dialogue, home_region: c.home_region ?? 'ponyville',
          is_discovered: false, last_visit_at: null, created_at: nowISO(),
        })
      }
    }
  })
  return plan.add.length + (update ? plan.update.length : 0)
}
