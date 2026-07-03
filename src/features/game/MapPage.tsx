import { useState } from 'react'
import { useNavigate } from 'react-router'
import TopBar from '../../components/layout/TopBar'
import { useGameState } from '../../hooks/useGame'

interface RegionDef {
  id: string
  name: string
  emoji: string
  x: number  // % from left edge of image
  y: number  // % from top edge of image
  unlockHint: string
}

const REGIONS: RegionDef[] = [
  { id: 'ponyville',       name: 'Ponyville',       emoji: '🍎', x: 45, y: 47, unlockHint: 'Your starting home. All features are available here.' },
  { id: 'canterlot',       name: 'Canterlot',       emoji: '🏰', x: 52, y: 37, unlockHint: 'Defeat Nightmare Moon · complete 10 quests in Ponyville.' },
  { id: 'cloudsdale',      name: 'Cloudsdale',      emoji: '☁️', x: 37, y: 24, unlockHint: 'Unlock Canterlot first · complete 15 quests.' },
  { id: 'crystal_empire',  name: 'Crystal Empire',  emoji: '💎', x: 54, y: 14, unlockHint: 'Unlock Canterlot · defeat the Canterlot boss.' },
  { id: 'everfree_forest', name: 'Everfree Forest', emoji: '🌲', x: 46, y: 67, unlockHint: 'Complete 20 quests in Ponyville.' },
  { id: 'manehattan',      name: 'Manehattan',      emoji: '🏙️', x: 87, y: 23, unlockHint: 'Unlock Canterlot and Cloudsdale.' },
  { id: 'las_pegasus',     name: 'Las Pegasus',     emoji: '🎰', x: 16, y: 82, unlockHint: 'Unlock Everfree Forest · complete 25 quests.' },
  { id: 'appleloosa',      name: 'Appleloosa',      emoji: '🤠', x: 52, y: 85, unlockHint: 'Unlock Everfree Forest · defeat the Everfree boss.' },
  { id: 'griffonstone',    name: 'Griffonstone',    emoji: '🦅', x: 87, y: 44, unlockHint: 'Unlock Manehattan · complete 30 quests.' },
  { id: 'dragon_lands',    name: 'Dragon Lands',    emoji: '🐉', x: 91, y: 83, unlockHint: 'Unlock Appleloosa and Griffonstone.' },
]

export default function MapPage() {
  const navigate = useNavigate()
  const gameState = useGameState()
  const [selected, setSelected] = useState<RegionDef | null>(null)

  const currentRegion = gameState?.current_region ?? 'ponyville'

  function isUnlocked(regionId: string): boolean {
    return regionId === currentRegion
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      <TopBar title="World Map" onBack={() => navigate('/journey')} />

      {/* Horizontally scrollable map */}
      <div className="flex-1 overflow-auto bg-black">
        <div className="relative select-none" style={{ minWidth: '600px' }}>
          <img
            src="/maps/equestria.jpg"
            className="block w-full"
            alt="Map of Equestria"
            draggable={false}
          />

          {REGIONS.map(region => {
            const isCurrent  = region.id === currentRegion
            const unlocked   = isUnlocked(region.id)
            return (
              <button
                key={region.id}
                onClick={() => setSelected(region)}
                style={{
                  position: 'absolute',
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  transform: 'translate(-50%, -50%)',
                  padding: '8px',        // enlarge touch target
                  margin: '-8px',
                }}
                className="group"
              >
                {/* Pulse ring on current location */}
                {isCurrent && (
                  <span className="absolute inset-2 rounded-full border-2 border-yellow-300 opacity-70 animate-ping pointer-events-none" />
                )}

                <div className={`
                  relative flex h-8 w-8 items-center justify-center rounded-full text-base
                  shadow-lg border-2 transition-transform group-active:scale-90
                  ${isCurrent
                    ? 'bg-yellow-400 border-yellow-200 shadow-yellow-500/60'
                    : unlocked
                    ? 'bg-white/90 border-green-400 shadow-black/40'
                    : 'bg-black/55 border-white/25 shadow-black/40'
                  }
                `}>
                  {isCurrent ? '★' : unlocked ? region.emoji : '🔒'}
                </div>
              </button>
            )
          })}
        </div>

        <p className="py-2 text-center text-[11px] text-white/35 bg-black">
          Scroll to explore · tap a region for details
        </p>
      </div>

      {/* Region info sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelected(null)}>
          <div
            className="w-full rounded-t-2xl bg-card p-6 pb-10 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                selected.id === currentRegion
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : 'bg-surface'
              }`}>
                {selected.emoji}
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">{selected.name}</p>
                {selected.id === currentRegion ? (
                  <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">★ Your current region</p>
                ) : isUnlocked(selected.id) ? (
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">✓ Unlocked</p>
                ) : (
                  <p className="text-xs text-muted">🔒 Locked</p>
                )}
              </div>
            </div>

            <div className={`rounded-xl px-4 py-3 mb-4 ${
              selected.id === currentRegion
                ? 'bg-yellow-50 dark:bg-yellow-950/20'
                : 'bg-surface'
            }`}>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                {selected.id === currentRegion ? 'About this region' : isUnlocked(selected.id) ? 'Region details' : 'How to unlock'}
              </p>
              <p className="text-sm text-text-primary">{selected.unlockHint}</p>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full rounded-xl bg-surface py-3 text-sm font-medium text-muted"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
