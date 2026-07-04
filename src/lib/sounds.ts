export type SoundId = 'none' | 'soft-bell' | 'bowl-gong' | 'chime' | 'deep-tone' | 'gentle-ping' | 'ding'

export interface SoundOption {
  id: SoundId
  label: string
  emoji: string
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: 'none', label: 'None', emoji: '🔇' },
  { id: 'soft-bell', label: 'Soft Bell', emoji: '🔔' },
  { id: 'bowl-gong', label: 'Bowl Gong', emoji: '🪘' },
  { id: 'chime', label: 'Chime', emoji: '🎐' },
  { id: 'deep-tone', label: 'Deep Tone', emoji: '🎵' },
  { id: 'gentle-ping', label: 'Gentle Ping', emoji: '💫' },
  { id: 'ding', label: 'Ding', emoji: '✨' },
]

// Singleton AudioContext — warmed up on first user gesture, reused for all sounds
let sharedCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioContext()
  }
  return sharedCtx
}

function sine(
  ctx: AudioContext,
  freq: number,
  peakVol: number,
  decaySecs: number,
  now: number,
  attackSecs = 0,
  type: OscillatorType = 'sine',
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  if (attackSecs > 0) {
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(peakVol, now + attackSecs)
  } else {
    gain.gain.setValueAtTime(peakVol, now)
  }
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attackSecs + decaySecs)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + attackSecs + decaySecs + 0.05)
}

function synthesize(ctx: AudioContext, id: SoundId, volume: number): void {
  const now = ctx.currentTime
  switch (id) {
    case 'soft-bell':
      // Fundamental + octave overtone for a bell character
      sine(ctx, 880, volume, 2.5, now)
      sine(ctx, 1320, volume * 0.25, 1.5, now)
      break

    case 'bowl-gong':
      // Low inharmonic partials with slow attack → Tibetan bowl feel
      sine(ctx, 80, volume * 0.5, 5.0, now, 0.25)
      sine(ctx, 161, volume * 0.3, 4.0, now, 0.2)
      sine(ctx, 242, volume * 0.2, 3.0, now, 0.15)
      sine(ctx, 323, volume * 0.1, 2.0, now, 0.1)
      break

    case 'chime':
      sine(ctx, 1320, volume * 0.8, 1.5, now, 0, 'triangle')
      sine(ctx, 1980, volume * 0.2, 0.8, now, 0, 'triangle')
      break

    case 'deep-tone':
      sine(ctx, 110, volume * 0.6, 4.0, now, 0.4)
      sine(ctx, 220, volume * 0.15, 2.5, now, 0.3)
      break

    case 'gentle-ping':
      sine(ctx, 1760, volume * 0.45, 1.0, now)
      break

    case 'ding': {
      // Slightly descending pitch gives a more metallic character
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.35)
      gain.gain.setValueAtTime(volume, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 2.1)
      break
    }
  }
}

export function playSound(id: SoundId, volume = 0.7): void {
  if (id === 'none') return
  try {
    const ctx = getCtx()
    const play = () => synthesize(ctx, id, volume)
    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {})
    } else {
      play()
    }
  } catch {
    // Silently fail — audio is always optional
  }
}
