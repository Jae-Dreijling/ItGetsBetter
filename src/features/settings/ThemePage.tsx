import { Check } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile, updateProfile } from '../../hooks/useProfile'
import { COLOR_THEMES, seasonFor, type ColorThemeId, type ColorThemeSetting } from '../../lib/themes'

const SEASON_LABELS: Record<ReturnType<typeof seasonFor>, string> = {
  spring: '🌸 Spring', summer: '☀️ Summer', autumn: '🍂 Autumn', winter: '❄️ Winter',
}

export default function ThemePage() {
  const { profile } = useProfile()
  const current: ColorThemeSetting = profile?.color_theme ?? 'coral'
  const season = seasonFor(new Date())

  async function choose(setting: ColorThemeSetting) {
    if (profile?.id) await updateProfile(profile.id, { color_theme: setting })
  }

  return (
    <>
      <TopBar title="Colour Theme" />
      <PageContainer>
        <div className="space-y-3">
          <ThemeCard
            previewTheme={season}
            title="Follow the seasons"
            description={`Changes with the time of year. Right now: ${SEASON_LABELS[season]}`}
            selected={current === 'seasonal'}
            onSelect={() => choose('seasonal')}
          />

          <p className="px-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Or pick one</p>

          {COLOR_THEMES.map(theme => (
            <ThemeCard
              key={theme.id}
              previewTheme={theme.id}
              title={`${theme.emoji} ${theme.name}`}
              description={theme.description}
              selected={current === theme.id}
              onSelect={() => choose(theme.id)}
            />
          ))}
        </div>
      </PageContainer>
    </>
  )
}

// The card carries the theme's data-theme attribute, so its swatches show the
// real palette from index.css without duplicating any colours here.
function ThemeCard({ previewTheme, title, description, selected, onSelect }: {
  previewTheme: ColorThemeId
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      data-theme={previewTheme}
      className={`flex w-full items-center gap-3 rounded-xl bg-card p-4 text-left shadow-sm transition-transform duration-100 active:scale-[0.98] ${
        selected ? 'ring-2 ring-primary-400' : ''
      }`}
    >
      <div className="flex shrink-0 -space-x-2">
        <span className="h-8 w-8 rounded-full border-2 border-card bg-primary-500" />
        <span className="h-8 w-8 rounded-full border-2 border-card bg-secondary-400" />
        <span className="h-8 w-8 rounded-full border-2 border-card bg-accent-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-text-primary">{title}</p>
        <p className="text-sm text-muted">{description}</p>
      </div>
      {selected && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
          <Check className="h-4 w-4" />
        </span>
      )}
    </button>
  )
}
