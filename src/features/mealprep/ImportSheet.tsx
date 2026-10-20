import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { FileUp } from 'lucide-react'
import { isNativeApp } from '../../lib/platform'
import { parseMealPlanFile, type ImportPlan, type MealPlanFile } from '../../lib/mealPlanImport'
import { previewImport, applyImport } from '../../hooks/useMealPlan'

type State =
  | { step: 'pick' }
  | { step: 'errors'; errors: string[] }
  | { step: 'preview'; file: MealPlanFile; plan: ImportPlan }

// Pick a meal plan file, see exactly what it will change, then confirm.
// Nothing is written before "Import".
export default function ImportSheet({ onDone }: { onDone: (firstDate: string) => void }) {
  const [state, setState] = useState<State>({ step: 'pick' })
  const [useTarget, setUseTarget] = useState(false)
  const [working, setWorking] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    const result = parseMealPlanFile(await picked.text())
    if (!result.ok) {
      setState({ step: 'errors', errors: result.errors })
      return
    }
    setState({ step: 'preview', file: result.file, plan: await previewImport(result.file) })
  }

  async function confirm() {
    if (state.step !== 'preview' || working) return
    setWorking(true)
    try {
      await applyImport(state.plan, useTarget ? state.file.dailyKcalTarget : null)
      onDone(state.file.from)
    } catch (err) {
      setState({ step: 'errors', errors: [`Import failed, nothing was changed: ${err instanceof Error ? err.message : String(err)}`] })
    } finally {
      setWorking(false)
    }
  }

  const picker = (
    <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 font-semibold text-white">
      <FileUp className="h-4 w-4" />
      {state.step === 'pick' ? 'Choose a file' : 'Choose another file'}
      <input
        type="file"
        // Android's picker greys out types it doesn't know, so the app shows every file.
        accept={isNativeApp() ? undefined : '.json,application/json'}
        onChange={handleFile}
        className="hidden"
      />
    </label>
  )

  if (state.step === 'pick') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          Import a week plan exported from another app ("Export for ItGetsBetter", a .json file). You'll see what changes before anything is saved.
        </p>
        {picker}
      </div>
    )
  }

  if (state.step === 'errors') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-text-primary">This file can't be imported yet:</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {state.errors.slice(0, 8).map((err, i) => <li key={i}>{err}</li>)}
          {state.errors.length > 8 && <li>…and {state.errors.length - 8} more.</li>}
        </ul>
        {picker}
      </div>
    )
  }

  const { file, plan } = state
  const range = `${format(parseISO(file.from), 'd MMM')} – ${format(parseISO(file.to), 'd MMM')}`
  const lines = [
    `${plan.entries.length} planned meal${plan.entries.length === 1 ? '' : 's'} for ${range}`,
    `${file.recipes.length} recipe${file.recipes.length === 1 ? '' : 's'}: ${plan.newRecipes.length} new, ${plan.updatedRecipes.length} updated`,
    plan.replacedItemIds.length > 0 ? `Replaces ${plan.replacedItemIds.length} meal${plan.replacedItemIds.length === 1 ? '' : 's'} you'd already planned for those days` : null,
    plan.keptEatenCount > 0 ? `${plan.keptEatenCount} meal${plan.keptEatenCount === 1 ? '' : 's'} you already ate stay as they are` : null,
  ].filter(Boolean)

  return (
    <div className="space-y-4">
      {file.sourceApp && <p className="text-xs text-muted">From {file.sourceApp}</p>}
      <ul className="space-y-1.5 text-sm text-text-primary">
        {lines.map((line, i) => <li key={i}>• {line}</li>)}
      </ul>

      {plan.warnings.length > 0 && (
        <div className="space-y-1 rounded-lg bg-surface p-3">
          {plan.warnings.map((w, i) => <p key={i} className="text-xs text-muted">{w}</p>)}
        </div>
      )}

      {file.dailyKcalTarget !== null && (
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input type="checkbox" checked={useTarget} onChange={e => setUseTarget(e.target.checked)} className="h-4 w-4 accent-primary-500" />
          Also set my daily target to {file.dailyKcalTarget.toLocaleString()} kcal
        </label>
      )}

      <button
        onClick={confirm}
        disabled={working}
        className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
      >
        {working ? 'Importing...' : 'Import'}
      </button>
      <button
        onClick={() => setState({ step: 'pick' })}
        className="w-full rounded-lg py-2 text-sm text-muted hover:text-text-primary"
      >
        Choose another file
      </button>
    </div>
  )
}
