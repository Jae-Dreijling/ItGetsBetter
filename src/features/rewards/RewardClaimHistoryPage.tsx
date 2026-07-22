import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { format } from 'date-fns'
import { Star } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useRewardClaims } from '../../hooks/useRewards'

export default function RewardClaimHistoryPage() {
  const navigate = useNavigate()
  const claims = useRewardClaims()

  const totalSpent = useMemo(
    () => claims?.reduce((sum, c) => sum + c.points_spent, 0) ?? 0,
    [claims]
  )

  const grouped = useMemo(() => {
    if (!claims) return []
    const map = new Map<string, typeof claims>()
    for (const claim of claims) {
      const key = format(new Date(claim.claimed_at), 'MMMM yyyy')
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(claim)
    }
    return Array.from(map.entries())
  }, [claims])

  return (
    <>
      <TopBar title="Claim History" onBack={() => navigate('/me/rewards')} />
      <PageContainer>
        {/* Summary card */}
        {claims && claims.length > 0 && (
          <div className="mb-5 flex gap-3">
            <div className="flex-1 rounded-xl bg-card p-3 shadow-sm text-center">
              <p className="text-xl font-bold text-accent-600 dark:text-accent-400">★ {totalSpent}</p>
              <p className="text-xs text-muted">total spent</p>
            </div>
            <div className="flex-1 rounded-xl bg-card p-3 shadow-sm text-center">
              <p className="text-xl font-bold text-text-primary">{claims.length}</p>
              <p className="text-xs text-muted">total claims</p>
            </div>
          </div>
        )}

        {grouped.map(([month, monthClaims]) => (
          <div key={month} className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{month}</p>
              <p className="text-xs text-muted">
                ★ {monthClaims.reduce((s, c) => s + c.points_spent, 0)}
              </p>
            </div>
            <div className="space-y-2">
              {monthClaims.map(claim => (
                <div key={claim.id} className="rounded-xl bg-card px-4 py-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-50 dark:bg-accent-900/30">
                      <Star className="h-4 w-4 text-accent-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">{claim.reward_name}</p>
                      <p className="text-xs text-muted">
                        {format(new Date(claim.claimed_at), 'EEE, MMM d · h:mm a')}
                      </p>
                      {claim.note && (
                        <p className="mt-1 text-xs text-muted italic">"{claim.note}"</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-danger shrink-0">-{claim.points_spent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(!claims || claims.length === 0) && (
          <div className="py-16 text-center">
            <Star className="mx-auto mb-3 h-10 w-10 text-muted/30" />
            <p className="font-medium text-text-primary mb-1">No claims yet</p>
            <p className="text-sm text-muted">Go treat yourself — you've earned it.</p>
          </div>
        )}
      </PageContainer>
    </>
  )
}
