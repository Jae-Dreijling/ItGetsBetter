import { useState } from 'react'
import { m } from 'motion/react'
import { useEffectiveMessages } from '../../hooks/useCompanion'
import { useCompanionTurn } from '../../hooks/useCompanionTurn'
import { markTurn } from '../../lib/companionTurns'
import type { Companion } from '../../types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { useProfile } from '../../hooks/useProfile'
import { useObjectUrl } from '../../hooks/useObjectUrl'
import { getLogicalDate } from '../../lib/date'
import { fadeUp } from '../../lib/animations'
import { fillPlaceholders } from '../../lib/companionTriggers'
import { traitsOf } from '../../lib/companionPersonality'
import { closenessTier, changeCloseness, TIER_LABELS } from '../../lib/closeness'
import { nicknameFor } from '../../lib/nicknames'
import { closenessChange, pickQuestion, type QuestionAnswer } from '../../lib/companionQuestions'
import { memoryReply, nextTopic } from '../../lib/companionMemory'
import { nowISO } from '../../lib/date'

const RECENT_KEY = 'igb_companion_questions_recent'

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* asked again, fine */ }
}

function hash(text: string): number {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0
  return h
}

// A companion asks you something with three replies to pick from
// (COMPANION-PLAN 11c), or something to remember. Each one asks on its own
// clock, every 2 or 3 days (lib/companionTurns). Your reply changes closeness.
export default function CompanionQuestionCard() {
  const today = getLogicalDate()
  const turn = useCompanionTurn('question', 'questions', today)
  // Who asked stays on the card while its reply shows.
  const [held, setHeld] = useState<Companion | null>(null)
  const companion = held ?? turn ?? undefined
  const messages = useEffectiveMessages(companion)
  // undefined while loading, null when there's no bond yet.
  const bond = useLiveQuery(async () => {
    if (companion?.id === undefined) return undefined
    return (await db.gameCompanionAffinity.where('companion_id').equals(companion.id).first()) ?? null
  }, [companion?.id])
  const { profile } = useProfile()
  const avatar = useObjectUrl(companion?.avatar)
  const [answered, setAnswered] = useState<{ reply: string; note: string | null } | null>(null)
  const [typed, setTyped] = useState('')
  // What this companion already knows about you (11d).
  const known = useLiveQuery(async () => {
    if (companion?.id === undefined) return undefined
    return (await db.companionMemories.where('companion_id').equals(companion.id).toArray()).map(m => m.topic)
  }, [companion?.id])

  if (!companion?.id || bond === undefined || known === undefined) return null
  const seed = hash(`${today}:${companion.id}`)

  const traits = traitsOf(companion)
  const tier = closenessTier(bond?.affinity, bond?.is_lover)
  const name = nicknameFor(messages, traits, tier, companion.id) ?? profile?.display_name ?? 'friend'
  // Recently asked questions are kept per companion, so each works through its own.
  const recentKey = `${RECENT_KEY}_${companion.id}`
  const question = pickQuestion(seed, read<string[]>(recentKey, []), companion.questions)
  // On about half the asking days it asks something to remember instead.
  const topic = Math.abs(seed >> 3) % 2 === 0 ? nextTopic(known, seed) : null

  // Answering keeps it on the card for its reply; "not now" just ends the turn.
  function finish(keep = false) {
    if (keep) setHeld(companion!)
    write(recentKey, [question.id, ...read<string[]>(recentKey, []).filter(id => id !== question.id)].slice(0, 8))
    markTurn(companion!.id!, 'question', today)
  }

  async function remember() {
    const answer = typed.trim()
    if (!answer || !topic) return
    await db.companionMemories.add({ companion_id: companion!.id!, topic: topic.key, answer, created_at: nowISO() })
    await changeCloseness(companion!.id!, 2)
    finish(true)
    setAnswered({ reply: fillPlaceholders(memoryReply(answer, companion!.about?.[topic.key]), name), note: `🧠 ${companion!.name} will remember that` })
  }

  async function answer(a: QuestionAnswer) {
    const delta = closenessChange(a.tone, traits)
    const after = await changeCloseness(companion!.id!, delta)
    const newTier = closenessTier(after, bond?.is_lover)
    finish(true)
    setAnswered({
      reply: fillPlaceholders(a.reply, name),
      // Only good news is shown; a reply that didn't land just passes.
      note: newTier !== tier && delta > 0 ? `💗 You and ${companion!.name}: ${TIER_LABELS[newTier]}!` : delta > 0 ? '💗 You two got a little closer' : null,
    })
  }

  return (
    <m.div variants={fadeUp} initial="hidden" animate="visible" className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span aria-hidden>💬</span>}
        </div>
        <p className="text-xs font-medium text-muted">{companion.name} asks</p>
      </div>
      {answered ? (
        <>
          <p className="text-text-primary">{answered.reply}</p>
          {answered.note && <p className="mt-2 text-xs font-medium text-primary-500">{answered.note}</p>}
          <button onClick={() => { setAnswered(null); setHeld(null) }} className="mt-3 w-full rounded-lg bg-surface py-2 text-sm font-medium text-text-primary">OK</button>
        </>
      ) : topic ? (
        <>
          <p className="text-text-primary">{fillPlaceholders(topic.question, name)}</p>
          <input
            value={typed}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') remember() }}
            placeholder="Type your answer"
            className="mt-3 w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none dark:border-primary-900"
          />
          <button onClick={remember} disabled={!typed.trim()} className="mt-2 w-full rounded-lg bg-primary-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Tell {companion.name}</button>
          <button onClick={() => finish()} className="w-full py-1.5 text-sm text-muted hover:text-text-primary">Not now</button>
        </>
      ) : (
        <>
          <p className="text-text-primary">{fillPlaceholders(question.text, name)}</p>
          <div className="mt-3 space-y-2">
            {question.answers.map(a => (
              <button key={a.tone} onClick={() => answer(a)} className="w-full rounded-lg bg-surface px-3 py-2.5 text-left text-sm text-text-primary">
                {a.text}
              </button>
            ))}
            <button onClick={() => finish()} className="w-full py-1.5 text-sm text-muted hover:text-text-primary">Not now</button>
          </div>
        </>
      )}
    </m.div>
  )
}
