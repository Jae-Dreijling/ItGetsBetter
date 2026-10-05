import { useState } from 'react'
import { Star } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useFeatureTiers, setFeatureTier } from '../../hooks/useFeatures'
import { FEATURES, FEATURE_GROUPS, SPOTLIGHT_CAP, spotlightCount, tierOf, type Feature, type FeatureTier, type FeatureTiers } from '../../lib/features'

export default function FeaturesPage() {
  const tiers = useFeatureTiers()
  const [hint, setHint] = useState<string | null>(null)
  const used = spotlightCount(tiers)

  async function choose(feature: Feature, tier: FeatureTier) {
    const ok = await setFeatureTier(feature.id, tier)
    setHint(ok ? null : `Your spotlight is full (${SPOTLIGHT_CAP}). Set something else to On first.`)
  }

  return (
    <>
      <TopBar title="Features" />
      <PageContainer>
        <div className="mb-4 space-y-1.5 rounded-xl bg-card p-4 text-sm shadow-sm">
          <p className="text-text-primary">Everything here is optional. Pick how much each feature asks of you:</p>
          <p className="text-muted"><strong className="text-text-primary">⭐ Spotlight</strong>: on your Today screen and allowed to remind you. Up to {SPOTLIGHT_CAP}.</p>
          <p className="text-muted"><strong className="text-text-primary">On</strong>: there when you want it, quiet otherwise.</p>
          <p className="text-muted"><strong className="text-text-primary">Off</strong>: hidden everywhere. Your data is kept.</p>
        </div>

        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between rounded-xl bg-accent-50 px-4 py-2.5 text-sm dark:bg-accent-900/30">
          <span className="flex items-center gap-1.5 font-medium text-text-primary">
            <Star className="h-4 w-4 text-accent-500" />
            Spotlight
          </span>
          <span className="font-semibold text-text-primary">{used} / {SPOTLIGHT_CAP}</span>
        </div>

        {hint && (
          <p role="status" className="mb-4 rounded-xl bg-primary-50 px-4 py-2.5 text-sm text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {hint}
          </p>
        )}

        {FEATURE_GROUPS.map(group => (
          <section key={group} className="mb-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{group}</h2>
            <div className="space-y-2">
              {FEATURES.filter(f => f.group === group).map(feature => (
                <FeatureRow key={feature.id} feature={feature} tiers={tiers} onChoose={tier => choose(feature, tier)} />
              ))}
            </div>
          </section>
        ))}
      </PageContainer>
    </>
  )
}

function FeatureRow({ feature, tiers, onChoose }: {
  feature: Feature
  tiers: FeatureTiers | undefined
  onChoose: (tier: FeatureTier) => void
}) {
  const current = tierOf(tiers, feature.id)
  const options: { tier: FeatureTier; label: string }[] = [
    ...(feature.canSpotlight ? [{ tier: 'spotlight' as const, label: '⭐' }] : []),
    { tier: 'available', label: 'On' },
    { tier: 'off', label: 'Off' },
  ]

  return (
    <div className={`flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm transition-opacity ${current === 'off' ? 'opacity-60' : ''}`}>
      <span className="text-xl" aria-hidden>{feature.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-text-primary">{feature.name}</p>
        <p className="truncate text-xs text-muted">{feature.description}</p>
      </div>
      <div role="radiogroup" aria-label={`${feature.name} setting`} className="flex shrink-0 rounded-lg bg-surface p-0.5">
        {options.map(option => {
          const selected = current === option.tier
          return (
            <button
              key={option.tier}
              role="radio"
              aria-checked={selected}
              aria-label={option.tier === 'spotlight' ? 'Spotlight' : option.label}
              onClick={() => onChoose(option.tier)}
              className={`min-w-10 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                selected
                  ? option.tier === 'spotlight' ? 'bg-accent-400 text-white' : option.tier === 'off' ? 'bg-muted text-white' : 'bg-primary-500 text-white'
                  : 'text-muted'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
