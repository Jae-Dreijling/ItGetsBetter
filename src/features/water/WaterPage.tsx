import { useState } from 'react'
import { Undo2, Droplets } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useTodaysWater, useTodaysWaterTotal, addWaterEntry, undoLastWaterEntry } from '../../hooks/useWater'
import { useProfile } from '../../hooks/useProfile'
import { format } from 'date-fns'

const PRESETS = [
  { label: '250ml', ml: 250 },
  { label: '300ml', ml: 300 },
  { label: '500ml', ml: 500 },
  { label: '1L', ml: 1000 },
]

export default function WaterPage() {
  const { profile } = useProfile()
  const todaysEntries = useTodaysWater()
  const total = useTodaysWaterTotal()
  const [customAmount, setCustomAmount] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const goalMl = (profile as { water_goal_ml?: number } | undefined)?.water_goal_ml ?? 2000
  const progressPercent = total !== null && total !== undefined
    ? Math.min((total / goalMl) * 100, 100)
    : 0
  const totalDisplay = total !== null && total !== undefined ? total : 0

  async function handlePreset(ml: number) {
    await addWaterEntry(ml)
  }

  async function handleCustom() {
    const ml = parseInt(customAmount)
    if (isNaN(ml) || ml <= 0) return
    await addWaterEntry(ml)
    setCustomAmount('')
    setShowCustom(false)
  }

  async function handleUndo() {
    await undoLastWaterEntry()
  }

  return (
    <>
      <TopBar title="Water" />
      <PageContainer>
        <div className="mb-6 rounded-xl bg-card p-5 shadow-sm text-center">
          <Droplets className="mx-auto mb-2 h-10 w-10 text-secondary-400" />
          <p className="text-3xl font-bold text-text-primary">
            {totalDisplay >= 1000 ? `${(totalDisplay / 1000).toFixed(1)}L` : `${totalDisplay}ml`}
          </p>
          <p className="text-sm text-muted">
            of {goalMl >= 1000 ? `${(goalMl / 1000).toFixed(1)}L` : `${goalMl}ml`} goal
          </p>

          <div className="mt-3 h-4 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-secondary-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted">{Math.round(progressPercent)}%</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          {PRESETS.map(p => (
            <button
              key={p.ml}
              onClick={() => handlePreset(p.ml)}
              className="rounded-xl bg-secondary-100 py-4 text-center font-semibold text-secondary-700 transition-transform active:scale-95"
            >
              + {p.label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex gap-2">
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="flex-1 rounded-xl bg-card py-3 text-center text-sm font-medium text-muted shadow-sm"
            >
              Custom amount
            </button>
          ) : (
            <div className="flex flex-1 gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                placeholder="ml"
                min="1"
                className="flex-1 rounded-lg border border-primary-100 dark:border-primary-900 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleCustom}
                disabled={!customAmount || parseInt(customAmount) <= 0}
                className="rounded-lg bg-secondary-500 px-4 py-2.5 font-medium text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}

          <button
            onClick={handleUndo}
            disabled={!todaysEntries?.length}
            className="flex items-center gap-1 rounded-xl bg-card px-4 py-3 text-sm font-medium text-muted shadow-sm disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </button>
        </div>

        {todaysEntries && todaysEntries.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Today's entries</h3>
            <div className="space-y-1.5">
              {[...todaysEntries].reverse().map(entry => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg bg-card px-4 py-2.5 shadow-sm">
                  <span className="text-sm text-muted">
                    {format(new Date(entry.logged_at), 'h:mm a')}
                  </span>
                  <span className="font-medium text-text-primary">
                    {entry.amount_ml >= 1000 ? `${(entry.amount_ml / 1000).toFixed(1)}L` : `${entry.amount_ml}ml`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}
