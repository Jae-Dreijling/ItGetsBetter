import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import {
  useTrack, useMilestones, updateTrack, archiveTrack, deleteTrack, addMilestone, updateMilestone, deleteMilestone, moveMilestone,
} from '../../hooks/useGoals'
import { progress, sortMilestones, milestoneExtras } from '../../lib/goals'
import { MilestoneCheck } from './parts'
import type { GoalMilestone, GoalTrack } from '../../types'

export default function GoalTrackPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const track = useTrack(Number(id))

  return (
    <>
      <TopBar title={track ? track.name : 'Goal'} onBack={() => navigate('/me/goals')} />
      <PageContainer>
        {track === undefined ? null : track === null ? (
          <p className="py-8 text-center text-sm text-muted">This goal doesn't exist anymore.</p>
        ) : (
          <TrackDetails key={track.id} track={track} onGone={() => navigate('/me/goals', { replace: true })} />
        )}
      </PageContainer>
    </>
  )
}

const inputClass = 'w-full rounded-lg bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-muted focus:outline-none'

function TrackDetails({ track, onGone }: { track: GoalTrack; onGone: () => void }) {
  const milestones = sortMilestones(useMilestones(track.id))
  const [name, setName] = useState(track.name)
  const [newStep, setNewStep] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)
  const [confirm, setConfirm] = useState<'archive' | 'delete' | null>(null)
  const { done, total } = progress(milestones)

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!newStep.trim()) return
    await addMilestone(track.id!, newStep)
    setNewStep('')
  }

  async function act(which: 'archive' | 'delete') {
    if (confirm !== which) return setConfirm(which)
    if (which === 'archive') await archiveTrack(track.id!)
    else await deleteTrack(track.id!)
    onGone()
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl" aria-hidden>{track.emoji}</span>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => name.trim() && name.trim() !== track.name && updateTrack(track.id!, { name: name.trim() })}
          aria-label="Goal name"
          className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-text-primary focus:outline-none"
        />
        {total > 0 && <span className="shrink-0 text-xs text-muted">{done} of {total}</span>}
      </div>

      <div className="space-y-1.5">
        {milestones.map((m, i) => (
          <MilestoneRow
            key={m.id}
            milestone={m}
            open={openId === m.id}
            onToggleOpen={() => setOpenId(openId === m.id ? null : m.id!)}
            canMoveUp={i > 0}
            canMoveDown={i < milestones.length - 1}
          />
        ))}
      </div>

      <form onSubmit={add} className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-primary-200 px-3.5 py-2.5 dark:border-primary-800">
        <Plus className="h-5 w-5 text-primary-500" aria-hidden />
        <input
          value={newStep}
          onChange={e => setNewStep(e.target.value)}
          placeholder="Add a step"
          enterKeyHint="done"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-primary-500 focus:outline-none"
        />
      </form>
      <p className="mt-2 text-xs text-muted">Tap a step to rename it, move it, or give it an aim-for date or a treat.</p>

      <div className="mt-6 space-y-1 border-t border-primary-100 pt-3 dark:border-primary-900">
        <button onClick={() => act('archive')} className="w-full py-2 text-sm text-muted hover:text-text-primary">
          {confirm === 'archive' ? 'Tap again to put it away (nothing is lost)' : 'Put this goal away'}
        </button>
        <button onClick={() => act('delete')} className="w-full py-2 text-sm text-muted hover:text-danger">
          {confirm === 'delete' ? 'Tap again to delete it and its steps' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

function MilestoneRow({ milestone, open, onToggleOpen, canMoveUp, canMoveDown }: {
  milestone: GoalMilestone
  open: boolean
  onToggleOpen: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  const [text, setText] = useState(milestone.text)
  const [treat, setTreat] = useState(milestone.treat ?? '')
  const extras = milestoneExtras(milestone)

  return (
    <div className={`rounded-xl bg-card shadow-sm ${milestone.done_at ? 'opacity-70' : ''}`}>
      <div onClick={onToggleOpen} className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5">
        <MilestoneCheck milestone={milestone} />
        <div className="min-w-0 flex-1">
          <p className={`text-[15px] text-text-primary ${milestone.done_at ? 'line-through' : ''}`}>{milestone.text}</p>
          {extras && <p className="text-xs text-muted">{extras}</p>}
        </div>
      </div>

      {open && (
        <div className="space-y-2 border-t border-primary-100 px-3.5 py-3 dark:border-primary-900">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={() => text.trim() && text.trim() !== milestone.text && updateMilestone(milestone.id!, { text: text.trim() })}
            aria-label="Step"
            className={inputClass}
          />
          <label className="flex items-center gap-2 text-xs text-muted">
            Aim for (optional)
            <input
              type="date"
              value={milestone.aim_for ?? ''}
              onChange={e => updateMilestone(milestone.id!, { aim_for: e.target.value || null })}
              className="rounded-md bg-surface px-2 py-1 text-text-primary"
            />
          </label>
          <input
            value={treat}
            onChange={e => setTreat(e.target.value)}
            onBlur={() => treat.trim() !== (milestone.treat ?? '') && updateMilestone(milestone.id!, { treat: treat.trim() || null })}
            placeholder="A treat for reaching it (optional)"
            className={inputClass}
          />
          <div className="flex items-center gap-1">
            <button disabled={!canMoveUp} onClick={() => moveMilestone(milestone.track_id, milestone.id!, -1)} className="rounded-md p-1.5 text-muted disabled:opacity-30" aria-label="Move up">
              <ChevronUp className="h-4 w-4" />
            </button>
            <button disabled={!canMoveDown} onClick={() => moveMilestone(milestone.track_id, milestone.id!, 1)} className="rounded-md p-1.5 text-muted disabled:opacity-30" aria-label="Move down">
              <ChevronDown className="h-4 w-4" />
            </button>
            <span className="flex-1" />
            <button onClick={() => deleteMilestone(milestone.id!)} className="flex items-center gap-1 rounded-md p-1.5 text-xs text-muted hover:text-danger" aria-label="Remove step">
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
