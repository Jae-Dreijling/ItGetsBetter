// Lets pages outside AppShell (e.g. the home screen's menu button) open the
// side menu without prop drilling. AppShell registers the opener on mount.
let opener: (() => void) | null = null

export function registerSideMenuOpener(fn: (() => void) | null) {
  opener = fn
}

export function openSideMenu() {
  opener?.()
}
