// App-lock PIN storage, shared by the lock screen (components/AppLock.tsx)
// and the settings page that turns the lock on and off.
export const PIN_HASH_KEY = 'igb_pin_hash'
const LOCK_ENABLED_KEY = 'igb_lock_enabled'
export const LOCKOUT_KEY = 'igb_lockout_until'

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + 'igb_salt_2026')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function isLockEnabled(): boolean {
  return localStorage.getItem(LOCK_ENABLED_KEY) === 'true'
}

export async function enableLock(pin: string) {
  const hash = await hashPin(pin)
  localStorage.setItem(PIN_HASH_KEY, hash)
  localStorage.setItem(LOCK_ENABLED_KEY, 'true')
}

export function disableLock() {
  localStorage.removeItem(PIN_HASH_KEY)
  localStorage.removeItem(LOCK_ENABLED_KEY)
}
