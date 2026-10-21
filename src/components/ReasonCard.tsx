import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { useFeatureTiers } from '../hooks/useFeatures'
import { isOn } from '../lib/features'
import { pickReason } from '../lib/why'

// "One of your reasons", from the Motivation Vault (step 10b). Renders
// nothing when the vault is off or has no written reasons.
export default function ReasonCard({ prefer = [], seed, intro = 'One of your reasons', className = '' }: {
  prefer?: string[]
  // Keeps the same reason on screen; change it for a new one.
  seed: string
  intro?: string
  className?: string
}) {
  const tiers = useFeatureTiers()
  const notes = useLiveQuery(() => db.motivationNotes.toArray())
  if (!isOn(tiers, 'motivation_vault') || !notes) return null
  const reason = pickReason(notes, prefer, seed)
  if (!reason) return null
  return (
    <div className={`rounded-xl bg-surface p-3 ${className}`}>
      <p className="mb-0.5 text-xs font-medium text-muted">💭 {intro}</p>
      <p className="text-sm text-text-primary">{reason.text}</p>
    </div>
  )
}
