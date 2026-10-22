import { useEffect, useState } from 'react'
import { m } from 'motion/react'
import { useSessionCompanion } from '../../hooks/useCompanion'
import { useObjectUrl } from '../../hooks/useObjectUrl'
import { toggleTask } from '../../hooks/useTasks'
import { fadeUp } from '../../lib/animations'
import { triggerCompanionMessage } from '../../lib/companionMessenger'
import { readTogether, startTogether, endTogether, onTogetherChange, togetherDuration, type TogetherSession } from '../../lib/togetherSession'
import type { Task } from '../../types'

// "Do this together" (ROADMAP 2.3): your companion keeps you company while
// you work on this task, like body doubling during the focus timer. Done!
// ticks the task off; Stop just ends it, no judgement.
export default function DoTogether({ task }: { task: Task }) {
  const companion = useSessionCompanion()
  const avatar = useObjectUrl(companion?.avatar)
  const [session, setSession] = useState<TogetherSession | null>(readTogether)
  const [now, setNow] = useState(Date.now)

  useEffect(() => onTogetherChange(() => setSession(readTogether())), [])
  // The time on the bar moves along.
  useEffect(() => {
    if (!session) return
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [session])

  if (!companion) return null

  function start() {
    startTogether(task.id!, companion?.id ?? null)
    triggerCompanionMessage('body_double_start')
  }

  function stop() {
    endTogether()
    triggerCompanionMessage('focus_session_done')
  }

  const here = session?.taskId === task.id
  const portrait = (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">
      {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span aria-hidden>💬</span>}
    </div>
  )

  if (here) {
    return (
      <m.div variants={fadeUp} initial="hidden" animate="visible" className="mb-4 rounded-xl bg-primary-50 p-3 dark:bg-primary-900/30">
        <div className="flex items-center gap-2">
          {portrait}
          <p className="flex-1 text-sm text-text-primary">
            Doing this with <span className="font-semibold">{companion.name}</span>
            <span className="text-muted"> · {togetherDuration(session!.startedAt, now)}</span>
          </p>
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={() => toggleTask(task.id!)} className="flex-1 rounded-lg bg-primary-500 py-2 text-sm font-semibold text-white">Done! 🎉</button>
          <button onClick={stop} className="flex-1 rounded-lg bg-card py-2 text-sm font-medium text-text-primary">Stop for now</button>
        </div>
      </m.div>
    )
  }

  return (
    <button onClick={start} className="mb-4 flex w-full items-center gap-2 rounded-xl bg-surface p-3 text-left">
      {portrait}
      <span className="flex-1 text-sm text-text-primary">
        🤝 Do this together with <span className="font-semibold">{companion.name}</span>
        {session && <span className="block text-xs text-muted">This ends the one you're doing on another task.</span>}
      </span>
    </button>
  )
}
