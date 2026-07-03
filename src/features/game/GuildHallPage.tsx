import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { CheckCircle2, Lock } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useGameState } from '../../hooks/useGame'
import { GUILD_ROOMS, isRoomBuilt, buildRoom } from '../../lib/game'

function useRoomStates() {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick(t => t + 1), [])
  return { tick, refresh }
}

export default function GuildHallPage() {
  const navigate = useNavigate()
  const gameState = useGameState()
  const { tick, refresh } = useRoomStates()
  const [building, setBuilding] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const sparks = gameState?.sparks ?? 0

  async function handleBuild(roomId: string) {
    setBuilding(roomId)
    const success = await buildRoom(roomId)
    if (success) {
      const room = GUILD_ROOMS.find(r => r.id === roomId)
      setMsg(`${room?.emoji} ${room?.name} built! ${room?.bonus} is now active.`)
      setTimeout(() => setMsg(null), 4000)
    } else {
      setMsg('Not enough Sparks.')
      setTimeout(() => setMsg(null), 2000)
    }
    refresh()
    setBuilding(null)
  }

  return (
    <>
      <TopBar title="Guild Hall" onBack={() => navigate('/journey')} />
      <PageContainer>

        <div className="mb-5 rounded-xl bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold text-text-primary mb-1">Your Guild Hall</p>
          <p className="text-xs text-muted">
            Build rooms with Sparks to unlock stat bonuses. Sparks come from logging your health — every entry counts.
          </p>
          <p className="mt-3 text-sm font-bold text-amber-600 dark:text-amber-400">
            ✨ {sparks.toLocaleString()} Sparks available
          </p>
        </div>

        {msg && (
          <div className="mb-4 rounded-xl bg-primary-100 dark:bg-primary-900/30 px-4 py-3 text-sm text-primary-700 dark:text-primary-300 text-center font-medium">
            {msg}
          </div>
        )}

        <div className="space-y-4">
          {GUILD_ROOMS.map(room => {
            const built = isRoomBuilt(room.id)
            const canAfford = sparks >= room.cost
            const isBuilding = building === room.id

            return (
              <div
                key={`${room.id}-${tick}`}
                className={`rounded-xl bg-card p-5 shadow-sm border-2 transition-colors ${
                  built
                    ? 'border-green-300 dark:border-green-700'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{room.emoji}</span>
                    <div>
                      <p className="font-bold text-text-primary">{room.name}</p>
                      <p className="text-xs text-muted">{room.description}</p>
                    </div>
                  </div>
                  {built && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 dark:bg-primary-900/30 px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
                      {room.bonus}
                    </span>
                  </div>

                  {built ? (
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Active ✓</span>
                  ) : (
                    <button
                      onClick={() => handleBuild(room.id)}
                      disabled={!canAfford || isBuilding}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 transition-all active:scale-95"
                    >
                      {!canAfford && <Lock className="h-3.5 w-3.5" />}
                      {isBuilding ? 'Building…' : `Build — ✨ ${room.cost}`}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 rounded-xl bg-surface px-4 py-3 text-center text-xs text-muted">
          Rooms are permanent once built — they never disappear.
        </div>

      </PageContainer>
    </>
  )
}
