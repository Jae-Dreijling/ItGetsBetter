import { useState, useEffect } from 'react'
import { AlertTriangle, Save, Trash2 } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { db } from '../../db'
import { useGameState, useActiveQuests, useCompanionAffinities } from '../../hooks/useGame'
import { useCompanions } from '../../hooks/useCompanion'
import { GUILD_ROOMS } from '../../lib/game'
import { BOSSES } from '../../lib/bosses'
import type { Companion, GameCompanionAffinity, GameQuest, GameQuestStatus } from '../../types'

const REGIONS = [
  { id: 'traveler', label: 'Traveler' },
  { id: 'ponyville', label: 'Ponyville' },
  { id: 'canterlot', label: 'Canterlot' },
  { id: 'cloudsdale', label: 'Cloudsdale' },
  { id: 'everfree_forest', label: 'Everfree Forest' },
  { id: 'crystal_empire', label: 'Crystal Empire' },
  { id: 'manehattan', label: 'Manehattan' },
  { id: 'appleloosa', label: 'Appleloosa' },
  { id: 'las_pegasus', label: 'Las Pegasus' },
  { id: 'griffonstone', label: 'Griffonstone' },
  { id: 'dragon_lands', label: 'Dragon Lands' },
]

function guildKey(roomId: string) {
  return `igb_guild_${roomId}`
}

function bossKey(bossId: string) {
  return `igb_boss_${bossId}_won`
}

export default function DevToolsPage() {
  const gameState = useGameState()
  const activeQuests = useActiveQuests()
  const affinities = useCompanionAffinities()
  const companions = useCompanions()

  return (
    <>
      <TopBar title="Dev Tools" />
      <PageContainer>
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-warning/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-warning shrink-0" />
          <p className="text-sm text-text-primary">
            Direct edits to your journey data. Changes apply immediately and skip normal game rules — use this to fix data after a bad restore, not as a shortcut.
          </p>
        </div>

        {gameState && <GameStateEditor gameState={gameState} />}

        <GuildRoomsEditor />

        <BossesEditor />

        {companions && companions.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Companion Journey Data</h3>
            <div className="space-y-3">
              {companions.map(c => (
                <CompanionAffinityEditor
                  key={c.id}
                  companion={c}
                  record={affinities?.find(a => a.companion_id === c.id)}
                />
              ))}
            </div>
          </section>
        )}

        {activeQuests && activeQuests.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Active Quests</h3>
            <div className="space-y-2">
              {activeQuests.map(q => (
                <QuestEditor key={q.id} quest={q} />
              ))}
            </div>
          </section>
        )}
      </PageContainer>
    </>
  )
}

function GameStateEditor({ gameState }: { gameState: NonNullable<ReturnType<typeof useGameState>> }) {
  const [gold, setGold] = useState(String(gameState.gold))
  const [sparks, setSparks] = useState(String(gameState.sparks))
  const [region, setRegion] = useState(gameState.current_region)
  const [activated, setActivated] = useState(gameState.activated)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setGold(String(gameState.gold))
    setSparks(String(gameState.sparks))
    setRegion(gameState.current_region)
    setActivated(gameState.activated)
  }, [gameState.id, gameState.gold, gameState.sparks, gameState.current_region, gameState.activated])

  async function save() {
    await db.gameState.update(gameState.id!, {
      gold: Math.max(0, parseInt(gold) || 0),
      sparks: Math.max(0, parseInt(sparks) || 0),
      current_region: region,
      activated,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section className="rounded-xl bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-muted uppercase tracking-wide">Currency & Region</h3>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-text-primary">Journey Activated</p>
        <button
          onClick={() => setActivated(a => !a)}
          className={`relative h-6 w-11 rounded-full transition-colors ${activated ? 'bg-secondary-400' : 'bg-surface border border-primary-100'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${activated ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted">Gold</label>
          <input
            type="number"
            value={gold}
            onChange={e => setGold(e.target.value)}
            className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Sparks</label>
          <input
            type="number"
            value={sparks}
            onChange={e => setSparks(e.target.value)}
            className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-xs text-muted">Current Region</label>
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
        >
          {REGIONS.map(r => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={save}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
      >
        <Save className="h-4 w-4" />
        {saved ? 'Saved!' : 'Save'}
      </button>
    </section>
  )
}

function GuildRoomsEditor() {
  const [built, setBuilt] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const next: Record<string, boolean> = {}
    for (const room of GUILD_ROOMS) next[room.id] = localStorage.getItem(guildKey(room.id)) === '1'
    setBuilt(next)
  }, [])

  function toggle(roomId: string) {
    const next = !built[roomId]
    if (next) localStorage.setItem(guildKey(roomId), '1')
    else localStorage.removeItem(guildKey(roomId))
    setBuilt(prev => ({ ...prev, [roomId]: next }))
  }

  return (
    <section className="mt-6">
      <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Guild Rooms Built</h3>
      <div className="rounded-xl bg-card p-4 shadow-sm space-y-2">
        {GUILD_ROOMS.map(room => (
          <label key={room.id} className="flex items-center justify-between py-1">
            <span className="text-sm text-text-primary">{room.emoji} {room.name}</span>
            <input
              type="checkbox"
              checked={!!built[room.id]}
              onChange={() => toggle(room.id)}
              className="h-4 w-4"
            />
          </label>
        ))}
      </div>
    </section>
  )
}

function BossesEditor() {
  const bossIds = Object.keys(BOSSES)
  const [defeated, setDefeated] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const next: Record<string, boolean> = {}
    for (const id of bossIds) next[id] = localStorage.getItem(bossKey(id)) === '1'
    setDefeated(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggle(bossId: string) {
    const next = !defeated[bossId]
    if (next) localStorage.setItem(bossKey(bossId), '1')
    else localStorage.removeItem(bossKey(bossId))
    setDefeated(prev => ({ ...prev, [bossId]: next }))
  }

  return (
    <section className="mt-6">
      <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Bosses Defeated</h3>
      <div className="rounded-xl bg-card p-4 shadow-sm space-y-2">
        {bossIds.map(id => (
          <label key={id} className="flex items-center justify-between py-1">
            <span className="text-sm text-text-primary">{BOSSES[id].emoji} {BOSSES[id].name}</span>
            <input
              type="checkbox"
              checked={!!defeated[id]}
              onChange={() => toggle(id)}
              className="h-4 w-4"
            />
          </label>
        ))}
      </div>
    </section>
  )
}

function CompanionAffinityEditor({ companion, record }: { companion: Companion; record: GameCompanionAffinity | undefined }) {
  const [affinity, setAffinity] = useState(String(record?.affinity ?? 0))
  const [homeRegion, setHomeRegion] = useState(record?.home_region ?? 'ponyville')
  const [isLover, setIsLover] = useState(record?.is_lover ?? false)
  const [isDiscovered, setIsDiscovered] = useState(record?.is_discovered ?? false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setAffinity(String(record?.affinity ?? 0))
    setHomeRegion(record?.home_region ?? 'ponyville')
    setIsLover(record?.is_lover ?? false)
    setIsDiscovered(record?.is_discovered ?? false)
  }, [record?.id, record?.affinity, record?.home_region, record?.is_lover, record?.is_discovered])

  async function save() {
    const changes = {
      affinity: parseInt(affinity) || 0,
      home_region: homeRegion,
      is_lover: isLover,
      is_discovered: isDiscovered,
    }
    if (record?.id) {
      await db.gameCompanionAffinity.update(record.id, changes)
    } else {
      await db.gameCompanionAffinity.add({
        companion_id: companion.id!,
        lover_dialogue: [],
        last_visit_at: null,
        created_at: new Date().toISOString(),
        ...changes,
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-xl bg-card p-4 shadow-sm">
      <p className="mb-2 font-medium text-text-primary">{companion.name}</p>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs text-muted">Affinity</label>
          <input
            type="number"
            value={affinity}
            onChange={e => setAffinity(e.target.value)}
            className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2.5 py-1.5 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Home Region</label>
          <select
            value={homeRegion}
            onChange={e => setHomeRegion(e.target.value)}
            className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2.5 py-1.5 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
          >
            {REGIONS.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3 flex gap-4">
        <label className="flex items-center gap-1.5 text-xs text-text-primary">
          <input type="checkbox" checked={isDiscovered} onChange={e => setIsDiscovered(e.target.checked)} className="h-4 w-4" />
          Discovered
        </label>
        <label className="flex items-center gap-1.5 text-xs text-text-primary">
          <input type="checkbox" checked={isLover} onChange={e => setIsLover(e.target.checked)} className="h-4 w-4" />
          Lover
        </label>
      </div>

      <button
        onClick={save}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
      >
        <Save className="h-3.5 w-3.5" />
        {saved ? 'Saved!' : 'Save'}
      </button>
    </div>
  )
}

const QUEST_STATUSES: GameQuestStatus[] = ['active', 'claimed', 'expired']

function QuestEditor({ quest }: { quest: GameQuest }) {
  const [status, setStatus] = useState<GameQuestStatus>(quest.status)
  const [goldReward, setGoldReward] = useState(String(quest.gold_reward))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setStatus(quest.status)
    setGoldReward(String(quest.gold_reward))
  }, [quest.id, quest.status, quest.gold_reward])

  async function save() {
    await db.gameQuests.update(quest.id!, {
      status,
      gold_reward: Math.max(0, parseInt(goldReward) || 0),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function remove() {
    await db.gameQuests.delete(quest.id!)
  }

  return (
    <div className="rounded-xl bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">{quest.title}</p>
        <button onClick={remove} className="p-1 text-muted hover:text-danger">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mb-2 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs text-muted">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as GameQuestStatus)}
            className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2.5 py-1.5 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
          >
            {QUEST_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Gold Reward</label>
          <input
            type="number"
            value={goldReward}
            onChange={e => setGoldReward(e.target.value)}
            className="w-full rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-2.5 py-1.5 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
          />
        </div>
      </div>
      <button
        onClick={save}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
      >
        <Save className="h-3.5 w-3.5" />
        {saved ? 'Saved!' : 'Save'}
      </button>
    </div>
  )
}
