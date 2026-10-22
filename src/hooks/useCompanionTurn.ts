import { useEffect, useState } from 'react'
import { useCompanions, useSessionCompanion } from './useCompanion'
import { allows, type CompanionOption } from '../lib/companionPersonality'
import { nextTurn, type TurnKind } from '../lib/companionTurns'
import type { Companion } from '../types'

// The switched-on companion whose turn it is for this kind of moment
// (lib/companionTurns), or null. The one with you goes first when it's due.
// undefined while loading.
export function useCompanionTurn(kind: TurnKind, option: CompanionOption, today: string): Companion | null | undefined {
  const companions = useCompanions()
  const session = useSessionCompanion()
  const [, setVersion] = useState(0)
  useEffect(() => {
    const bump = () => setVersion(v => v + 1)
    window.addEventListener('igb-turns', bump)
    return () => window.removeEventListener('igb-turns', bump)
  }, [])
  if (!companions || session === undefined) return undefined
  return nextTurn(kind, today, companions.filter(c => c.is_active && allows(c, option)), session?.id)
}
