import { useState, useEffect } from 'react'
import { Lock, Delete } from 'lucide-react'

const PIN_HASH_KEY = 'igb_pin_hash'
const LOCK_ENABLED_KEY = 'igb_lock_enabled'
const LOCKOUT_KEY = 'igb_lockout_until'

async function hashPin(pin: string): Promise<string> {
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

interface AppLockProps {
  onUnlock: () => void
}

export default function AppLock({ onUnlock }: AppLockProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockedOut, setLockedOut] = useState(false)

  useEffect(() => {
    const until = localStorage.getItem(LOCKOUT_KEY)
    if (until && Date.now() < parseInt(until)) {
      setLockedOut(true)
      const timer = setTimeout(() => {
        setLockedOut(false)
        localStorage.removeItem(LOCKOUT_KEY)
      }, parseInt(until) - Date.now())
      return () => clearTimeout(timer)
    }
  }, [])

  async function handleSubmit() {
    if (lockedOut || pin.length < 4) return
    const hash = await hashPin(pin)
    const stored = localStorage.getItem(PIN_HASH_KEY)

    if (hash === stored) {
      setAttempts(0)
      onUnlock()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setPin('')
      if (newAttempts >= 3) {
        const lockoutUntil = Date.now() + 60000
        localStorage.setItem(LOCKOUT_KEY, String(lockoutUntil))
        setLockedOut(true)
        setError('Too many attempts. Try again in 1 minute.')
        setTimeout(() => {
          setLockedOut(false)
          setError('')
          setAttempts(0)
          localStorage.removeItem(LOCKOUT_KEY)
        }, 60000)
      } else {
        setError(`Wrong PIN. ${3 - newAttempts} attempts left.`)
      }
    }
  }

  function addDigit(d: string) {
    if (pin.length < 6) setPin(p => p + d)
  }

  function removeDigit() {
    setPin(p => p.slice(0, -1))
  }

  useEffect(() => {
    if (pin.length === 4 || pin.length === 5 || pin.length === 6) {
      // Auto-submit not used — user taps confirm
    }
  }, [pin])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6">
      <Lock className="mb-4 h-10 w-10 text-primary-400" />
      <h1 className="mb-2 text-xl font-bold text-text-primary">ItGetsBetter</h1>
      <p className="mb-6 text-sm text-muted">Enter your PIN</p>

      <div className="mb-4 flex gap-2">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full ${i < pin.length ? 'bg-primary-500' : 'bg-surface border-2 border-primary-200'}`}
          />
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-3 gap-3 mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(key => {
          if (key === '') return <div key="empty" />
          if (key === 'del') {
            return (
              <button key="del" onClick={removeDigit} disabled={lockedOut} className="flex h-14 w-14 items-center justify-center rounded-full text-muted hover:bg-card">
                <Delete className="h-5 w-5" />
              </button>
            )
          }
          return (
            <button
              key={key}
              onClick={() => addDigit(key)}
              disabled={lockedOut || pin.length >= 6}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-lg font-semibold text-text-primary shadow-sm hover:bg-primary-50 transition-colors disabled:opacity-30"
            >
              {key}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={pin.length < 4 || lockedOut}
        className="rounded-xl bg-primary-500 px-8 py-2.5 font-semibold text-white disabled:opacity-50"
      >
        Unlock
      </button>
    </div>
  )
}
