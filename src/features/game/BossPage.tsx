import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Sword, Shield, Zap, Heart } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useCharacter } from '../../hooks/useCharacter'
import { PONYVILLE_BOSS, isBossDefeated, claimBossVictory, isRoomBuilt } from '../../lib/game'

// ─── Battle state ─────────────────────────────────────────────────────────────

type BattlePhase = 'intro' | 'fighting' | 'won' | 'lost'
type BossAction  = 'attack' | 'defend' | 'charge' | 'heal'
type PlayerAction = 'attack' | 'defend' | 'focus' | 'heal'

interface BattleState {
  phase: BattlePhase
  playerHp: number
  bossHp: number
  log: string[]
  focusing: boolean        // next player attack is 2×
  healsLeft: number        // player heal charges remaining
  bossCharging: boolean    // boss charged last turn — will hit 2× this turn
  bossDefending: boolean   // boss defended last turn — shown in log but resolved already
  bossQuote: string
  goldEarned: number
}

const PLAYER_MAX_HP  = 100
const PLAYER_HEALS   = 2    // heal charges per battle
const HEAL_AMOUNT    = 25

function randomQuote(): string {
  const pool = PONYVILLE_BOSS.quotes
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Boss AI ──────────────────────────────────────────────────────────────────

function pickBossAction(boss: typeof PONYVILLE_BOSS, currentHp: number): BossAction {
  const weights =
    boss.enrage && currentHp / boss.hp < boss.enrage.threshold
      ? boss.enrage.actionWeights
      : boss.actionWeights
  const roll = Math.random()
  let cumulative = 0
  for (const [action, weight] of Object.entries(weights) as [BossAction, number][]) {
    cumulative += weight
    if (roll < cumulative) return action
  }
  return 'attack'
}

// ─── HP bar ───────────────────────────────────────────────────────────────────

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

// ─── Battle log ───────────────────────────────────────────────────────────────

function BattleLog({ entries }: { entries: string[] }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 min-h-[72px]">
      {entries.slice(-3).map((line, i, arr) => (
        <p key={i} className={`text-sm ${i === arr.length - 1 ? 'text-text-primary font-medium' : 'text-muted'}`}>
          {line}
        </p>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BossPage() {
  const navigate  = useNavigate()
  const character = useCharacter()

  const alreadyDefeated = isBossDefeated(PONYVILLE_BOSS.id)

  const strengthLevel  = character?.statLevels.strength.level ?? 0
  const trainingBonus  = isRoomBuilt('training') ? 0.10 : 0
  const baseAttack     = 10 + Math.min(20, strengthLevel)
  const playerAttack   = Math.round(baseAttack * (1 + trainingBonus))

  const [battle, setBattle] = useState<BattleState>({
    phase: 'intro',
    playerHp: PLAYER_MAX_HP,
    bossHp: PONYVILLE_BOSS.hp,
    log: [],
    focusing: false,
    healsLeft: PLAYER_HEALS,
    bossCharging: false,
    bossDefending: false,
    bossQuote: randomQuote(),
    goldEarned: 0,
  })

  function startBattle() {
    setBattle({
      phase: 'fighting',
      playerHp: PLAYER_MAX_HP,
      bossHp: PONYVILLE_BOSS.hp,
      log: ['The battle begins! Nightmare Moon rises from the shadows…'],
      focusing: false,
      healsLeft: PLAYER_HEALS,
      bossCharging: false,
      bossDefending: false,
      bossQuote: randomQuote(),
      goldEarned: 0,
    })
  }

  function resetBattle() {
    setBattle(prev => ({
      ...prev,
      phase: 'intro',
      playerHp: PLAYER_MAX_HP,
      bossHp: PONYVILLE_BOSS.hp,
      log: [],
      focusing: false,
      healsLeft: PLAYER_HEALS,
      bossCharging: false,
      bossDefending: false,
      bossQuote: randomQuote(),
    }))
  }

  function applyAction(action: PlayerAction) {
    setBattle(prev => {
      if (prev.phase !== 'fighting') return prev

      const log = [...prev.log]
      let { playerHp, bossHp, focusing, healsLeft, bossCharging } = prev

      // ── Player turn ──────────────────────────────────────────────────────────
      let playerDefending = false

      if (action === 'attack') {
        let dmg = focusing ? playerAttack * 2 : playerAttack
        // If boss was defending last turn, reduce damage
        if (prev.bossDefending) dmg = Math.ceil(dmg * 0.5)
        bossHp = Math.max(0, bossHp - dmg)
        log.push(
          focusing
            ? `✨ Focus strike! You deal ${dmg} damage!${prev.bossDefending ? ' (boss defended)' : ''}`
            : `⚔️ You attack for ${dmg} damage.${prev.bossDefending ? ' Nightmare Moon was guarding!' : ''}`
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

      // Boss dead from player attack
      if (bossHp <= 0) {
        log.push('💥 Nightmare Moon collapses! The sun rises over Ponyville!')
        return { ...prev, phase: 'won', bossHp: 0, playerHp, log, focusing: false, goldEarned: PONYVILLE_BOSS.goldReward }
      }

      // ── Boss turn ────────────────────────────────────────────────────────────
      const bossAction = pickBossAction(PONYVILLE_BOSS, bossHp)
      let nextBossCharging  = false
      let nextBossDefending = false

      if (bossCharging) {
        // Was charging last turn — unleash charged strike
        const baseCharge = PONYVILLE_BOSS.attackMin + Math.floor(Math.random() * (PONYVILLE_BOSS.attackMax - PONYVILLE_BOSS.attackMin + 1))
        const bossDmgCharge = Math.round(baseCharge * PONYVILLE_BOSS.chargeMultiplier)
        const actualCharge  = playerDefending ? Math.ceil(bossDmgCharge / 2) : bossDmgCharge
        playerHp = Math.max(0, playerHp - actualCharge)
        log.push(`🌙⚡ ${PONYVILLE_BOSS.name} unleashes a CHARGED STRIKE for ${actualCharge}!${playerDefending ? ' (you blocked half)' : ''}`)
      } else {
        switch (bossAction) {
          case 'attack': {
            const bossDmg = PONYVILLE_BOSS.attackMin + Math.floor(Math.random() * (PONYVILLE_BOSS.attackMax - PONYVILLE_BOSS.attackMin + 1))
            const actual  = playerDefending ? Math.ceil(bossDmg / 2) : bossDmg
            playerHp = Math.max(0, playerHp - actual)
            log.push(`🌙 ${PONYVILLE_BOSS.name} strikes for ${actual} damage!${playerDefending ? ' (you blocked half)' : ''}`)
            break
          }
          case 'defend': {
            nextBossDefending = true
            log.push(`🛡️ ${PONYVILLE_BOSS.name} raises a dark barrier! Your next attack deals half damage.`)
            break
          }
          case 'charge': {
            nextBossCharging = true
            log.push(`⚡ ${PONYVILLE_BOSS.name} gathers dark power… a charged strike is coming!`)
            break
          }
          case 'heal': {
            const recovered = Math.min(PONYVILLE_BOSS.healAmount, PONYVILLE_BOSS.hp - bossHp)
            bossHp = Math.min(PONYVILLE_BOSS.hp, bossHp + PONYVILLE_BOSS.healAmount)
            log.push(`🌙 ${PONYVILLE_BOSS.name} draws power from the stars, recovering ${recovered} HP!`)
            break
          }
        }
      }

      if (playerHp <= 0) {
        log.push('The darkness consumed you. But you can try again — no penalty.')
        return { ...prev, phase: 'lost', playerHp: 0, bossHp, log, focusing, healsLeft, bossCharging: false, bossDefending: false }
      }

      return {
        ...prev,
        playerHp,
        bossHp,
        log,
        focusing,
        healsLeft,
        bossCharging: nextBossCharging,
        bossDefending: nextBossDefending,
        bossQuote: randomQuote(),
      }
    })
  }

  const [claimed, setClaimed] = useState(false)
  useEffect(() => {
    if (battle.phase === 'won' && !claimed) {
      setClaimed(true)
      claimBossVictory(PONYVILLE_BOSS.id, PONYVILLE_BOSS.goldReward)
    }
  }, [battle.phase, claimed])

  const enraged = !!PONYVILLE_BOSS.enrage && battle.phase === 'fighting' && battle.bossHp / PONYVILLE_BOSS.hp < PONYVILLE_BOSS.enrage.threshold

  return (
    <>
      <TopBar title="Boss Battle" onBack={() => navigate('/journey')} />
      <PageContainer>

        {/* Boss header */}
        <div className={`mb-5 rounded-xl p-5 shadow-sm text-center transition-colors ${enraged ? 'bg-red-50 dark:bg-red-950/30' : 'bg-card'}`}>
          {PONYVILLE_BOSS.iconPath ? (
            <img
              src={PONYVILLE_BOSS.iconPath}
              alt={PONYVILLE_BOSS.name}
              className="mx-auto mb-2 h-24 w-24 object-contain"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <p className="text-5xl mb-2">{PONYVILLE_BOSS.emoji}</p>
          )}
          {battle.phase === 'fighting' && (
            <div className="relative mt-2 mx-auto max-w-xs">
              <div className="rounded-2xl bg-surface px-4 py-2">
                <p className="text-xs italic text-muted">"{battle.bossQuote}"</p>
              </div>
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 overflow-hidden">
                <div className="w-3 h-3 bg-surface rotate-45 translate-y-1 mx-auto" />
              </div>
            </div>
          )}
          <p className="text-lg font-bold text-text-primary">
            {PONYVILLE_BOSS.name}
            {enraged && <span className="ml-2 text-sm font-medium text-red-500">— ENRAGED</span>}
          </p>
          <p className="text-xs text-muted mt-1">{PONYVILLE_BOSS.description}</p>
        </div>

        {battle.phase === 'intro' && (
          <>
            {alreadyDefeated && (
              <div className="mb-4 rounded-xl bg-green-100 dark:bg-green-900/30 px-4 py-3 text-sm text-center text-green-700 dark:text-green-300 font-medium">
                ✨ Already defeated! Rematch for glory (no extra gold).
              </div>
            )}

            <div className="mb-5 rounded-xl bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold text-text-primary mb-2">Your stats</p>
              <div className="space-y-1.5 text-sm text-muted">
                <div className="flex justify-between">
                  <span>HP</span>
                  <span className="font-medium text-text-primary">{PLAYER_MAX_HP}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attack</span>
                  <span className="font-medium text-text-primary">
                    {playerAttack}
                    {trainingBonus > 0 && <span className="ml-1 text-xs text-green-600">(+10% Training)</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Heals per battle</span>
                  <span className="font-medium text-text-primary">{PLAYER_HEALS} × {HEAL_AMOUNT} HP</span>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs text-muted space-y-1">
                <p>🌙 Nightmare Moon randomizes: Attack, Defend, Charge, Heal</p>
                <p>⚡ When she charges, she warns you — use Defend!</p>
                <p>🛡️ When she defends, Focus then attack to break through.</p>
                <p>💀 Below 50% HP she enrages — harder, faster, meaner.</p>
              </div>
            </div>

            <button
              onClick={startBattle}
              className="w-full rounded-2xl bg-red-500 py-4 text-base font-bold text-white shadow-sm transition-all active:scale-[0.98]"
            >
              ⚔️ Challenge Nightmare Moon
            </button>
          </>
        )}

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
                  <span>{PONYVILLE_BOSS.name} {PONYVILLE_BOSS.emoji} {enraged ? '🔴' : ''}</span>
                  <span>{battle.bossHp} / {PONYVILLE_BOSS.hp} HP</span>
                </div>
                <HpBar current={battle.bossHp} max={PONYVILLE_BOSS.hp} color={enraged ? 'bg-red-400' : 'bg-purple-400'} />
              </div>
            </div>

            {/* Status badges */}
            <div className="mb-3 flex flex-wrap gap-2">
              {battle.focusing && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  ⚡ Focused — next hit 2×
                </span>
              )}
              {battle.bossCharging && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                  ⚡ BOSS CHARGING — Defend now!
                </span>
              )}
              {battle.bossDefending && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  🛡️ Boss guarding — Focus then attack!
                </span>
              )}
            </div>

            {/* Battle log */}
            <div className="mb-4">
              <BattleLog entries={battle.log} />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => applyAction('attack')}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-red-500 py-4 text-white transition-all active:scale-95"
              >
                <Sword className="h-5 w-5" />
                <span className="text-sm font-bold">Attack</span>
                <span className="text-[10px] opacity-75">{battle.focusing ? `${playerAttack * 2} dmg (2×)` : `${playerAttack} dmg`}</span>
              </button>
              <button
                onClick={() => applyAction('defend')}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-blue-500 py-4 text-white transition-all active:scale-95"
              >
                <Shield className="h-5 w-5" />
                <span className="text-sm font-bold">Defend</span>
                <span className="text-[10px] opacity-75">Half incoming dmg</span>
              </button>
              <button
                onClick={() => applyAction('focus')}
                disabled={battle.focusing}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-amber-500 py-4 text-white transition-all active:scale-95 disabled:opacity-40"
              >
                <Zap className="h-5 w-5" />
                <span className="text-sm font-bold">Focus</span>
                <span className="text-[10px] opacity-75">{battle.focusing ? 'Active' : '2× next hit'}</span>
              </button>
              <button
                onClick={() => applyAction('heal')}
                disabled={battle.healsLeft <= 0 || battle.playerHp >= PLAYER_MAX_HP}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-green-500 py-4 text-white transition-all active:scale-95 disabled:opacity-40"
              >
                <Heart className="h-5 w-5" />
                <span className="text-sm font-bold">Heal</span>
                <span className="text-[10px] opacity-75">+{HEAL_AMOUNT} HP ({battle.healsLeft} left)</span>
              </button>
            </div>
          </>
        )}

        {battle.phase === 'won' && (
          <div className="text-center">
            <p className="text-6xl mb-3">🎉</p>
            <p className="text-xl font-bold text-text-primary mb-1">Victory!</p>
            <p className="text-sm text-muted mb-1">Nightmare Moon is defeated. The sun shines over Ponyville.</p>
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mb-6">
              +🪙 {PONYVILLE_BOSS.goldReward} Gold
            </p>
            <div className="space-y-3">
              <button
                onClick={resetBattle}
                className="w-full rounded-2xl bg-card border border-primary-200 dark:border-primary-800 py-3.5 text-sm font-medium text-text-primary"
              >
                Rematch
              </button>
              <button
                onClick={() => navigate('/journey')}
                className="w-full rounded-2xl bg-primary-500 py-3.5 text-sm font-bold text-white"
              >
                Back to Journey
              </button>
            </div>
          </div>
        )}

        {battle.phase === 'lost' && (
          <div className="text-center">
            <p className="text-6xl mb-3">🌙</p>
            <p className="text-xl font-bold text-text-primary mb-1">You fell in battle.</p>
            <p className="text-sm text-muted mb-6">The darkness won this round — but you can try again. No penalty.</p>
            <div className="space-y-3">
              <button
                onClick={startBattle}
                className="w-full rounded-2xl bg-red-500 py-3.5 text-sm font-bold text-white"
              >
                Try again
              </button>
              <button
                onClick={() => navigate('/journey')}
                className="w-full rounded-2xl bg-surface py-3.5 text-sm font-medium text-muted"
              >
                Retreat
              </button>
            </div>
          </div>
        )}

      </PageContainer>
    </>
  )
}
