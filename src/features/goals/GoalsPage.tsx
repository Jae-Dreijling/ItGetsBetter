import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import Sheet from '../../components/Sheet'
import { useTracks, useMilestones, useArchivedTracks, bringBackTrack } from '../../hooks/useGoals'
import { PutAwaySection } from '../../components/Folders'
import { nextMilestone, progress, sortMilestones, milestoneExtras } from '../../lib/goals'
import { MilestoneCheck, NewTrackForm } from './parts'
import { useAutoLabel } from './useAutoLabel'
import type { GoalMilestone, GoalTrack } from '../../types'

export default function GoalsPage() {
  const navigate = useNavigate()
  const tracks = useTracks()
  const putAway = useArchivedTracks()
  const milestones = useMilestones()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <TopBar title="Goals" onBack={() => navigate('/me')} />
      <PageContainer>
        {tracks && tracks.length === 0 && (
          <div className="mb-4 rounded-xl bg-card p-5 text-center shadow-sm">
            <p className="mb-1 text-3xl" aria-hidden>🎯</p>
            <p className="font-medium text-text-primary">Your own goals, one step at a time.</p>
            <p className="mt-1 text-sm text-muted">A hobby, a skill, your health. Write the steps in your own words; you'll only ever see the next one up close.</p>
          </div>
        )}

        <div className="space-y-3">
          {tracks?.map(track => (
            <TrackCard
              key={track.id}
              track={track}
              milestones={milestones.filter(m => m.track_id === track.id)}
              onOpen={() => navigate(`/me/goals/${track.id}`)}
            />
          ))}
        </div>

        <button
          onClick={() => setAdding(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary-200 py-3 text-sm font-medium text-muted hover:bg-primary-50 dark:border-primary-800"
        >
          <Plus className="h-4 w-4" /> New goal
        </button>

        <PutAwaySection
          storageKey="igb_fold_goals"
          items={(putAway ?? []).map(t => ({ id: t.id!, emoji: t.emoji, name: t.name }))}
          onOpen={id => navigate(`/me/goals/${id}`)}
          onBringBack={bringBackTrack}
        />
      </PageContainer>

      <Sheet open={adding} onClose={() => setAdding(false)} title="New goal">
        <NewTrackForm onCreated={() => setAdding(false)} />
      </Sheet>
    </>
  )
}

// One thing to aim for: the next milestone big, the next two after it small.
function TrackCard({ track, milestones, onOpen }: { track: GoalTrack; milestones: GoalMilestone[]; onOpen: () => void }) {
  const next = nextMilestone(milestones)
  const { done, total } = progress(milestones)
  const later = sortMilestones(milestones).filter(m => !m.done_at && m.id !== next?.id).slice(0, 2)
  const lastReached = sortMilestones(milestones).filter(m => m.done_at).at(-1)
  const autoText = useAutoLabel()

  return (
    <div onClick={onOpen} className="cursor-pointer rounded-xl bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 font-medium text-text-primary">
          <span className="text-xl" aria-hidden>{track.emoji}</span>
          {track.name}
        </p>
        {total > 0 && <span className="text-xs text-muted">{done} of {total} reached</span>}
      </div>

      {next ? (
        <div className="flex items-start gap-3">
          <MilestoneCheck milestone={next} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted">Next</p>
            <p className="text-lg font-semibold leading-snug text-text-primary">{next.text}</p>
            {milestoneExtras(next) && <p className="text-xs text-muted">{milestoneExtras(next)}</p>}
            {autoText(next) && <p className="text-xs text-secondary-600 dark:text-secondary-300">⚖️ {autoText(next)}</p>}
            {later.length > 0 && <p className="mt-1.5 truncate text-xs text-muted">Then: {later.map(m => m.text).join(' · ')}</p>}
          </div>
        </div>
      ) : total > 0 ? (
        <p className="text-sm text-text-primary">Every milestone reached 🎉 Add a next step whenever you like.</p>
      ) : (
        <p className="text-sm text-muted">No steps yet. Tap to add the first one.</p>
      )}

      {lastReached?.treat && lastReached.done_at && (
        <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs text-text-primary">
          You reached "{lastReached.text}". Treat: {lastReached.treat} 🎁
        </p>
      )}
    </div>
  )
}
