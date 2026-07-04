import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Sparkles, Coins, RefreshCw, CheckCircle2, Clock, ShieldCheck, Zap, Home, Swords, Heart, Map as MapIcon } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useGameState, useActiveQuests, useCustomQuestions, useQuestProgress, useCompanionAffinities, useCompanions } from '../../hooks/useGame'
import {
  beg, canBegToday,
  getPerformQuestion, submitPerformAnswer, canPerformToday, getPerformsToday,
  generateQuestsIfNeeded, claimQuest, toggleQuestSafeMode,
  ensureGameState,
  PERFORM_DAILY_LIMIT, BEG_GOLD_THRESHOLD,
  getOrPickDailyVisitor, recordCompanionVisit,
  getVisitGreeting, VISIT_RESPONSES,
  affinityLabel, isBossDefeated, isRoomBuilt,
  setLoverStatus,
  type QuizQuestion,
} from '../../lib/game'
import { rollEncounter, recordEncounterToday, ENCOUNTERS as ENCOUNTERS_ALL } from '../../lib/encounters'
import { BOSSES } from '../../lib/bosses'
import {
  getOrPickWeeklyEvent, getFortuneEventDef, resolveFortuneChoice,
  type StoredFortune,
} from '../../lib/fortune'
import type { GameQuest } from '../../types'

// ─── Objective labels ──────────────────────────────────────────────────────────

const OBJECTIVE_LABEL: Record<GameQuest['objective_type'], string> = {
  log_exercise:    'Exercise sessions',
  log_meals:       'Meals logged',
  log_water:       'Water days',
  log_sleep:       'Sleep nights',
  log_mood:        'Mood check-ins',
  log_weight:      'Weight entries',
  log_medicine:    'Medicine doses',
  complete_habits: 'Habits completed',
}

const OBJECTIVE_EMOJI: Record<GameQuest['objective_type'], string> = {
  log_exercise:    '🏃',
  log_meals:       '🍽️',
  log_water:       '💧',
  log_sleep:       '😴',
  log_mood:        '💭',
  log_weight:      '⚖️',
  log_medicine:    '💊',
  complete_habits: '✅',
}

// ─── Days remaining ────────────────────────────────────────────────────────────

function daysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((end.getTime() - now.getTime()) / 86400000))
}

// ─── Quest card ────────────────────────────────────────────────────────────────

function QuestCard({ quest, onClaimed }: { quest: GameQuest; onClaimed: () => void }) {
  const progress = useQuestProgress(quest) ?? 0
  const pct = Math.min(1, progress / quest.objective_target)
  const done = progress >= quest.objective_target
  const days = daysRemaining(quest.end_date)
  const [claiming, setClaiming] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleClaim() {
    setClaiming(true)
    await claimQuest(quest.id!)
    onClaimed()
    setClaiming(false)
  }

  async function handleToggleSafe() {
    setToggling(true)
    await toggleQuestSafeMode(quest.id!)
    setToggling(false)
  }

  return (
    <div className={`rounded-xl bg-card p-4 shadow-sm border-l-4 ${done ? 'border-green-400' : 'border-primary-200 dark:border-primary-800'}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{OBJECTIVE_EMOJI[quest.objective_type]}</span>
          <div>
            <p className="font-semibold text-text-primary leading-tight">{quest.title}</p>
            <p className="text-xs text-muted">{quest.description}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
            🪙 {quest.gold_reward}
          </p>
          {quest.is_safe_mode && (
            <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Safe</span>
          )}
        </div>
      </div>

      <div className="mb-2">
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>{OBJECTIVE_LABEL[quest.objective_type]}</span>
          <span>{progress} / {quest.objective_target}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface">
          <div
            className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-green-400' : 'bg-primary-400'}`}
            style={{ width: `${Math.max(4, pct * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" />
            {days === 0 ? 'Expires today' : `${days}d left`}
          </span>
          <button
            onClick={handleToggleSafe}
            disabled={toggling}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
              quest.is_safe_mode
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-surface text-muted hover:bg-primary-50'
            }`}
          >
            <ShieldCheck className="h-3 w-3" />
            {quest.is_safe_mode ? 'Safe mode on' : 'Safe mode'}
          </button>
        </div>

        {done && (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="flex items-center gap-1.5 rounded-xl bg-green-500 px-4 py-1.5 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            Claim {quest.gold_reward}🪙
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Companion visit sheet ─────────────────────────────────────────────────────

interface VisitorInfo {
  companionId: number
  companionName: string
  partnerId?: number
  partnerName?: string
}

function pickJointScene(name1: string, name2: string): string {
  const pool: string[] = [
    `${name1} and ${name2} are sitting together in the courtyard, talking softly.`,
    `You find them mid-laugh at something only they know. They wave you over.`,
    `${name1} is sketching something while ${name2} watches over their shoulder.`,
    `They're side by side on a bench, watching the clouds drift past.`,
  ]
  if (isRoomBuilt('library')) pool.push(
    `${name1} and ${name2} are curled up in the Library, sharing a blanket over the same book.`,
    `You find them in the Library arguing softly about a passage. It's clearly not serious.`
  )
  if (isRoomBuilt('kitchen')) pool.push(
    `${name1} is teaching ${name2} a recipe in the Kitchen. There's flour everywhere.`,
    `The Kitchen smells incredible. ${name1} insists whatever's on the stove is "almost ready."`,
  )
  if (isRoomBuilt('training')) pool.push(
    `${name1} and ${name2} are sparring lightly in the Training Ground. ${name2} is clearly holding back.`,
    `They've set up a rest spot beside the Training Ground, catching their breath together.`,
  )
  return pool[Math.floor(Math.random() * pool.length)]
}

type VisitPhase = 'greeting' | 'responded' | 'confessing' | 'confessed'

function CompanionVisitSheet({
  visitor,
  affinityRecord,
  loverCount,
  onClose,
}: {
  visitor: VisitorInfo
  affinityRecord: import('../../types').GameCompanionAffinity | null
  loverCount: number
  onClose: () => void
}) {
  const isJointVisit = !!visitor.partnerId
  const isLover      = affinityRecord?.is_lover ?? false
  const affinity     = affinityRecord?.affinity ?? 0
  const canConfess   = !isLover && affinity >= 100 && loverCount < 2

  const [greeting] = useState(() => {
    if (isLover && affinityRecord?.lover_dialogue?.length) {
      const lines = affinityRecord.lover_dialogue
      return lines[Math.floor(Math.random() * lines.length)]
    }
    return getVisitGreeting()
  })
  const [jointScene] = useState(() =>
    isJointVisit && visitor.partnerName
      ? pickJointScene(visitor.companionName, visitor.partnerName)
      : ''
  )

  const [phase, setPhase] = useState<VisitPhase>('greeting')
  const [affinityDelta, setAffinityDelta] = useState(0)
  const [confessionAccepted, setConfessionAccepted] = useState<boolean | null>(null)

  async function handleResponse(delta: number) {
    const gardenBonus = isRoomBuilt('garden') ? 2 : 0
    const finalDelta = delta + gardenBonus
    setAffinityDelta(finalDelta)
    setPhase('responded')
    await recordCompanionVisit(visitor.companionId, finalDelta)
  }

  async function handleConfess(accepted: boolean) {
    setConfessionAccepted(accepted)
    setPhase('confessed')
    if (accepted) {
      await setLoverStatus(visitor.companionId, true)
      await recordCompanionVisit(visitor.companionId, 20)
    } else {
      await recordCompanionVisit(visitor.companionId, 0)
    }
  }

  function handleJointClose() {
    onClose()
  }

  const accentRing   = isLover ? 'ring-2 ring-rose-300 dark:ring-rose-700' : ''
  const headerBg     = isLover ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-primary-100 dark:bg-primary-900/30'
  const headerIcon   = isLover ? 'text-rose-500' : 'text-primary-500'
  const headerSub    = isLover ? '💕 Your Lover stopped by' : 'A companion stopped by today'

  // ── Joint visit ─────────────────────────────────────────────────────────────
  if (isJointVisit) {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={handleJointClose}>
        <div className="w-full rounded-t-2xl bg-card p-6 pb-10 shadow-xl" onClick={e => e.stopPropagation()}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
              <Heart className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="font-bold text-text-primary">
                {visitor.companionName} & {visitor.partnerName} are together!
              </p>
              <p className="text-xs text-muted">💕 Your Lovers are at the Guild Hall</p>
            </div>
          </div>
          <div className="mb-6 rounded-xl bg-surface px-4 py-4">
            <p className="text-sm text-text-primary italic">{jointScene}</p>
          </div>
          <button onClick={handleJointClose} className="w-full rounded-xl bg-rose-500 py-3 text-sm font-bold text-white">
            💕 A lovely sight
          </button>
        </div>
      </div>
    )
  }

  // ── Normal visit ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className={`w-full rounded-t-2xl bg-card p-6 pb-10 shadow-xl ${accentRing}`}
        onClick={e => e.stopPropagation()}
      >

        {phase === 'greeting' && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${headerBg}`}>
                <Heart className={`h-5 w-5 ${headerIcon}`} />
              </div>
              <div>
                <p className="font-bold text-text-primary">{visitor.companionName} is visiting!</p>
                <p className="text-xs text-muted">{headerSub}</p>
              </div>
            </div>
            <div className="mb-5 rounded-xl bg-surface px-4 py-3">
              <p className="text-sm text-text-primary italic">"{greeting}"</p>
            </div>
            <p className="mb-3 text-xs text-muted font-medium uppercase tracking-wide">How do you respond?</p>
            <div className="space-y-2">
              {VISIT_RESPONSES.map(r => (
                <button
                  key={r.tone}
                  onClick={() => handleResponse(r.delta)}
                  className="w-full rounded-xl bg-surface px-4 py-3 text-left text-sm text-text-primary hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  {r.text}
                </button>
              ))}
            </div>
            {canConfess && (
              <button
                onClick={() => setPhase('confessing')}
                className="mt-3 w-full rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-left text-sm font-medium text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-100 dark:hover:bg-rose-900/30"
              >
                💕 There's something I want to tell you…
              </button>
            )}
          </>
        )}

        {phase === 'responded' && (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">
              {affinityDelta > 0 ? (isLover ? '💕' : '💛') : affinityDelta < 0 ? '😶' : '😊'}
            </p>
            <p className="font-bold text-text-primary mb-1">
              {affinityDelta > 0
                ? `Your bond with ${visitor.companionName} grows stronger!`
                : affinityDelta < 0
                  ? 'A cool response…'
                  : 'A quiet moment.'}
            </p>
            {affinityDelta !== 0 && (
              <p className="text-xs text-muted mb-5">Affinity {affinityDelta > 0 ? `+${affinityDelta}` : affinityDelta}</p>
            )}
            <button onClick={onClose} className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-white">
              Close
            </button>
          </div>
        )}

        {phase === 'confessing' && (
          <>
            <div className="mb-5 rounded-xl bg-rose-50 dark:bg-rose-950/20 px-4 py-4">
              <p className="text-sm text-text-primary">
                <span className="font-semibold">You:</span>{' '}
                "There's something I want to tell you, {visitor.companionName}…"
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleConfess(true)}
                className="w-full rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition-all active:scale-[0.98]"
              >
                Tell them how you feel 💕
              </button>
              <button
                onClick={() => handleConfess(false)}
                className="w-full rounded-xl bg-surface px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-primary-50"
              >
                Just smile and move on
              </button>
            </div>
          </>
        )}

        {phase === 'confessed' && (
          <div className="text-center py-4">
            {confessionAccepted ? (
              <>
                <p className="text-5xl mb-3">💕</p>
                <p className="font-bold text-text-primary mb-2">
                  {visitor.companionName} reaches out. A quiet understanding passes between you.
                </p>
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium mb-5">
                  💕 {visitor.companionName} is now your Lover. Affinity +20.
                </p>
              </>
            ) : (
              <>
                <p className="text-4xl mb-3">😊</p>
                <p className="font-bold text-text-primary mb-1">A warm moment.</p>
                <p className="text-xs text-muted mb-5">
                  You smile and {visitor.companionName} smiles back. Nothing needs to be said.
                </p>
              </>
            )}
            <button onClick={onClose} className="w-full rounded-xl bg-primary-500 py-3 text-sm font-bold text-white">
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Perform quiz sheet ────────────────────────────────────────────────────────

function PerformSheet({ customQuestions, onClose }: { customQuestions: ReturnType<typeof useCustomQuestions>; onClose: () => void }) {
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<{ correct: boolean; gold: number } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setQuestion(getPerformQuestion(customQuestions ?? []))
  }, [customQuestions])

  async function handleSubmit(submittedAnswer: string) {
    if (loading || result) return
    setLoading(true)
    const correct = submittedAnswer.trim().toLowerCase() === question!.answer.toLowerCase()
    const gold = (await submitPerformAnswer(correct)) ?? 0
    setResult({ correct, gold })
    setLoading(false)
  }

  function handleNext() {
    if (!canPerformToday()) {
      onClose()
      return
    }
    setQuestion(getPerformQuestion(customQuestions ?? []))
    setAnswer('')
    setResult(null)
  }

  if (!question) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-card p-6 pb-10 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <h2 className="text-base font-bold text-text-primary">Perform</h2>
          <span className="ml-auto text-xs text-muted">
            {getPerformsToday()}/{PERFORM_DAILY_LIMIT} today
          </span>
        </div>
        <p className="mb-5 text-xs text-muted">Answer correctly to earn 🪙 15 Gold.</p>

        {!result ? (
          <>
            <p className="mb-5 text-center text-lg font-semibold text-text-primary">{question.question}</p>

            {question.options ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {question.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleSubmit(opt)}
                    disabled={loading}
                    className="rounded-xl bg-surface py-3 px-4 text-sm font-medium text-text-primary hover:bg-primary-50 active:scale-95 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-4 flex gap-2">
                <input
                  type={question.type === 'math' ? 'number' : 'text'}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit(answer)}
                  placeholder="Your answer…"
                  autoFocus
                  className="flex-1 rounded-xl border border-primary-200 dark:border-primary-800 bg-surface px-4 py-3 text-text-primary focus:border-primary-400 focus:outline-none"
                />
                <button
                  onClick={() => handleSubmit(answer)}
                  disabled={!answer.trim() || loading}
                  className="rounded-xl bg-primary-500 px-5 py-3 font-bold text-white disabled:opacity-50"
                >
                  →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mb-6 text-center">
            {result.correct ? (
              <>
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">Correct!</p>
                <p className="text-sm text-muted mt-1">You earned 🪙 {result.gold} Gold.</p>
              </>
            ) : (
              <>
                <p className="text-4xl mb-2">💭</p>
                <p className="text-lg font-bold text-text-primary">Not quite.</p>
                <p className="text-sm text-muted mt-1">The answer was: <strong>{question.answer}</strong></p>
              </>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {result && canPerformToday() && (
            <button
              onClick={handleNext}
              className="flex-1 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white"
            >
              Next question
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-surface py-3 text-sm font-medium text-muted"
          >
            {result && !canPerformToday() ? 'Done for today' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function JourneyPage() {
  const navigate = useNavigate()
  const gameState = useGameState()
  const activeQuests = useActiveQuests()
  const customQuestions = useCustomQuestions()
  const affinities = useCompanionAffinities()
  const companions = useCompanions()

  const [showPerform, setShowPerform] = useState(false)
  const [begResult, setBegResult] = useState<number | null>(null)
  const [begging, setBegging] = useState(false)
  const [claimMsg, setClaimMsg] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [visitor, setVisitor] = useState<VisitorInfo | null>(null)
  const [showVisitSheet, setShowVisitSheet] = useState(false)
  const [fortune, setFortune] = useState<StoredFortune | null>(null)

  // Ensure row, roll for encounter, then check for daily visitor
  useEffect(() => {
    ensureGameState().then(async state => {
      if (!state.activated) return
      // Roaming encounter: 1-in-6 chance per day
      const region = state.current_region ?? 'ponyville'
      const encounterId = rollEncounter(region)
      if (encounterId) {
        recordEncounterToday()
        navigate(`/journey/encounter/${encounterId}`)
        return
      }
      // Weekly fortune event
      setFortune(getOrPickWeeklyEvent())
      // Companion visit: 10% chance per Journey open
      const v = await getOrPickDailyVisitor()
      if (v) setVisitor(v)
    })
  }, [])

  // Redirect to activation screen if not yet activated
  useEffect(() => {
    if (gameState === undefined) return
    if (!gameState.activated) {
      navigate('/journey/start', { replace: true })
    }
  }, [gameState, navigate])

  async function handleBeg() {
    setBegging(true)
    const earned = await beg()
    setBegResult(earned)
    setBegging(false)
  }

  async function handleRefreshQuests() {
    setRefreshing(true)
    await generateQuestsIfNeeded()
    setRefreshing(false)
  }

  function handleClaimed() {
    setClaimMsg('Quest complete! Gold added to your purse. 🪙')
    setTimeout(() => setClaimMsg(null), 3000)
  }

  if (gameState === undefined) return null

  const weekly = activeQuests?.filter(q => q.is_weekly) ?? []
  const monthly = activeQuests?.filter(q => !q.is_weekly) ?? []
  const showEarlyGame = (gameState?.gold ?? 0) < BEG_GOLD_THRESHOLD
  const bossDefeated = isBossDefeated(BOSSES.nightmare_moon.id)

  const companionMap = new Map((companions ?? []).map(c => [c.id!, c.name]))
  const discoveredAffinities = (affinities ?? []).filter(a => a.is_discovered)
  const loverCount = (affinities ?? []).filter(a => a.is_lover).length
  const visitorAffinity = visitor
    ? (affinities ?? []).find(a => a.companion_id === visitor.companionId) ?? null
    : null

  return (
    <>
      <TopBar title="Journey" />
      <PageContainer>

        {/* Currency row */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-card p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-text-primary">{gameState?.sparks ?? 0}</p>
            <p className="text-xs text-muted flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Sparks
            </p>
            <p className="text-[10px] text-muted mt-0.5">from health logging</p>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-text-primary">{gameState?.gold ?? 0}</p>
            <p className="text-xs text-muted flex items-center justify-center gap-1">
              <Coins className="h-3 w-3 text-yellow-500" /> Gold
            </p>
            <p className="text-[10px] text-muted mt-0.5">from quests & exploring</p>
          </div>
        </div>

        {/* World Map */}
        <button
          onClick={() => navigate('/journey/map')}
          className="mb-3 flex w-full items-center gap-3 rounded-xl bg-card p-4 shadow-sm text-left transition-all active:scale-[0.98]"
        >
          <MapIcon className="h-5 w-5 shrink-0 text-teal-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">World Map</p>
            <p className="text-[10px] text-muted">Explore Equestria · see locked regions</p>
          </div>
          <span className="text-xs text-muted">🍎 Ponyville</span>
        </button>

        {/* Navigation — Guild Hall + Boss */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/journey/guild')}
            className="flex flex-col items-center gap-2 rounded-xl bg-card p-4 shadow-sm text-center transition-all active:scale-95"
          >
            <Home className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Guild Hall</p>
              <p className="text-[10px] text-muted">Build rooms with Sparks</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/journey/boss/nightmare_moon')}
            className="flex flex-col items-center gap-2 rounded-xl bg-card p-4 shadow-sm text-center transition-all active:scale-95"
          >
            <Swords className="h-6 w-6 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Boss Battle</p>
              <p className="text-[10px] text-muted">
                {bossDefeated ? '🌙 Defeated ✓' : '🌙 Nightmare Moon'}
              </p>
            </div>
          </button>
        </div>

        {/* Fortune event */}
        {fortune && (() => {
          const def = getFortuneEventDef(fortune.eventId)
          if (!def) return null
          const resolved = fortune.chosenId !== null
          const chosenDef = resolved ? def.choices.find(c => c.id === fortune.chosenId) : null
          const gold = gameState?.gold ?? 0

          return (
            <div className={`mb-5 rounded-xl shadow-sm overflow-hidden ${resolved ? 'bg-card' : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800'}`}>
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{def.emoji}</span>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                    {resolved ? "This week's event" : 'World event this week'}
                  </p>
                </div>
                <p className="font-bold text-text-primary mb-1">{def.title}</p>
                {!resolved && (
                  <p className="text-sm text-muted">{def.description}</p>
                )}
                {resolved && chosenDef && (
                  <p className="text-sm text-muted italic">"{chosenDef.outcome}"</p>
                )}
              </div>

              {!resolved && (
                <div className="px-4 pb-4 space-y-2">
                  {def.choices.map(choice => {
                    const canAfford = choice.goldCost === 0 || gold >= choice.goldCost
                    return (
                      <button
                        key={choice.id}
                        disabled={!canAfford}
                        onClick={async () => {
                          const updated = await resolveFortuneChoice(fortune, choice.id, gold)
                          if (updated) setFortune(updated)
                        }}
                        className="w-full rounded-xl bg-card px-4 py-3 text-left transition-all active:scale-[0.98] disabled:opacity-40"
                      >
                        <p className="text-sm font-medium text-text-primary">{choice.label}</p>
                        <p className="text-xs text-muted mt-0.5">{canAfford ? choice.hint : `Need ${choice.goldCost}🪙 (you have ${gold}🪙)`}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {/* Claim toast */}
        {claimMsg && (
          <div className="mb-4 rounded-xl bg-green-100 dark:bg-green-900/30 px-4 py-3 text-sm text-green-700 dark:text-green-300 text-center font-medium">
            {claimMsg}
          </div>
        )}

        {/* Visitor banner */}
        {visitor && (
          <button
            onClick={() => setShowVisitSheet(true)}
            className="mb-5 w-full rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 px-4 py-3 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
          >
            <span className="text-2xl">💛</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">{visitor.companionName} is here!</p>
              <p className="text-xs text-muted">Your companion stopped by. Tap to respond.</p>
            </div>
          </button>
        )}

        {/* Early game — beg / perform */}
        {showEarlyGame && (
          <div className="mb-5 rounded-xl bg-card p-4 shadow-sm">
            <p className="mb-1 text-sm font-semibold text-text-primary">📖 Early Days</p>
            <p className="mb-3 text-xs text-muted">You're just starting out. Earn your first Gold by begging or performing.</p>
            <div className="flex gap-3">
              <button
                onClick={handleBeg}
                disabled={begging || !canBegToday()}
                className="flex-1 rounded-xl bg-surface py-3 text-sm font-medium text-muted hover:bg-primary-50 disabled:opacity-50 transition-colors"
              >
                {!canBegToday() ? 'Begged today' : begging ? 'Begging…' : 'Beg (2–5🪙)'}
              </button>
              <button
                onClick={() => setShowPerform(true)}
                disabled={!canPerformToday()}
                className="flex-1 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white disabled:opacity-50 transition-colors"
              >
                {canPerformToday() ? `Perform (15🪙)` : `Performed ${PERFORM_DAILY_LIMIT}×`}
              </button>
            </div>
            {begResult !== null && (
              <p className="mt-2 text-center text-xs text-muted">
                You earned 🪙 {begResult} Gold from begging.
              </p>
            )}
          </div>
        )}

        {/* Weekly quests */}
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Weekly Quests ({weekly.length}/3)
            </h3>
            <button
              onClick={handleRefreshQuests}
              disabled={refreshing}
              className="flex items-center gap-1 text-xs text-primary-500"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          {weekly.length === 0 ? (
            <p className="rounded-xl bg-card px-4 py-6 text-center text-sm text-muted shadow-sm">
              No weekly quests yet. Tap Refresh to generate some.
            </p>
          ) : (
            <div className="space-y-3">
              {weekly.map(q => (
                <QuestCard key={q.id} quest={q} onClaimed={handleClaimed} />
              ))}
            </div>
          )}
        </div>

        {/* Monthly quests */}
        <div className="mb-5">
          <h3 className="mb-3 text-sm font-semibold text-muted uppercase tracking-wide">
            Monthly Quests ({monthly.length}/6)
          </h3>
          {monthly.length === 0 ? (
            <p className="rounded-xl bg-card px-4 py-6 text-center text-sm text-muted shadow-sm">
              No monthly quests yet. Tap Refresh above to generate some.
            </p>
          ) : (
            <div className="space-y-3">
              {monthly.map(q => (
                <QuestCard key={q.id} quest={q} onClaimed={handleClaimed} />
              ))}
            </div>
          )}
        </div>

        {/* Companion affinities */}
        {discoveredAffinities.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-3 text-sm font-semibold text-muted uppercase tracking-wide">
              Companions
            </h3>
            <div className="rounded-xl bg-card shadow-sm divide-y divide-surface">
              {discoveredAffinities.map(a => (
                <div key={a.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                      <Heart className="h-4 w-4 text-primary-400" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      {companionMap.get(a.companion_id) ?? 'Companion'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-text-primary">{affinityLabel(a.affinity)}</p>
                    <p className="text-[10px] text-muted">affinity {a.affinity > 0 ? `+${a.affinity}` : a.affinity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current region */}
        <div className="rounded-xl bg-card px-4 py-3 shadow-sm text-center text-xs text-muted">
          📍 Currently in <span className="font-semibold text-text-primary capitalize">{gameState?.current_region ?? 'Ponyville'}</span>
          <span className="mx-1">·</span>Equestria
        </div>

        {/* Debug */}
        <button
          onClick={() => {
            const region = gameState?.current_region ?? 'ponyville'
            const pool = Object.values(ENCOUNTERS_ALL).filter(e => e.region === region)
            if (pool.length === 0) return
            const enc = pool[Math.floor(Math.random() * pool.length)]
            navigate(`/journey/encounter/${enc.id}`)
          }}
          className="mt-2 w-full rounded-xl bg-surface py-2 text-[10px] text-muted hover:bg-primary-50 transition-colors"
        >
          🧪 Debug: trigger random encounter
        </button>

      </PageContainer>

      {showPerform && (
        <PerformSheet
          customQuestions={customQuestions}
          onClose={() => setShowPerform(false)}
        />
      )}

      {visitor && showVisitSheet && (
        <CompanionVisitSheet
          visitor={visitor}
          affinityRecord={visitorAffinity}
          loverCount={loverCount}
          onClose={() => {
            setShowVisitSheet(false)
            setVisitor(null)
          }}
        />
      )}
    </>
  )
}
