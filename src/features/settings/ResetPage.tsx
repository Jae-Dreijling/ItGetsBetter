import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Download } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { RESET_AREAS, resetArea, type ResetArea } from '../../lib/resetArea'

// Reset one part of the app at a time. Each reset takes a second tap and says
// exactly what goes; everything else is untouched.
export default function ResetPage() {
  const navigate = useNavigate()
  const [armed, setArmed] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(null), 4000)
    return () => clearTimeout(t)
  }, [armed])

  async function tap(area: ResetArea) {
    if (armed !== area.id) {
      setArmed(area.id)
      setDone(null)
      return
    }
    setArmed(null)
    await resetArea(area.id)
    if (area.reloadAfter) {
      window.location.reload()
      return
    }
    setDone(`${area.name} is reset.`)
  }

  return (
    <>
      <TopBar title="Reset parts of the app" onBack={() => navigate('/settings')} />
      <PageContainer>
        <div className="mb-4 space-y-2 rounded-xl bg-card p-4 text-sm shadow-sm">
          <p className="text-text-primary">Start one part over without touching the rest. Each reset asks once more before it happens.</p>
          <button onClick={() => navigate('/settings/backup')} className="flex items-center gap-1.5 text-sm font-medium text-primary-500">
            <Download className="h-4 w-4" /> Make a backup first, just in case
          </button>
        </div>

        {done && <p role="status" className="mb-4 rounded-xl bg-secondary-100 px-4 py-2.5 text-sm text-secondary-700">{done}</p>}

        <div className="space-y-2">
          {RESET_AREAS.map(area => (
            <div key={area.id} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm">
              <span className="text-xl" aria-hidden>{area.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-text-primary">{area.name}</p>
                <p className="text-xs text-muted">Removes {area.removes}.</p>
              </div>
              <button
                onClick={() => tap(area)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  armed === area.id ? 'bg-danger text-white' : 'bg-surface text-muted'
                }`}
              >
                {armed === area.id ? 'Sure?' : 'Reset'}
              </button>
            </div>
          ))}
        </div>
      </PageContainer>
    </>
  )
}
