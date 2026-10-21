import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, animate, m, useMotionValue, useReducedMotion } from 'motion/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { format, parseISO } from 'date-fns'
import { FastForward, Pause, Play, RotateCcw } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import { db } from '../../db'
import { useReplayStops } from '../../hooks/useReplay'
import { useSessionCompanion } from '../../hooks/useCompanion'
import { useProfile } from '../../hooks/useProfile'
import { pop } from '../../lib/animations'
import {
  PERIODS, STOP_GAP, closingLine, curvePoints, layoutScenery, layoutTrail, trailPath,
  type ReplayPeriod, type ReplayStop,
} from '../../lib/replay'

const chip = (on: boolean) => `shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${on ? 'bg-primary-500 text-white' : 'bg-card text-text-primary'}`

export default function ReplayPage() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<ReplayPeriod>('start')
  // Photos are off by default: seeing your body isn't nice on every day.
  const [withPhotos, setWithPhotos] = useState(false)
  const data = useReplayStops(period, withPhotos)

  return (
    <>
      <TopBar title="Progress walk" onBack={() => navigate('/me')} />
      <div className="flex gap-1.5 overflow-x-auto px-4 pt-3">
        {PERIODS.map(p => <button key={p.id} onClick={() => setPeriod(p.id)} className={chip(period === p.id)}>{p.label}</button>)}
        <button onClick={() => setWithPhotos(!withPhotos)} aria-pressed={withPhotos} className={chip(withPhotos)}>📸 Photos</button>
      </div>
      {data && <Walk key={`${period}-${withPhotos}-${data.stops.length}`} stops={data.stops} />}
    </>
  )
}

type Phase = 'walking' | 'talking' | 'done'

// How long the companion lingers at a stop: longer lines get more time.
const talkMs = (line: string) => Math.min(5500, 1800 + line.length * 35)
const WALK_SECONDS = 1.5

function Walk({ stops }: { stops: ReplayStop[] }) {
  const reduceMotion = useReducedMotion()
  const companion = useSessionCompanion()
  const { profile } = useProfile()
  const mapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(360)
  const [at, setAt] = useState(0)
  const [phase, setPhase] = useState<Phase>('talking')
  const [paused, setPaused] = useState(false)

  useLayoutEffect(() => {
    const el = mapRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setWidth(el.clientWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // The stops plus the finish flag at today.
  const points = useMemo(() => layoutTrail(stops.length + 1, width), [stops.length, width])
  const scenery = useMemo(() => layoutScenery(points, width), [points, width])
  const last = points.length - 1
  const height = points[last].y + STOP_GAP * 0.9
  const x = useMotionValue(points[0].x)
  const y = useMotionValue(points[0].y)

  // Keep the companion on its stop when the map is resized.
  useEffect(() => {
    if (phase === 'walking') return
    x.set(points[at].x)
    y.set(points[at].y)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points])

  const name = profile?.display_name ?? 'friend'
  const line = at === last ? closingLine(stops.length - 1, name) : stops[at].line

  function follow(index: number) {
    const map = mapRef.current
    if (!map) return
    const top = map.getBoundingClientRect().top + window.scrollY + points[index].y - window.innerHeight * 0.4
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  // Walk the curve to the next stop, then talk there.
  useEffect(() => {
    if (phase !== 'walking') return
    follow(at)
    const path = curvePoints(points[at - 1], points[at])
    const options = { duration: reduceMotion ? 0 : WALK_SECONDS, ease: 'linear' as const }
    const moves = [animate(x, path.map(p => p.x), options), animate(y, path.map(p => p.y), options)]
    let cancelled = false
    Promise.all(moves).then(() => { if (!cancelled) setPhase(at === last ? 'done' : 'talking') })
    return () => { cancelled = true; moves.forEach(move => move.stop()) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at, phase])

  // Linger at a stop, then walk on (unless paused).
  useEffect(() => {
    if (phase !== 'talking' || paused) return
    const t = setTimeout(next, talkMs(line))
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at, phase, paused])

  function next() {
    if (phase !== 'talking' || at >= last) return
    setAt(at + 1)
    setPhase('walking')
  }

  function jumpTo(index: number, endPhase: Phase) {
    x.set(points[index].x)
    y.set(points[index].y)
    setAt(index)
    setPhase(endPhase)
    follow(index)
  }

  // The bubble grows away from the map's edges, and below the companion near the top.
  const here = points[at]
  const across = here.x < width * 0.4 ? '-left-6' : here.x > width * 0.6 ? '-right-6' : '-left-28'
  const upDown = here.y < 260 ? 'top-16' : 'bottom-[84px]'

  return (
    <>
      <div
        ref={mapRef}
        onClick={next}
        className="relative mx-4 mt-3 mb-40 overflow-hidden rounded-2xl bg-secondary-50 dark:bg-secondary-900/20"
        style={{ height }}
      >
        <Hills height={height} width={width} />

        <svg className="absolute inset-0 text-card" width={width} height={height} aria-hidden>
          <path d={trailPath(points)} fill="none" stroke="currentColor" strokeWidth={22} strokeLinecap="round" />
          <path d={trailPath(points)} fill="none" className="text-primary-200 dark:text-primary-800" stroke="currentColor" strokeWidth={3} strokeDasharray="2 12" strokeLinecap="round" />
        </svg>

        {scenery.map((s, i) => (
          <span key={i} aria-hidden className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none" style={{ left: s.x, top: s.y, fontSize: s.size }}>
            {s.emoji}
          </span>
        ))}

        {points.map((p, i) => {
          const finish = i === last
          const reached = i < at || (i === at && phase !== 'walking')
          const stop = finish ? null : stops[i]
          return (
            <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.x, top: p.y }}>
              <m.div
                animate={{ scale: reached ? 1 : 0.8, opacity: reached ? 1 : 0.55 }}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-xl shadow-sm ${reached ? 'bg-accent-100 ring-2 ring-accent-400 dark:bg-accent-900/50' : 'bg-card'}`}
              >
                {finish ? '🏁' : stop!.emoji}
              </m.div>
              <p className={`absolute top-12 left-1/2 w-28 -translate-x-1/2 text-center text-[11px] leading-tight ${reached ? 'font-medium text-text-primary' : 'text-muted'}`}>
                {finish ? 'Today' : stop!.title}
              </p>
            </div>
          )
        })}

        {/* The companion, walking the trail. */}
        {/* Zero-size anchor at the companion's spot; it stands just above the stop. */}
        <m.div className="absolute top-0 left-0 z-10 h-0 w-0" style={{ x, y }}>
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-[130%]">
            <m.div
              animate={phase === 'walking' && !reduceMotion ? { y: [0, -9, 0], rotate: [-6, 6, -6] } : { y: 0, rotate: 0 }}
              transition={phase === 'walking' ? { duration: 0.42, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
            >
              <CompanionFace avatar={companion?.avatar ?? null} name={companion?.name ?? 'Companion'} />
            </m.div>
          </div>
          <AnimatePresence>
            {phase !== 'walking' && (
              <m.div
                key={at}
                variants={pop}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`absolute w-56 rounded-2xl bg-card p-3 text-sm text-text-primary shadow-md ${across} ${upDown}`}
              >
                <p className="mb-0.5 text-xs font-medium text-muted">{companion?.name ?? 'Your companion'}</p>
                <p>{line}</p>
                {at < last && stops[at].photoId !== undefined && <StopPhoto id={stops[at].photoId!} />}
                {at < last && <p className="mt-1 text-[11px] text-muted">{format(parseISO(stops[at].date), 'd MMMM yyyy')}</p>}
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      </div>

      <div className="fixed right-0 bottom-16 left-0 z-20 flex justify-center gap-2 bg-gradient-to-t from-surface via-surface/90 to-transparent px-4 pt-6 pb-3">
        {phase === 'done' ? (
          <button onClick={() => jumpTo(0, 'talking')} className="flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 font-semibold text-white shadow-sm">
            <RotateCcw className="h-4 w-4" /> Walk again
          </button>
        ) : (
          <>
            <button onClick={() => setPaused(!paused)} className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-medium text-text-primary shadow-sm">
              {paused ? <><Play className="h-4 w-4" /> Go on</> : <><Pause className="h-4 w-4" /> Stay here</>}
            </button>
            <button onClick={() => jumpTo(last, 'done')} className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-medium text-text-primary shadow-sm">
              <FastForward className="h-4 w-4" /> To today
            </button>
          </>
        )}
      </div>
    </>
  )
}

function CompanionFace({ avatar, name }: { avatar: Blob | null; name: string }) {
  const url = useMemo(() => (avatar ? URL.createObjectURL(avatar) : null), [avatar])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  return (
    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-card shadow-md ring-2 ring-primary-300">
      {url ? <img src={url} alt={name} className="h-full w-full object-cover" /> : <span className="text-2xl" aria-label={name}>🐾</span>}
    </div>
  )
}

function StopPhoto({ id }: { id: number }) {
  const photo = useLiveQuery(() => db.progressPhotos.get(id), [id])
  const url = useMemo(() => (photo ? URL.createObjectURL(photo.photo) : null), [photo])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  return url ? <img src={url} alt="" className="mt-2 h-32 w-full rounded-lg object-cover" /> : null
}

// Soft hills in the background, every so often down the map.
function Hills({ height, width }: { height: number; width: number }) {
  const hills = []
  for (let y = 60, i = 0; y < height; y += 260, i++) {
    const left = i % 2 === 0
    hills.push(<ellipse key={y} cx={left ? width * 0.1 : width * 0.9} cy={y} rx={width * 0.45} ry={90} />)
  }
  return (
    <svg className="absolute inset-0 text-secondary-100 dark:text-secondary-900/40" width={width} height={height} aria-hidden>
      <g fill="currentColor" opacity={0.7}>{hills}</g>
    </svg>
  )
}
