import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Sparkles, Coins, ShieldCheck, ArrowRight } from 'lucide-react'
import { activateGame, generateQuestsIfNeeded } from '../../lib/game'

export default function JourneyActivationPage() {
  const navigate = useNavigate()
  const [activating, setActivating] = useState(false)

  async function handleActivate() {
    setActivating(true)
    await activateGame()
    await generateQuestsIfNeeded()
    navigate('/journey', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface px-5 py-10">
      <div className="mx-auto w-full max-w-sm flex flex-col items-center">

        <div className="mb-6 text-6xl">🗺️</div>

        <h1 className="mb-2 text-center text-2xl font-bold text-text-primary">
          Begin your Journey
        </h1>
        <p className="mb-8 text-center text-sm text-muted leading-relaxed">
          Journey is an optional RPG that lives alongside your health app.
          Your real-life logging earns you safe currency — and the game gives
          you a world to spend it in.
        </p>

        <div className="mb-8 w-full space-y-4">
          <div className="flex gap-3 rounded-xl bg-card p-4 shadow-sm">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-text-primary">Sparks ✨</p>
              <p className="text-sm text-muted">Earned by logging meals, exercise, sleep, and more. Spent on your permanent home base. <strong>Never at risk.</strong></p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl bg-card p-4 shadow-sm">
            <Coins className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
            <div>
              <p className="font-semibold text-text-primary">Gold 🪙</p>
              <p className="text-sm text-muted">Earned by completing quests and exploring. Can be spent in the game. Every quest has a safe, zero-risk mode.</p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl bg-card p-4 shadow-sm">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
            <div>
              <p className="font-semibold text-text-primary">Your health data stays yours</p>
              <p className="text-sm text-muted">Nothing in the game can affect your logs, stats, or streaks. The game is always separate.</p>
            </div>
          </div>
        </div>

        <p className="mb-6 text-center text-xs text-muted">
          You arrive in Equestria as a traveller with nothing. The world is yours to explore at your own pace. No pressure, no punishments for not playing.
        </p>

        <button
          onClick={handleActivate}
          disabled={activating}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 py-4 text-lg font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-60"
        >
          {activating ? 'Starting…' : 'Start your Journey'}
          {!activating && <ArrowRight className="h-5 w-5" />}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-muted underline underline-offset-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
