import { useNavigate } from 'react-router'
import { format } from 'date-fns'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { RecentThenMonths } from '../../components/Folders'
import { useGiftSafe } from '../../hooks/useCompanionFun'

// Every gift a companion gave you (COMPANION-PLAN 11h), newest first.
export default function GiftSafePage() {
  const navigate = useNavigate()
  const gifts = useGiftSafe()

  return (
    <>
      <TopBar title="Gift safe" onBack={() => navigate('/me')} />
      <PageContainer>
        {gifts && gifts.length === 0 && (
          <div className="rounded-xl bg-card p-5 text-center shadow-sm">
            <p className="mb-1 text-3xl" aria-hidden>🎁</p>
            <p className="font-medium text-text-primary">Your gift safe is empty, for now.</p>
            <p className="mt-1 text-sm text-muted">Companions sometimes bring you a little something: in a daily surprise, or when a visit ends.</p>
          </div>
        )}
        {!!gifts?.length && (
          <RecentThenMonths storageKey="igb_fold_gifts" items={gifts} dateOf={g => g.received_at} keep={12} render={g => (
            <div key={g.id} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm">
              <span className="text-3xl" aria-hidden>{g.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-text-primary">{g.name}</span>
                <span className="block text-xs text-muted">From {g.companion_name} · {format(new Date(g.received_at), 'd MMM yyyy')}</span>
              </span>
            </div>
          )} />
        )}
      </PageContainer>
    </>
  )
}
