import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Trophy } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useAchievements, checkAndUnlockAchievements } from '../../hooks/useAchievements'
import { ACHIEVEMENT_LIBRARY } from '../../lib/achievements'

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

        <div className="space-y-3">
          {ACHIEVEMENT_LIBRARY.map(def => {
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
        </div>
      </PageContainer>
    </>
  )
}
