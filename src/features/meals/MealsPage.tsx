import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { compressImage } from '../../lib/compressImage'
import { Camera, X, Flame } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { useTodaysMeals, addMealEntry } from '../../hooks/useMealEntries'
import { DEFAULT_KCAL_PER_MIN } from '../../hooks/useExercise'
import { db } from '../../db'
import { getLogicalDate } from '../../lib/date'
import type { MealSlot } from '../../types'

const MEAL_SLOTS: { label: string; value: MealSlot }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snacks', value: 'snack' },
]

const SCORE_LABELS = ['', 'Poor', 'Below Avg', 'Average', 'Good', 'Great']

const BURN_OFF_EXERCISES = [
  { name: 'Running', emoji: '🏃' },
  { name: 'Cycling', emoji: '🚴' },
  { name: 'Swimming', emoji: '🏊' },
  { name: 'Boxing', emoji: '🥊' },
  { name: 'Dancing', emoji: '💃' },
  { name: 'Home Workout', emoji: '🏠' },
  { name: 'Walking', emoji: '🚶' },
  { name: 'Planking', emoji: '🧘' },
]

export default function MealsPage() {
  const todaysMeals = useTodaysMeals()
  const [slot, setSlot] = useState<MealSlot>('breakfast')
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [score, setScore] = useState(3)
  const [calories, setCalories] = useState('')
  const [date, setDate] = useState(getLogicalDate())
  const [saving, setSaving] = useState(false)
  const [burnOffMeal, setBurnOffMeal] = useState<{ name: string | null; calories: number } | null>(null)

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const compressed = await compressImage(file, {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    })

    setPhoto(compressed)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(URL.createObjectURL(compressed))
  }

  function clearPhoto() {
    setPhoto(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if ((!name.trim() && !photo) || saving) return

    setSaving(true)
    const isBackfill = date !== getLogicalDate()
    await addMealEntry({
      meal_slot: slot,
      name: name.trim() || null,
      photo,
      health_score: score,
      calories: calories ? parseInt(calories) : null,
      date,
      is_backfill: isBackfill,
    })
    setName('')
    clearPhoto()
    setScore(3)
    setCalories('')
    setSaving(false)
  }

  const isValid = name.trim() || photo

  return (
    <>
      <TopBar title="Meals" />
      <PageContainer>
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl bg-card p-4 shadow-sm">
          <div className="mb-4 flex gap-2">
            {MEAL_SLOTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSlot(s.value)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  slot === s.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface text-muted hover:bg-primary-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What did you eat?"
            className="mb-3 w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
          />

          <input
            type="number"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Calories? (optional)"
            className="mb-3 w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
          />

          <div className="mb-4 flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-surface px-3 py-2.5 text-sm text-muted hover:bg-primary-50 transition-colors">
              <Camera className="h-4 w-4" />
              {photo ? 'Change' : 'Photo'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            {photoPreview && (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-text-primary">Health Score</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScore(s)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    score === s
                      ? 'bg-primary-500 text-white scale-110'
                      : 'bg-surface text-muted hover:bg-primary-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">{SCORE_LABELS[score]}</p>
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mb-3 w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary focus:border-primary-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!isValid || saving}
            className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            Log Meal
          </button>
        </form>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted">Today's Meals</h3>
          {todaysMeals && todaysMeals.length > 0 ? (
            <div className="space-y-2">
              {todaysMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onBurnOff={meal.calories ? () => setBurnOffMeal({ name: meal.name, calories: meal.calories! }) : undefined}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted">No meals logged yet today.</p>
          )}
        </div>
      </PageContainer>

      {burnOffMeal && (
        <BurnOffSheet
          mealName={burnOffMeal.name}
          calories={burnOffMeal.calories}
          onClose={() => setBurnOffMeal(null)}
        />
      )}
    </>
  )
}

function MealCard({
  meal,
  onBurnOff,
}: {
  meal: { id?: number; meal_slot: MealSlot; name: string | null; photo: Blob | null; health_score: number; calories: number | null; logged_at: string }
  onBurnOff?: () => void
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)

  useEffect(() => {
    if (meal.photo) {
      const url = URL.createObjectURL(meal.photo)
      setThumbUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [meal.photo])

  return (
    <div className="flex items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm">
      {thumbUrl && (
        <img src={thumbUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">
          {meal.name || meal.meal_slot}
        </p>
        <p className="text-xs text-muted capitalize">
          {meal.meal_slot} &bull; {format(new Date(meal.logged_at), 'h:mm a')}
          {meal.calories ? ` · ${meal.calories} kcal` : ''}
        </p>
      </div>
      {onBurnOff && (
        <button
          onClick={onBurnOff}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500 hover:bg-orange-200 transition-colors dark:bg-orange-900/30 dark:text-orange-400"
          title="See burn-off options"
        >
          <Flame className="h-4 w-4" />
        </button>
      )}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
        {meal.health_score}
      </div>
    </div>
  )
}

function BurnOffSheet({ mealName, calories, onClose }: { mealName: string | null; calories: number; onClose: () => void }) {
  const latestWeight = useLiveQuery(() => db.weightEntries.orderBy('date').last())
  const weightKg = latestWeight?.value_kg ?? 70

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl bg-card p-6 shadow-xl max-h-[75vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-bold text-text-primary">Burn it off</h2>
        </div>
        <p className="mb-1 text-sm text-muted">
          {mealName ? `"${mealName}" · ` : ''}{calories} kcal
        </p>
        <p className="mb-5 text-xs text-muted">
          Estimated for {weightKg === 70 && !latestWeight ? '70kg (no weight logged yet)' : `${weightKg}kg`}
        </p>

        <div className="space-y-3">
          {BURN_OFF_EXERCISES.map(({ name, emoji }) => {
            const kcalPerMin = DEFAULT_KCAL_PER_MIN[name]
            if (!kcalPerMin) return null
            const adjustedKcalPerMin = kcalPerMin * weightKg / 70
            const minutes = Math.round(calories / adjustedKcalPerMin)
            const hours = Math.floor(minutes / 60)
            const mins = minutes % 60
            const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`

            return (
              <div key={name} className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3">
                <span className="text-2xl">{emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{name}</p>
                </div>
                <p className="text-sm font-semibold text-orange-500">~{duration}</p>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          These are rough estimates — every body is different.
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-surface py-2.5 text-sm font-medium text-muted hover:bg-primary-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
