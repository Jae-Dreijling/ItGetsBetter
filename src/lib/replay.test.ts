import { describe, it, expect } from 'vitest'
import { abstinenceReached, buildStops, bundleOld, layoutTrail, periodStart, type ReplayInput } from './replay'

const empty: ReplayInput = {
  since: '2026-08-01', today: '2026-10-21',
  milestones: [], counters: [], achievements: [], weights: [], wins: [],
  cravingsPassed: [], lettersOpened: [], contacts: [], habitCheckIns: [], photos: [],
}

describe('progress walk stops', () => {
  it('always starts at the start, even with nothing else', () => {
    const stops = buildStops(empty)
    expect(stops.map(s => s.kind)).toEqual(['start'])
  })

  it('puts stops in date order and leaves out what came before the walk', () => {
    const stops = buildStops({
      ...empty,
      milestones: [
        { text: 'Learn 4 chords', emoji: '🎸', done_at: '2026-09-10T12:00:00' },
        { text: 'Old step', emoji: '🎸', done_at: '2026-07-01T12:00:00' },
      ],
      lettersOpened: ['2026-08-20T12:00:00'],
    })
    expect(stops.map(s => s.title)).toEqual(['1 Aug 2026', 'A letter opened', 'Learn 4 chords'])
  })

  it('counts the 1st and 10th win from all wins ever', () => {
    const wins = Array.from({ length: 12 }, (_, i) => ({ date: `2026-0${i < 5 ? 7 : 9}-${String(10 + i).padStart(2, '0')}`, text: `win ${i + 1}` }))
    const stops = buildStops({ ...empty, wins })
    // The first win was in July, before the walk; the 10th is in it.
    expect(stops.filter(s => s.kind === 'win').map(s => s.title)).toEqual(['10th win'])
    expect(stops.find(s => s.kind === 'win')!.line).toContain('win 10')
  })

  it('shows weight only when the trend goes down, every 2 kg', () => {
    const down = Array.from({ length: 80 }, (_, i) => ({ date: `2026-${i < 30 ? '08' : i < 60 ? '09' : '10'}-${String((i % 30) + 1).padStart(2, '0')}`, value_kg: 90 - i * 0.08 }))
    const up = down.map((w, i) => ({ ...w, value_kg: 80 + i * 0.08 }))
    expect(buildStops({ ...empty, weights: down }).filter(s => s.kind === 'weight').map(s => s.title)).toEqual(['−2 kg', '−4 kg'])
    expect(buildStops({ ...empty, weights: up }).some(s => s.kind === 'weight')).toBe(false)
  })

  it('photos stop at the first and latest only', () => {
    const photos = [{ id: 1, date: '2026-08-05' }, { id: 2, date: '2026-09-05' }, { id: 3, date: '2026-10-05' }]
    expect(buildStops({ ...empty, photos }).filter(s => s.kind === 'photo').map(s => s.photoId)).toEqual([1, 3])
  })
})

describe('abstinence milestones on the walk', () => {
  it('keeps a milestone once reached, even after a slip', () => {
    const reached = abstinenceReached('2026-08-01T10:00:00Z', ['2026-08-20T10:00:00Z'], new Date('2026-09-01T10:00:00Z'))
    expect(reached.map(r => r.days)).toEqual([1, 3, 7, 14])
    expect(reached.find(r => r.days === 14)!.at).toBe('2026-08-15T10:00:00.000Z')
  })
})

describe('the trail', () => {
  it('never starts before the first day', () => {
    expect(periodStart('3_months', '2026-10-21', '2026-09-01')).toBe('2026-09-01')
    expect(periodStart('month', '2026-10-21', '2026-01-01')).toBe('2026-09-21')
  })

  it('zig-zags inside the map', () => {
    const points = layoutTrail(6, 360)
    expect(points.every(p => p.x > 40 && p.x < 320)).toBe(true)
    expect(points[1].x < 180 && points[2].x > 180).toBe(true)
  })
})

describe('bundling older stops', () => {
  const goal = (date: string, title: string) => ({ date, kind: 'goal' as const, emoji: '🎸', title, line: '' })

  it('keeps the last 6 months one by one', () => {
    const stops = [goal('2026-06-01', 'A'), goal('2026-06-02', 'B')]
    expect(bundleOld(stops, '2026-10-21').map(s => s.title)).toEqual(['A', 'B'])
  })

  it('bundles per kind per month, then per quarter, then per year', () => {
    const stops = [
      goal('2023-02-01', 'Y1'), goal('2023-11-01', 'Y2'),
      goal('2025-01-05', 'Q1'), goal('2025-03-20', 'Q2'),
      goal('2026-02-03', 'M1'), goal('2026-02-10', 'M2'), goal('2026-02-12', 'M3'), goal('2026-02-20', 'M4'),
      goal('2026-03-01', 'alone'),
    ]
    const out = bundleOld(stops, '2026-10-21')
    expect(out.map(s => s.title)).toEqual(['2 goal steps', '2 goal steps', '4 goal steps', 'alone'])
    expect(out[0].line).toBe('2023: Y1 and Y2.')
    expect(out[1].line).toBe('Jan–Mar 2025: Q1 and Q2.')
    expect(out[2].line).toBe('February 2026: M1, M2, M3 and 1 more.')
  })

  it('weight bundles show how far the trend went', () => {
    const w = (date: string, kg: number) => ({ date, kind: 'weight' as const, emoji: '⚖️', title: `−${kg} kg`, line: '' })
    const [only] = bundleOld([w('2026-01-02', 2), w('2026-01-20', 4)], '2026-10-21')
    expect(only.title).toBe('−2 kg → −4 kg')
  })
})
