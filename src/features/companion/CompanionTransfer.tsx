import { useState } from 'react'
import { Download, FileUp } from 'lucide-react'
import Sheet from '../../components/Sheet'
import { db } from '../../db'
import { saveFile } from '../../lib/saveFile'
import { isNativeApp } from '../../lib/platform'
import { getLogicalDate } from '../../lib/date'
import type { Folder } from '../../types'
import {
  buildCompanionExport, parseCompanionFile, planCompanionImport, applyCompanionImport, withFolder, type CompanionImportPlan,
} from '../../lib/companionTransfer'

type ImportState =
  | { step: 'pick' }
  | { step: 'error'; error: string }
  | { step: 'preview'; plan: CompanionImportPlan; folders: Folder[] }
  | { step: 'done'; added: number }

// Export the companions you made, or import a file of companions. Importing
// only ever adds; see lib/companionTransfer.
export default function CompanionTransfer() {
  const [message, setMessage] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  async function exportCompanions() {
    setMessage(null)
    const file = await buildCompanionExport()
    if (file.companions.length === 0) {
      setMessage("You haven't made any companions yet, so there's nothing to export.")
      return
    }
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
    try {
      const where = await saveFile(blob, `itgetsbetter-companions-${getLogicalDate()}.json`)
      setMessage(`Saved ${file.companions.length} companion${file.companions.length === 1 ? '' : 's'} to ${where}.`)
    } catch (err) {
      setMessage(`Couldn't save the file: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <button onClick={exportCompanions} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-card py-2.5 text-sm font-medium text-text-primary shadow-sm">
          <Download className="h-4 w-4" /> Export mine
        </button>
        <button onClick={() => setImporting(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-card py-2.5 text-sm font-medium text-text-primary shadow-sm">
          <FileUp className="h-4 w-4" /> Import
        </button>
      </div>
      {message && <p className="mt-2 text-xs text-muted">{message}</p>}

      <Sheet open={importing} onClose={() => setImporting(false)} title="Import companions">
        <ImportFlow onClose={() => setImporting(false)} />
      </Sheet>
    </div>
  )
}

function ImportFlow({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<ImportState>({ step: 'pick' })
  const [working, setWorking] = useState(false)
  const [intoFolder, setIntoFolder] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    const parsed = parseCompanionFile(await picked.text())
    if (!parsed.ok) return setState({ step: 'error', error: parsed.error })
    const folders = await db.folders.where('area').equals('companions').toArray()
    setState({ step: 'preview', folders, plan: planCompanionImport(parsed.file, await db.companions.toArray(), await db.personalityGroups.toArray(), folders) })
  }

  async function confirm(plan: CompanionImportPlan) {
    setWorking(true)
    try {
      setState({ step: 'done', added: await applyCompanionImport(plan) })
    } catch (err) {
      setState({ step: 'error', error: `Import failed, nothing was added: ${err instanceof Error ? err.message : String(err)}` })
    } finally {
      setWorking(false)
    }
  }

  const picker = (label: string) => (
    <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 font-semibold text-white">
      <FileUp className="h-4 w-4" /> {label}
      <input type="file" accept={isNativeApp() ? undefined : '.json,application/json'} onChange={handleFile} className="hidden" />
    </label>
  )

  if (state.step === 'pick') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">Pick a companions file (.json). This only adds companions: nothing you have is changed or removed, and names you already have are skipped.</p>
        {picker('Choose a file')}
      </div>
    )
  }

  if (state.step === 'error') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-primary">{state.error}</p>
        {picker('Choose another file')}
      </div>
    )
  }

  if (state.step === 'done') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-4xl" aria-hidden>🎉</p>
        <p className="text-text-primary">Added {state.added} companion{state.added === 1 ? '' : 's'}. They're switched on, so they can start talking.</p>
        <button onClick={onClose} className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white">Done</button>
      </div>
    )
  }

  const plan = withFolder(state.plan, intoFolder, state.folders)
  const loose = state.plan.add.filter(c => !c.folder).length
  return (
    <div className="space-y-4">
      {plan.add.length > 0 ? (
        <div>
          <p className="mb-1.5 text-sm font-medium text-text-primary">Adds {plan.add.length} companion{plan.add.length === 1 ? '' : 's'}:</p>
          <p className="text-sm text-muted">{plan.add.map(c => c.name).join(', ')}</p>
        </div>
      ) : (
        <p className="text-sm text-text-primary">You already have every companion in this file. Nothing to add.</p>
      )}
      {plan.newGroups.length > 0 && (
        <p className="text-sm text-muted">Also adds the personality group{plan.newGroups.length === 1 ? '' : 's'} {plan.newGroups.map(g => g.name).join(', ')}.</p>
      )}
      {loose > 0 && (
        <label className="block text-sm text-text-primary">
          Put {loose === plan.add.length ? 'them' : `the ${loose} without a folder`} in a folder (optional)
          <input
            value={intoFolder}
            onChange={e => setIntoFolder(e.target.value)}
            list="companion-folders"
            placeholder="e.g. Obey Me"
            className="mt-1 w-full rounded-lg border border-primary-100 bg-surface px-3 py-2 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none dark:border-primary-900"
          />
          <datalist id="companion-folders">{state.folders.map(f => <option key={f.id} value={f.name} />)}</datalist>
        </label>
      )}
      {plan.newFolders.length > 0 && (
        <p className="text-sm text-muted">Makes the folder{plan.newFolders.length === 1 ? '' : 's'} {plan.newFolders.map(f => `${f.emoji} ${f.name}`).join(', ')}.</p>
      )}
      {plan.skipped.length > 0 && (
        <p className="text-xs text-muted">Skipped (you already have one with this name): {plan.skipped.join(', ')}</p>
      )}
      {plan.add.length > 0 ? (
        <button onClick={() => confirm(plan)} disabled={working} className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white disabled:opacity-50">
          {working ? 'Adding...' : `Add ${plan.add.length}`}
        </button>
      ) : (
        <button onClick={onClose} className="w-full rounded-lg bg-surface py-2.5 text-sm text-muted">Close</button>
      )}
    </div>
  )
}
