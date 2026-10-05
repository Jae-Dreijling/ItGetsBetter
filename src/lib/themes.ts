// Colour themes. The palettes live in index.css as [data-theme="…"] blocks;
// "coral" is the default and uses no attribute. "seasonal" follows the
// calendar and resolves to one of the four season themes.

export type ColorThemeId = 'coral' | 'spring' | 'summer' | 'autumn' | 'winter'
export type ColorThemeSetting = ColorThemeId | 'seasonal'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface ColorTheme {
  id: ColorThemeId
  name: string
  emoji: string
  description: string
}

export const COLOR_THEMES: ColorTheme[] = [
  { id: 'coral', name: 'Coral', emoji: '🪸', description: 'The original warm coral and sage' },
  { id: 'spring', name: 'Spring', emoji: '🌸', description: 'Blossom pink and fresh green' },
  { id: 'summer', name: 'Summer', emoji: '☀️', description: 'Sea turquoise and sunny peach' },
  { id: 'autumn', name: 'Autumn', emoji: '🍂', description: 'Pumpkin orange and moss' },
  { id: 'winter', name: 'Winter', emoji: '❄️', description: 'Icy blue and pine' },
]

// Meteorological seasons (northern hemisphere): spring is March–May, etc.
export function seasonFor(date: Date): Season {
  const month = date.getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

export function resolveColorTheme(setting: ColorThemeSetting | undefined, date = new Date()): ColorThemeId {
  if (setting === 'seasonal') return seasonFor(date)
  return setting ?? 'coral'
}

export function applyColorTheme(id: ColorThemeId) {
  const root = document.documentElement
  if (id === 'coral') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', id)

  // Phone status bar / browser chrome colour follows the theme.
  const color = getComputedStyle(root).getPropertyValue('--color-primary-400').trim()
  const meta = document.querySelector('meta[name="theme-color"]')
  if (color && meta) meta.setAttribute('content', color)
}
