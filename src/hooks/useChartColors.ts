import { useMemo, useSyncExternalStore } from 'react'

// Chart libraries draw SVG with colour attributes, which can't use CSS
// variables, so charts read the current theme's colours here. Re-reads when
// the theme or light/dark mode changes (both live on the <html> element).

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })
  return () => observer.disconnect()
}

function getThemeKey() {
  const root = document.documentElement
  return `${root.className}|${root.getAttribute('data-theme') ?? ''}`
}

// Resolves a CSS variable to a concrete colour (variables can hold color-mix()
// or oklch(), which the probe turns into plain rgb).
function readColor(probe: HTMLElement, variable: string, fallback: string) {
  probe.style.color = `var(${variable}, ${fallback})`
  return getComputedStyle(probe).color || fallback
}

export function useChartColors() {
  const themeKey = useSyncExternalStore(subscribe, getThemeKey)

  return useMemo(() => {
    void themeKey // recompute when the theme changes
    const probe = document.createElement('span')
    probe.style.display = 'none'
    document.body.appendChild(probe)
    const colors = {
      grid: readColor(probe, '--chart-grid', '#f0e6df'),
      axis: readColor(probe, '--muted', '#8c7a6e'),
      primary: readColor(probe, '--color-primary-400', '#f47e6c'),
      primaryStrong: readColor(probe, '--color-primary-500', '#ec5a42'),
      secondary: readColor(probe, '--color-secondary-400', '#4eb499'),
      secondaryStrong: readColor(probe, '--color-secondary-500', '#339980'),
      accent: readColor(probe, '--color-accent-500', '#eaaa08'),
      accentStrong: readColor(probe, '--color-accent-600', '#ca8404'),
      success: readColor(probe, '--color-success', '#5cb176'),
    }
    probe.remove()
    return colors
  }, [themeKey])
}
