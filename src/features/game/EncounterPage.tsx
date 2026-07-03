import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Sword, Shield, Zap, Heart } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useCharacter } from '../../hooks/useCharacter'
import { awardGold } from '../../lib/game'
import { isRoomBuilt } from '../../lib/game'
import { ENCOUNTERS, type EncounterDefinition } from '../../lib/encounters'

// ─── Battle state ─────────────────────────────────────────────────────────────

type Phase        = 'fighting' | 'won' | 'lost' | 'fled'
type PlayerAction = 'attack' | 'defend' | 'focus' | 'heal'
type EnemyAction  = 'attack' | 'defend' | 'charge'

interface BattleState {
  phase: Phase
  playerHp: number
  encounterHp: number
  log: string[]
  focusing: boolean
  healsLeft: number
  enemyCharging: boolean
  enemyDefending: boolean
  enemyQuote: string
  goldEarned: number
}

const PLAYER_MAX_HP = 100
const PLAYER_HEALS  = 1
const HEAL_AMOUNT   = 25

function randomQuote(enc: EncounterDefinition): string {
  return enc.quotes[Math.floor(Math.random() * enc.quotes.length)]
}

function pickEnemyAction(enc: EncounterDefinition): EnemyAction {
  const roll = Math.random()
  const { attack, defend } = enc.actionWeights
  if (roll < attack) return 'attack'
  if (roll < attack + defend) return 'defend'
  return 'charge'
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-surface">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.max(0, (current / max) * 100)}%` }}
      />
    </div>
  )
}

function BattleLog({ entries }: { entries: string[] }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 min-h-[60px]">
      {entries.slice(-3).map((line, i, arr) => (
        <p key={i} className={`text-sm ${i === arr.length - 1 ? 'text-text-primary font-medium' : 'text-muted'}`}>
          {line}
        </p>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EncounterPage() {
  const navigate    = useNavigate()
  const { encounterId } = useParams<{ encounterId: string }>()
  const character   = useCharacter()

  const enc: EncounterDefinition | undefined = encounterId ? ENCOUNTERS[encounterId] : undefined

  const strengthLevel = character?.statLevels.strength.level ?? 0
  const trainingBonus = isRoomBuilt('training') ? 0.10 : 0
  const baseAttack    = 10 + Math.min(20, strengthLevel)
  const playerAttack  = Math.round(baseAttack * (1 + trainingBonus))

  const [battle, setBattle] = useState<BattleState>(() => ({
    phase: 'fighting',
    playerHp: PLAYER_MAX_HP,
    encounterHp: enc?.hp ?? 0,
    log: enc ? [`⚔️ ${enc.ambushText}`] : [],
    focusing: false,
    healsLeft: PLAYER_HEALS,
    enemyCharging: false,
    enemyDefending: false,
    enemyQuote: enc ? randomQuote(enc) : '',
    goldEarned: 0,
  }))

  const [goldClaimed, setGoldClaimed] = useState(false)

  const encounterGoldReward = enc
    ? Math.round(enc.goldReward * (isRoomBuilt('observatory') ? 1.25 : 1))
    : 0

  useEffect(() => {
    if (battle.phase === 'won' && !goldClaimed && enc) {
      setGoldClaimed(true)
      awardGold(encounterGoldReward)
    }
  }, [battle.phase, goldClaimed, enc, encounterGoldReward])

  function flee() {
    if (!enc) return
    setBattle(prev => ({
      ...prev,
      phase: 'fled',
      log: [...prev.log, `🏃 ${enc.fleeText}`],
    }))
  }

  function applyAction(action: PlayerAction) {
    if (!enc) return
    setBattle(prev => {
      if (prev.phase !== 'fighting') return prev

      const log = [...prev.log]
      let { playerHp, encounterHp, focusing, healsLeft, enemyCharging } = prev
      let playerDefending = false

      // ── Player turn ──────────────────────────────────────────────────────────
      if (action === 'attack') {
        let dmg = focusing ? playerAttack * 2 : playerAttack
        if (prev.enemyDefending) dmg = Math.ceil(dmg * 0.5)
        encounterHp = Math.max(0, encounterHp - dmg)
        log.push(
          focusing
            ? `✨ Focus strike! You deal ${dmg} damage!${prev.enemyDefending ? ' (guarded)' : ''}`
            : `⚔️ You attack for ${dmg} damage.${prev.enemyDefending ? ` ${enc.name} was guarding!` : ''}`
        )
        focusing = false
      } else if (action === 'defend') {
        playerDefending = true
        log.push('🛡️ You brace yourself. Incoming damage halved.')
        focusing = false
      } else if (action === 'focus') {
        focusing = true
        log.push('⚡ You focus your energy… next attack deals double damage!')
      } else if (action === 'heal') {
        if (healsLeft <= 0) return prev
        const recovered = Math.min(HEAL_AMOUNT, PLAYER_MAX_HP - playerHp)
        playerHp = Math.min(PLAYER_MAX_HP, playerHp + HEAL_AMOUNT)
        healsLeft -= 1
        log.push(`💚 You recover ${recovered} HP. (${healsLeft} heals left)`)
      }

      if (encounterHp <= 0) {
        log.push(`💥 ${enc.victoryText}`)
        return { ...prev, phase: 'won', encounterHp: 0, playerHp, log, focusing: false, goldEarned: encounterGoldReward }
      }

      // ── Enemy turn ───────────────────────────────────────────────────────────
      const enemyAction = pickEnemyAction(enc)
      let nextEnemyCharging  = false
      let nextEnemyDefending = false

      if (enemyCharging) {
        const base    = enc.attackMin + Math.floor(Math.random() * (enc.attackMax - enc.attackMin + 1))
        const charged = Math.round(base * enc.chargeMultiplier)
        const actual  = playerDefending ? Math.ceil(charged / 2) : charged
        playerHp = Math.max(0, playerHp - actual)
        log.push(`${enc.emoji}⚡ ${enc.name} unleashes a CHARGED STRIKE for ${actual}!${playerDefending ? ' (you blocked half)' : ''}`)
      } else {
        switch (enemyAction) {
          case 'attack': {
            const dmg    = enc.attackMin + Math.floor(Math.random() * (enc.attackMax - enc.attackMin + 1))
            const actual = playerDefending ? Math.ceil(dmg / 2) : dmg
            playerHp = Math.max(0, playerHp - actual)
            log.push(`${enc.emoji} ${enc.name} attacks for ${actual} damage!${playerDefending ? ' (you blocked half)' : ''}`)
            break
          }
          case 'defend': {
            nextEnemyDefending = true
            log.push(`🛡️ ${enc.name} braces. Your next attack deals half damage.`)
            break
          }
          case 'charge': {
            nextEnemyCharging = true
            log.push(`${enc.emoji}⚡ ${enc.name} winds up… a charged strike is coming!`)
            break
          }
        }
      }

      if (playerHp <= 0) {
        log.push(enc.defeatText)
        return { ...prev, phase: 'lost', playerHp: 0, encounterHp, log, focusing, healsLeft, enemyCharging: false, enemyDefending: false }
      }

      return {
        ...prev,
        playerHp,
        encounterHp,
        log,
        focusing,
        healsLeft,
        enemyCharging: nextEnemyCharging,
        enemyDefending: nextEnemyDefending,
        enemyQuote: randomQuote(enc),
      }
    })

  }

  if (!enc) {
    return (
      <>
        <TopBar title="Encounter" onBack={() => navigate('/journey')} />
        <PageContainer>
          <div className="py-16 text-center text-muted">
            <p className="text-4xl mb-3">❓</p>
            <p className="font-semibold text-text-primary mb-1">Unknown encounter</p>
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <TopBar title="Roaming Encounter" onBack={() => navigate('/journey')} />
      <PageContainer>

        {/* Enemy header */}
        <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/30 p-5 text-center shadow-sm">
          {enc.iconPath ? (
            <img
              src={enc.iconPath}
              alt={enc.name}
              className="mx-auto mb-2 h-36 w-36 rounded-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <p className="text-5xl mb-2">{enc.emoji}</p>
          )}
          {battle.phase === 'fighting' && (
            <div className="relative mt-1 mx-auto max-w-xs mb-2">
              <div className="rounded-2xl bg-surface px-4 py-2">
                <p className="text-xs italic text-muted">"{battle.enemyQuote}"</p>
              </div>
            </div>
          )}
          <p className="text-lg font-bold text-text-primary">{enc.name}</p>
          <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-0.5">⚔️ Roaming encounter</p>
        </div>

        {battle.phase === 'fighting' && (
          <>
            {/* HP bars */}
            <div className="mb-4 space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span>You</span>
                  <span>{battle.playerHp} / {PLAYER_MAX_HP} HP</span>
                </div>
                <HpBar current={battle.playerHp} max={PLAYER_MAX_HP} color="bg-green-400" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span>{enc.name} {enc.emoji}</span>
                  <span>{battle.encounterHp} / {enc.hp} HP</span>
                </div>
                <HpBar current={battle.encounterHp} max={enc.hp} color="bg-red-400" />
              </div>
            </div>

            {/* Status badges */}
            <div className="mb-3 flex flex-wrap gap-2">
              {battle.focusing && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  ⚡ Focused — next hit 2×
                </span>
              )}
              {battle.enemyCharging && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                  ⚡ CHARGING — Defend now!
                </span>
              )}
              {battle.enemyDefending && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  🛡️ Guarding — Focus then attack!
                </span>
              )}
            </div>

            {/* Battle log */}
            <div className="mb-4">
              <BattleLog entries={battle.log} />
            </div>

            {/* Player actions */}
            <div className="mb-3 grid grid-cols-2 gap-3">
              <button onClick={() => applyAction('attack')} className="flex flex-col items-center gap-1.5 rounded-2xl bg-red-500 py-4 text-white transition-all active:scale-95">
                <Sword className="h-5 w-5" />
                <span className="text-sm font-bold">Attack</span>
                <span className="text-[10px] opacity-75">{battle.focusing ? `${playerAttack * 2} dmg (2×)` : `${playerAttack} dmg`}</span>
              </button>
              <button onClick={() => applyAction('defend')} className="flex flex-col items-center gap-1.5 rounded-2xl bg-blue-500 py-4 text-white transition-all active:scale-95">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-bold">Defend</span>
                <span className="text-[10px] opacity-75">Half incoming dmg</span>
              </button>
              <button onClick={() => applyAction('focus')} disabled={battle.focusing} className="flex flex-col items-center gap-1.5 rounded-2xl bg-amber-500 py-4 text-white transition-all active:scale-95 disabled:opacity-40">
                <Zap className="h-5 w-5" />
                <span className="text-sm font-bold">Focus</span>
                <span className="text-[10px] opacity-75">{battle.focusing ? 'Active' : '2× next hit'}</span>
              </button>
              <button onClick={() => applyAction('heal')} disabled={battle.healsLeft <= 0 || battle.playerHp >= PLAYER_MAX_HP} className="flex flex-col items-center gap-1.5 rounded-2xl bg-green-500 py-4 text-white transition-all active:scale-95 disabled:opacity-40">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-bold">Heal</span>
                <span className="text-[10px] opacity-75">+{HEAL_AMOUNT} HP ({battle.healsLeft} left)</span>
              </button>
            </div>

            {/* Flee */}
            <button
              onClick={flee}
              className="w-full rounded-2xl bg-surface py-3 text-sm font-medium text-muted transition-all active:scale-[0.98]"
            >
              🏃 Flee (no penalty)
            </button>
          </>
        )}

        {battle.phase === 'won' && (
          <div className="text-center">
            <p className="text-6xl mb-3">🎉</p>
            <p className="text-xl font-bold text-text-primary mb-1">Victory!</p>
            <p className="text-sm text-muted mb-1">{enc.victoryText}</p>
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mb-6">+🪙 {encounterGoldReward} Gold</p>
            <button
              onClick={() => navigate('/journey')}
              className="w-full rounded-2xl bg-primary-500 py-3.5 text-sm font-bold text-white"
            >
              Back to Journey
            </button>
          </div>
        )}

        {battle.phase === 'lost' && (
          <div className="text-center">
            <p className="text-6xl mb-3">{enc.emoji}</p>
            <p className="text-xl font-bold text-text-primary mb-1">Overwhelmed.</p>
            <p className="text-sm text-muted mb-6">{enc.defeatText}</p>
            <button
              onClick={() => navigate('/journey')}
              className="w-full rounded-2xl bg-surface py-3.5 text-sm font-medium text-muted"
            >
              Return to Journey
            </button>
          </div>
        )}

        {battle.phase === 'fled' && (
          <div className="text-center">
            <p className="text-6xl mb-3">🏃</p>
            <p className="text-xl font-bold text-text-primary mb-1">You escaped!</p>
            <p className="text-sm text-muted mb-6">{enc.fleeText}</p>
            <button
              onClick={() => navigate('/journey')}
              className="w-full rounded-2xl bg-surface py-3.5 text-sm font-medium text-muted"
            >
              Back to Journey
            </button>
          </div>
        )}

      </PageContainer>
    </>
  )
}
