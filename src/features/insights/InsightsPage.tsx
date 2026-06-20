import { useState, useEffect } from 'react'
import { Lightbulb, Check, X, RefreshCw } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useInsights, generateInsights, saveInsight, respondToInsight } from '../../hooks/useInsights'

export default function InsightsPage() {
  const storedInsights = useInsights()
  const [generating, setGenerating] = useState(false)
  const [newInsights, setNewInsights] = useState<{ text: string; correlationType: string }[]>([])

  async function handleGenerate() {
    setGenerating(true)
    const results = await generateInsights()
    for (const r of results) {
      await saveInsight(r.text, r.correlationType)
    }
    setNewInsights(results)
    setGenerating(false)
  }

  useEffect(() => {
    handleGenerate()
  }, [])

  const pending = storedInsights?.filter(i => i.is_confirmed === null && i.is_rejected === null) ?? []
  const confirmed = storedInsights?.filter(i => i.is_confirmed === true) ?? []
  const rejected = storedInsights?.filter(i => i.is_rejected === true) ?? []

  return (
    <>
      <TopBar title="Health Insights" />
      <PageContainer>
        <div className="mb-5 rounded-2xl bg-card p-5 shadow-sm text-center">
          <Lightbulb className="mx-auto mb-2 h-8 w-8 text-accent-500" />
          <p className="text-sm text-text-primary font-medium">
            Insights are discovered by analyzing patterns in your data.
          </p>
          <p className="text-xs text-muted mt-1">
            Confirm the ones that feel accurate, dismiss the rest.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Analyzing...' : 'Check for New Insights'}
        </button>

        {pending.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Pending</h3>
            <div className="space-y-3">
              {pending.map(insight => (
                <div key={insight.id} className="rounded-2xl bg-card p-4 shadow-sm">
                  <p className="text-sm text-text-primary leading-relaxed mb-3">
                    {insight.insight_text}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToInsight(insight.id, true)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-success/15 py-2 text-sm font-medium text-success"
                    >
                      <Check className="h-4 w-4" /> Yes, accurate
                    </button>
                    <button
                      onClick={() => respondToInsight(insight.id, false)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-surface py-2 text-sm font-medium text-muted"
                    >
                      <X className="h-4 w-4" /> Not really
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {confirmed.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Confirmed Patterns</h3>
            <div className="space-y-2">
              {confirmed.map(insight => (
                <div key={insight.id} className="flex items-start gap-3 rounded-xl bg-card px-4 py-3 shadow-sm">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                  <p className="text-sm text-text-primary">{insight.insight_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {rejected.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase tracking-wide">Dismissed</h3>
            <div className="space-y-2">
              {rejected.map(insight => (
                <div key={insight.id} className="flex items-start gap-3 rounded-xl bg-card px-4 py-3 shadow-sm opacity-50">
                  <X className="h-4 w-4 mt-0.5 shrink-0 text-muted" />
                  <p className="text-sm text-muted">{insight.insight_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && confirmed.length === 0 && rejected.length === 0 && !generating && (
          <p className="text-center text-sm text-muted py-8">
            {newInsights.length === 0
              ? 'Not enough data yet to find patterns. Keep logging for a few weeks!'
              : 'No new insights found. Keep logging and check back later.'}
          </p>
        )}
      </PageContainer>
    </>
  )
}
