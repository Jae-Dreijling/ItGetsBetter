import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Minus, Scale, UtensilsCrossed, Droplets, Timer, CheckCircle2, Dumbbell, Moon, Pill, Star } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useProfile } from '../../hooks/useProfile'
import { useWeeklyReview } from '../../hooks/useWeeklyReview'

const MOOD_LABELS = ['', 'Awful', 'Bad', 'Okay', 'Good', 'Great']

export default function WeeklyReviewPage() {
  const { profile } = useProfile()
  const [weeksAgo, setWeeksAgo] = useState(0)
  const review = useWeeklyReview(weeksAgo)

  if (!review) return null

  const weekLabel = `${format(parseISO(review.weekStart), 'MMM d')} — ${format(parseISO(review.weekEnd), 'MMM d, yyyy')}`
  const name = profile?.display_name ?? 'friend'

  const hasSomething = review.weight || review.meals || review.water || review.habits || review.mood || review.sleep || review.exercise

  return (
    <>
      <TopBar title="Weekly Review" />
      <PageContainer>
        <div className="mb-5 flex items-center justify-between">
          <button onClick={() => setWeeksAgo(w => w + 1)} className="p-2 text-muted hover:text-text-primary">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">{weekLabel}</p>
            <p className="text-xs text-muted">{weeksAgo === 0 ? 'This week' : weeksAgo === 1 ? 'Last week' : `${weeksAgo} weeks ago`}</p>
          </div>
          <button
            onClick={() => setWeeksAgo(w => Math.max(0, w - 1))}
            disabled={weeksAgo === 0}
            className="p-2 text-muted hover:text-text-primary disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 rounded-2xl bg-card p-5 shadow-sm text-center">
          <p className="text-lg font-medium text-text-primary leading-relaxed">
            {hasSomething
              ? `Great job this week, ${name}. Here's what you accomplished.`
              : `No data for this week yet, ${name}. Keep going!`}
          </p>
        </div>

        <div className="space-y-3">
          {review.weight && (
            <ReviewCard
              icon={<Scale className="h-5 w-5 text-secondary-500" />}
              title="Weight"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-text-primary">{review.weight.end} kg</span>
                {review.weight.delta !== null && review.weight.delta !== 0 && (
                  <span className={`flex items-center gap-0.5 text-sm font-medium ${review.weight.delta < 0 ? 'text-success' : 'text-danger'}`}>
                    {review.weight.delta < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    {review.weight.delta > 0 ? '+' : ''}{review.weight.delta} kg
                  </span>
                )}
                {review.weight.delta === 0 && (
                  <span className="flex items-center gap-0.5 text-sm text-muted"><Minus className="h-4 w-4" /> No change</span>
                )}
              </div>
            </ReviewCard>
          )}

          {review.meals && (
            <ReviewCard
              icon={<UtensilsCrossed className="h-5 w-5 text-primary-500" />}
              title="Meals"
            >
              <p className="text-lg font-bold text-text-primary">{review.meals.count} meals logged</p>
              <p className="text-sm text-muted">Average health score: {review.meals.avgScore}/5</p>
            </ReviewCard>
          )}

          {review.water && (
            <ReviewCard
              icon={<Droplets className="h-5 w-5 text-secondary-500" />}
              title="Water"
            >
              <p className="text-lg font-bold text-text-primary">
                {review.water.avgMl >= 1000 ? `${(review.water.avgMl / 1000).toFixed(1)}L` : `${review.water.avgMl}ml`} avg/day
              </p>
              <p className="text-sm text-muted">Hit 2L goal {review.water.goalMetDays} days</p>
            </ReviewCard>
          )}

          {review.fasting && (
            <ReviewCard
              icon={<Timer className="h-5 w-5 text-accent-500" />}
              title="Fasting"
            >
              <p className="text-lg font-bold text-text-primary">{review.fasting.totalHours}h total fasted</p>
              <p className="text-sm text-muted">Average fast: {review.fasting.avgHours}h</p>
            </ReviewCard>
          )}

          {review.habits && (
            <ReviewCard
              icon={<CheckCircle2 className="h-5 w-5 text-accent-600" />}
              title="Habits"
            >
              <p className="text-lg font-bold text-text-primary">{review.habits.completionRate}% completion</p>
              <p className="text-sm text-muted">{review.habits.totalCompleted} habits checked off</p>
            </ReviewCard>
          )}

          {review.exercise && (
            <ReviewCard
              icon={<Dumbbell className="h-5 w-5 text-primary-400" />}
              title="Exercise"
            >
              <p className="text-lg font-bold text-text-primary">{review.exercise.sessions} sessions</p>
              <p className="text-sm text-muted">{review.exercise.types.join(', ')}</p>
            </ReviewCard>
          )}

          {review.mood && (
            <ReviewCard
              icon={<span className="text-lg">😊</span>}
              title="Mood"
            >
              <p className="text-lg font-bold text-text-primary">{review.mood.avg}/5 — {MOOD_LABELS[Math.round(review.mood.avg)]}</p>
              {review.mood.topTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {review.mood.topTags.map(t => (
                    <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">{t}</span>
                  ))}
                </div>
              )}
            </ReviewCard>
          )}

          {review.sleep && (
            <ReviewCard
              icon={<Moon className="h-5 w-5 text-accent-500" />}
              title="Sleep"
            >
              <p className="text-lg font-bold text-text-primary">{review.sleep.avgHours}h avg sleep</p>
              <p className="text-sm text-muted">Quality: {review.sleep.avgQuality}/5</p>
            </ReviewCard>
          )}

          {review.medicineDays !== null && (
            <ReviewCard
              icon={<Pill className="h-5 w-5 text-secondary-500" />}
              title="Medicine"
            >
              <p className="text-lg font-bold text-text-primary">{review.medicineDays} days tracked</p>
            </ReviewCard>
          )}

          {review.points && (
            <ReviewCard
              icon={<Star className="h-5 w-5 text-accent-500" />}
              title="Points"
            >
              <p className="text-lg font-bold text-text-primary">+{review.points.earned} points earned</p>
            </ReviewCard>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-card p-5 shadow-sm text-center">
          <p className="text-sm font-medium text-text-primary leading-relaxed">
            {review.weight?.delta && review.weight.delta < 0
              ? `You lost ${Math.abs(review.weight.delta)}kg this week. Keep it up, ${name}!`
              : `Every step forward counts, ${name}. You showed up, and that matters.`}
          </p>
        </div>
      </PageContainer>
    </>
  )
}

function ReviewCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted mb-0.5">{title}</p>
        {children}
      </div>
    </div>
  )
}
