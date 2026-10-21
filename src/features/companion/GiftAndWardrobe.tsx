import { useState } from 'react'
import { usePointsBalance } from '../../hooks/usePoints'
import { useProfile } from '../../hooks/useProfile'
import { getCompanionMessage } from '../../hooks/useCompanion'
import { giveGift, buyAccessory, wearAccessory } from '../../hooks/useCompanionFun'
import { traitsOf } from '../../lib/companionPersonality'
import { triggerCompanionMessage } from '../../lib/companionMessenger'
import { ACCESSORIES, GIFTS_FOR_COMPANIONS } from '../../lib/companionFun'
import type { Companion } from '../../types'

// Give a companion a gift with your points (COMPANION-PLAN 11h).
export function GiveGift({ companion, isCurrent }: { companion: Companion; isCurrent: boolean }) {
  const points = usePointsBalance() ?? 0
  const { profile } = useProfile()
  const [reaction, setReaction] = useState<string | null>(null)
  const [short, setShort] = useState<string | null>(null)

  async function give(id: string) {
    const gift = GIFTS_FOR_COMPANIONS.find(g => g.id === id)!
    if (!(await giveGift(companion, id))) {
      setShort(`You need ${gift.cost - points} more points for that one. Points come from everything you log.`)
      return
    }
    setShort(null)
    const values = { gift: `${gift.emoji} ${gift.name.toLowerCase()}` }
    setReaction(getCompanionMessage(companion.messages, 'gift_received', profile?.display_name ?? 'friend', values, traitsOf(companion)))
    if (isCurrent) triggerCompanionMessage('gift_received', values)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">You have <span className="font-semibold text-text-primary">{points} points</span>. A gift brings you and {companion.name} closer.</p>
      {reaction && (
        <div className="rounded-lg bg-surface p-3">
          <p className="text-sm text-text-primary">{reaction}</p>
          <p className="mt-1 text-xs text-muted">— {companion.name}</p>
        </div>
      )}
      {short && <p className="text-sm text-muted">{short}</p>}
      <div className="grid grid-cols-2 gap-2">
        {GIFTS_FOR_COMPANIONS.map(g => (
          <button key={g.id} onClick={() => give(g.id)} className={`rounded-xl bg-surface p-3 text-center ${points < g.cost ? 'opacity-50' : ''}`}>
            <span className="block text-3xl" aria-hidden>{g.emoji}</span>
            <span className="block text-sm text-text-primary">{g.name}</span>
            <span className="block text-xs text-muted">{g.cost} points</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Accessories: bought once with points, worn by any companion you choose.
export function Wardrobe({ companion }: { companion: Companion }) {
  const points = usePointsBalance() ?? 0
  const { profile } = useProfile()
  const owned = new Set(profile?.owned_accessories ?? [])
  const [short, setShort] = useState<string | null>(null)

  async function choose(id: string) {
    if (!owned.has(id)) {
      const accessory = ACCESSORIES.find(a => a.id === id)!
      if (!(await buyAccessory(id))) {
        setShort(`You need ${accessory.cost - points} more points for the ${accessory.name.toLowerCase()}.`)
        return
      }
    }
    setShort(null)
    await wearAccessory(companion.id!, companion.accessory === id ? null : id)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Buy an accessory once, then any companion can wear it. You have <span className="font-semibold text-text-primary">{points} points</span>. During themed weeks, companions without one wear something seasonal.</p>
      {short && <p className="text-sm text-muted">{short}</p>}
      <div className="grid grid-cols-3 gap-2">
        {ACCESSORIES.map(a => {
          const wearing = companion.accessory === a.id
          return (
            <button
              key={a.id}
              onClick={() => choose(a.id)}
              aria-pressed={wearing}
              className={`rounded-xl p-3 text-center ${wearing ? 'bg-primary-100 ring-2 ring-primary-400 dark:bg-primary-900/40' : 'bg-surface'}`}
            >
              <span className="block text-3xl" aria-hidden>{a.emoji}</span>
              <span className="block text-xs text-text-primary">{a.name}</span>
              <span className="block text-[11px] text-muted">{wearing ? 'Wearing' : owned.has(a.id) ? 'Owned' : `${a.cost} points`}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
