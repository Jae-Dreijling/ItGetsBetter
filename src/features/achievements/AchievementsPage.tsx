import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Trophy } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useAchievements, checkAndUnlockAchievements } from '../../hooks/useAchievements'
import { ACHIEVEMENT_LIBRARY } from '../../lib/achievements'
import { FoldableSection } from '../../components/Folders'
import { useFoldState } from '../../hooks/useFolders'

// Achievements grouped by what they count, in this order; unknown kinds last.
const KINDS: { type: string; title: string; emoji: string }[] = [
  { type: 'app_open_days', title: 'Showing up', emoji: '📅' },
  { type: 'weight_lost', title: 'Weight', emoji: '⚖️' },
  { type: 'weights_logged', title: 'Weigh-ins', emoji: '📈' },
  { type: 'meals_logged', title: 'Meals', emoji: '🍽️' },
  { type: 'exercises_logged', title: 'Exercise', emoji: '🏃' },
  { type: 'water_goals_met', title: 'Water', emoji: '💧' },
  { type: 'total_points', title: 'Points', emoji: '⭐' },
]

export default function AchievementsPage() {
  const unlocked = useAchievements()
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])

  useEffect(() => {
    checkAndUnlockAchievements().then(names => {
      if (names.length > 0) setNewlyUnlocked(names)
    })
  }, [])

  const unlockedIds = new Set(
    unlocked?.map(a => a.trigger_type + ':' + a.trigger_value) ?? []
  )

  const fold = useFoldState('igb_fold_achievements')
  const kinds = [...KINDS, ...[...new Set(ACHIEVEMENT_LIBRARY.map(d => d.trigger_type))].filter(t => !KINDS.some(k => k.type === t)).map(type => ({ type, title: 'Other', emoji: '🏅' }))]
  const unlockedCount = unlocked?.length ?? 0
  const totalCount = ACHIEVEMENT_LIBRARY.length

  return (
    <>
      <TopBar title="Achievements" />
      <PageContainer>
        <div className="mb-5 rounded-2xl bg-card p-5 shadow-sm text-center">
          <Trophy className="mx-auto mb-1 h-8 w-8 text-accent-500" />
          <p className="text-3xl font-bold text-text-primary">
            {unlockedCount} / {totalCount}
          </p>
          <p className="text-sm text-muted">achievements unlocked</p>
        </div>

        {newlyUnlocked.length > 0 && (
          <div className="mb-5 rounded-2xl bg-accent-100 p-4 text-center">
            <p className="text-sm font-bold text-accent-700">
              🎉 New achievement{newlyUnlocked.length > 1 ? 's' : ''} unlocked!
            </p>
            {newlyUnlocked.map(name => (
              <p key={name} className="text-sm text-accent-600 mt-1">{name}</p>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {kinds.map(kind => {
            const defs = ACHIEVEMENT_LIBRARY.filter(d => d.trigger_type === kind.type)
            if (defs.length === 0) return null
            const got = defs.filter(d => unlockedIds.has(d.trigger_type + ':' + d.trigger_value)).length
            return (
              <FoldableSection key={kind.type} emoji={kind.emoji} title={kind.title} count={`${got} of ${defs.length}`} open={fold.isOpen(kind.type)} onToggle={() => fold.toggle(kind.type)}>
          {defs.map(def => {
            const key = def.trigger_type + ':' + def.trigger_value
            const isUnlocked = unlockedIds.has(key)
            const unlockedData = unlocked?.find(
              a => a.trigger_type === def.trigger_type && a.trigger_value === def.trigger_value
            )

            return (
              <div
                key={def.id}
                className={`flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-opacity ${
                  isUnlocked ? '' : 'opacity-40'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-2xl">
                  {isUnlocked ? def.icon : '🔒'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary">{def.name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {isUnlocked ? def.description : '???'}
                  </p>
                  {isUnlocked && unlockedData?.unlocked_at && (
                    <p className="text-xs text-muted mt-0.5">
                      Unlocked {format(new Date(unlockedData.unlocked_at), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
              </FoldableSection>
            )
          })}
        </div>
      </PageContainer>
    </>
  )
}
