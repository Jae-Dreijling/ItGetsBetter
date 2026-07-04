import { useNavigate } from 'react-router'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useCharacter } from '../../hooks/useCharacter'
import { STAT_DEFS, CLASS_DEFS, type StatKey, type LevelInfo } from '../../lib/gamification'

// ─── Sub-components ───────────────────────────────────────────────────────────

function XPBar({ xp, level, progress, toNext }: { xp: number; level: number; progress: number; toNext: number }) {
  return (
    <div className="mb-5 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 p-5 shadow-lg">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Level</p>
          <p className="text-4xl font-bold text-white leading-none">{level}</p>
        </div>
        <p className="text-sm text-white/60 tabular-nums">{xp.toLocaleString()} XP total</p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white/80 transition-all duration-700"
          style={{ width: `${Math.max(2, progress * 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-right text-[11px] text-white/50">
        {toNext} XP to Level {level + 1}
      </p>
    </div>
  )
}

function StatCard({
  emoji, name, description, color, levelInfo,
}: {
  emoji: string
  name: string
  description: string
  color: string
  levelInfo: LevelInfo
}) {
  const { level, progress, toNext } = levelInfo
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl leading-none">{emoji}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{name}</p>
          <p className="truncate text-[10px] text-muted/70">{description}</p>
        </div>
      </div>
      <p className="mb-2 text-3xl font-bold leading-none text-text-primary">{level}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.max(2, progress * 100)}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-muted">
        {toNext} to Lv {level + 1}
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CharacterPage() {
  const navigate = useNavigate()
  const character = useCharacter()

  if (!character) {
    return (
      <>
        <TopBar title="Character" onBack={() => navigate(-1)} />
        <PageContainer>
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        </PageContainer>
      </>
    )
  }

  const cls = CLASS_DEFS[character.characterClass]

  return (
    <>
      <TopBar title="Character" onBack={() => navigate(-1)} />
      <PageContainer>
        {/* Class identity banner */}
        <div className="mb-4 rounded-2xl bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none">{cls.emoji}</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                Your Class
              </p>
              <p className="text-xl font-bold text-text-primary">{cls.name}</p>
              <p className="text-xs text-muted">{cls.tagline}</p>
            </div>
          </div>
        </div>

        {/* Global XP level */}
        <XPBar
          xp={character.xp}
          level={character.xpLevel.level}
          progress={character.xpLevel.progress}
          toNext={character.xpLevel.toNext}
        />

        {/* Stat grid */}
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Character Stats
        </p>
        <div className="grid grid-cols-2 gap-3">
          {STAT_DEFS.map(stat => (
            <StatCard
              key={stat.key}
              emoji={stat.emoji}
              name={stat.name}
              description={stat.description}
              color={stat.color}
              levelInfo={character.statLevels[stat.key as StatKey]}
            />
          ))}
        </div>

        {/* Flavour note */}
        <p className="mt-6 text-center text-[11px] text-muted">
          Stats grow as you log. Numbers only go up. 🌱
        </p>
      </PageContainer>
    </>
  )
}
