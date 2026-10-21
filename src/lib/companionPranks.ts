// A companion's prank (COMPANION-PLAN 11b): one ordinary button on the page
// turns invisible, still where it was and still working. The companion says
// nothing until you tap it, then owns up. It comes back by itself after a
// while or when you leave the page, and never hides anything that deletes,
// resets or saves your data.

const OFF_LIMITS = /delete|remove|reset|fresh|wipe|backup|restore|import|export|lock/i
const BACK_BY_ITSELF_MS = 25_000

function candidates(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('main button, main a')].filter(el => {
    if (el.closest('[role="dialog"]') || (el as HTMLButtonElement).disabled) return false
    const r = el.getBoundingClientRect()
    if (r.width < 24 || r.height < 16 || r.top < 64 || r.bottom > window.innerHeight - 80) return false
    return !OFF_LIMITS.test(`${el.textContent ?? ''} ${el.getAttribute('aria-label') ?? ''}`)
  })
}

// Returns a function that ends the prank quietly, or null when there's
// nothing suitable to hide.
export function startPrank(onFound: () => void, random: () => number = Math.random): (() => void) | null {
  const options = candidates()
  if (options.length === 0) return null
  const el = options[Math.floor(random() * options.length)]
  const before = { opacity: el.style.opacity, transition: el.style.transition }
  let over = false

  function restore() {
    if (over) return
    over = true
    clearTimeout(timer)
    el.removeEventListener('pointerdown', found, true)
    el.style.opacity = before.opacity
    // Let it fade back in before dropping the transition again.
    setTimeout(() => { el.style.transition = before.transition }, 400)
  }

  function found() {
    restore()
    onFound()
  }

  el.style.transition = 'opacity 0.3s'
  el.style.opacity = '0'
  el.addEventListener('pointerdown', found, true)
  const timer = setTimeout(restore, BACK_BY_ITSELF_MS)
  return restore
}
