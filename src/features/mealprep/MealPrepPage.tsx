import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, m } from 'motion/react'
import { format, parseISO } from 'date-fns'
import { BookOpen, Check, ChevronLeft, ChevronRight, Copy, FileUp, Plus, Search } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import PageContainer from '../../components/layout/PageContainer'
import { getLogicalDate } from '../../lib/date'
import { pop } from '../../lib/animations'
import {
  PLAN_SLOTS, weekStartOf, weekDays, shiftDate, sumNutrition, itemNutrition, formatPortions, recipeSummary,
} from '../../lib/mealPlan'
import {
  useRecipes, usePlanItems, addPlanItem, removePlanItem, setPlanPortions, markEaten, unmarkEaten, copyPreviousWeek, clearPlan,
} from '../../hooks/useMealPlan'
import { useProfile, updateProfile } from '../../hooks/useProfile'
import Sheet from './Sheet'
import RecipeForm from './RecipeForm'
import ImportSheet from './ImportSheet'
import type { MealPlanItem, MealSlot, Recipe } from '../../types'

const PORTION_CHOICES = [0.5, 1, 1.5, 2, 3]

export default function MealPrepPage() {
  const navigate = useNavigate()
  const today = getLogicalDate()
  const [weekStart, setWeekStart] = useState(() => weekStartOf(today))
  const [selectedDay, setSelectedDay] = useState(today)
  const days = weekDays(weekStart)

  // This week plus the one before, for "copy last week".
  const items = usePlanItems(shiftDate(weekStart, -7), days[6])
  const recipeList = useRecipes()
  const recipes = useMemo(() => new Map((recipeList ?? []).map(r => [r.id!, r])), [recipeList])
  const { profile } = useProfile()
  const target = profile?.daily_kcal_target ?? null

  const [addSlot, setAddSlot] = useState<MealSlot | null>(null)
  const [lastAddSlot, setLastAddSlot] = useState<MealSlot>('breakfast')
  const [openItemId, setOpenItemId] = useState<number | null>(null)
  const [lastItemId, setLastItemId] = useState<number | null>(null)
  const [targetOpen, setTargetOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const weekItems = items?.filter(i => i.date >= weekStart) ?? []
  const lastWeekHasItems = items?.some(i => i.date < weekStart) ?? false
  const dayItems = weekItems.filter(i => i.date === selectedDay)
  const planned = sumNutrition(dayItems, recipes)
  const eaten = sumNutrition(dayItems.filter(i => i.meal_entry_id !== null), recipes)
  const sheetItem = items?.find(i => i.id === lastItemId)

  function changeWeek(weeks: number) {
    const start = shiftDate(weekStart, weeks * 7)
    setWeekStart(start)
    setSelectedDay(weekStartOf(today) === start ? today : start)
  }

  function openAdd(slot: MealSlot) {
    setLastAddSlot(slot)
    setAddSlot(slot)
  }

  // After an import, show the imported week (today if it's in it).
  function showImported(firstDate: string) {
    const start = weekStartOf(firstDate)
    setWeekStart(start)
    setSelectedDay(weekStartOf(today) === start ? today : firstDate)
    setImportOpen(false)
  }

  function openItem(id: number) {
    setLastItemId(id)
    setOpenItemId(id)
  }

  const weekLabel = weekStartOf(today) === weekStart
    ? 'This week'
    : `${format(parseISO(days[0]), 'd MMM')} – ${format(parseISO(days[6]), 'd MMM')}`

  return (
    <>
      <TopBar
        title="Meal prep"
        onBack={() => navigate('/todo')}
        rightContent={
          <div className="flex items-center gap-1">
            <button onClick={() => setImportOpen(true)} className="p-1.5 text-muted hover:text-text-primary" aria-label="Import a meal plan">
              <FileUp className="h-5 w-5" />
            </button>
            <button onClick={() => navigate('/todo/meal-prep/recipes')} className="p-1.5 text-muted hover:text-text-primary" aria-label="Recipes">
              <BookOpen className="h-5 w-5" />
            </button>
          </div>
        }
      />
      <PageContainer>
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => changeWeek(-1)} className="p-2 text-muted hover:text-text-primary" aria-label="Previous week">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-text-primary">{weekLabel}</p>
          <button onClick={() => changeWeek(1)} className="p-2 text-muted hover:text-text-primary" aria-label="Next week">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-7 gap-1">
          {days.map(day => {
            const selected = day === selectedDay
            const hasPlans = weekItems.some(i => i.date === day)
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center rounded-xl py-2 transition-colors ${
                  selected ? 'bg-primary-500 text-white' : 'bg-card text-text-primary'
                } ${day === today && !selected ? 'ring-2 ring-primary-300' : ''}`}
              >
                <span className={`text-[11px] ${selected ? 'text-white/80' : 'text-muted'}`}>{format(parseISO(day), 'EEEEEE')}</span>
                <span className="text-sm font-semibold">{format(parseISO(day), 'd')}</span>
                <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${hasPlans ? (selected ? 'bg-white' : 'bg-primary-400') : 'bg-transparent'}`} />
              </button>
            )
          })}
        </div>

        <DayTotals planned={planned} eaten={eaten} target={target} hasPlans={dayItems.length > 0} onSetTarget={() => setTargetOpen(true)} />

        <div className="space-y-4">
          {PLAN_SLOTS.map(slot => (
            <section key={slot.value}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {slot.emoji} {slot.label}
              </h3>
              <div className="space-y-2">
                {dayItems.filter(i => i.meal_slot === slot.value).map(item => (
                  <PlanItemRow
                    key={item.id}
                    item={item}
                    recipe={recipes.get(item.recipe_id)}
                    canEat={item.date <= today}
                    onOpen={() => openItem(item.id!)}
                  />
                ))}
                <button
                  onClick={() => openAdd(slot.value)}
                  className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-primary-200 py-2 text-sm text-muted hover:bg-primary-50 dark:border-primary-800"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </section>
          ))}
        </div>

        <ClearButtons
          key={`${weekStart}-${selectedDay}`}
          dayCount={dayItems.filter(i => i.meal_entry_id === null).length}
          weekCount={weekItems.filter(i => i.meal_entry_id === null).length}
          onClearDay={() => clearPlan(selectedDay, selectedDay)}
          onClearWeek={() => clearPlan(days[0], days[6])}
        />

        {weekItems.length === 0 && lastWeekHasItems && (
          <button
            onClick={() => copyPreviousWeek(weekStart)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-100 py-2.5 text-sm font-medium text-secondary-700"
          >
            <Copy className="h-4 w-4" /> Copy last week's plan
          </button>
        )}
      </PageContainer>

      <Sheet
        open={addSlot !== null}
        onClose={() => setAddSlot(null)}
        title={`Add to ${PLAN_SLOTS.find(s => s.value === lastAddSlot)!.label.toLowerCase()}`}
      >
        <AddToPlan
          recipes={recipeList ?? []}
          onPick={async recipeId => {
            await addPlanItem(selectedDay, lastAddSlot, recipeId)
            setAddSlot(null)
          }}
        />
      </Sheet>

      <Sheet open={openItemId !== null} onClose={() => setOpenItemId(null)} title={sheetItem ? recipes.get(sheetItem.recipe_id)?.name ?? 'Meal' : 'Meal'}>
        {sheetItem && recipes.get(sheetItem.recipe_id) && (
          <ItemDetails
            item={sheetItem}
            recipe={recipes.get(sheetItem.recipe_id)!}
            canEat={sheetItem.date <= today}
            onRemoved={() => setOpenItemId(null)}
          />
        )}
      </Sheet>

      <Sheet open={importOpen} onClose={() => setImportOpen(false)} title="Import a meal plan">
        <ImportSheet onDone={showImported} />
      </Sheet>

      <Sheet open={targetOpen} onClose={() => setTargetOpen(false)} title="Daily target">
        {profile && <TargetForm current={target} onSave={async value => {
          await updateProfile(profile.id!, { daily_kcal_target: value })
          setTargetOpen(false)
        }} />}
      </Sheet>
    </>
  )
}

function DayTotals({ planned, eaten, target, hasPlans, onSetTarget }: {
  planned: ReturnType<typeof sumNutrition>
  eaten: ReturnType<typeof sumNutrition>
  target: number | null
  hasPlans: boolean
  onSetTarget: () => void
}) {
  // Never red: going over is just a number, not a failure (Rulebook 5).
  const fill = target ? Math.min(planned.kcal / target, 1) : 0
  const macros = [
    planned.protein_g !== null ? `${planned.protein_g} g protein` : null,
    planned.carbs_g !== null ? `${planned.carbs_g} g carbs` : null,
    planned.fat_g !== null ? `${planned.fat_g} g fat` : null,
    planned.unknownKcal > 0 ? `${planned.unknownKcal} without calories` : null,
  ].filter(Boolean)
  return (
    <div className="mb-5 rounded-xl bg-card p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-lg font-bold text-text-primary">
          {planned.kcal.toLocaleString()}
          {target ? <span className="text-sm font-normal text-muted"> / {target.toLocaleString()} kcal</span> : <span className="text-sm font-normal text-muted"> kcal planned</span>}
        </p>
        <button onClick={onSetTarget} className="text-xs font-medium text-primary-500">
          {target ? 'Change target' : 'Set a target'}
        </button>
      </div>
      {target && (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
          <div className="h-full origin-left rounded-full bg-primary-400 transition-transform duration-300" style={{ transform: `scaleX(${fill})` }} />
        </div>
      )}
      {hasPlans && macros.length > 0 && (
        <p className="mt-2 text-xs text-muted">{macros.join(' · ')}</p>
      )}
      {eaten.kcal > 0 && (
        <p className="mt-1 text-xs font-medium text-success">Eaten so far: {eaten.kcal.toLocaleString()} kcal</p>
      )}
    </div>
  )
}

function EatenButton({ item, canEat }: { item: MealPlanItem; canEat: boolean }) {
  const isEaten = item.meal_entry_id !== null
  if (!canEat) return <span className="h-7 w-7 shrink-0" />
  return (
    <button
      onClick={e => {
        e.stopPropagation()
        if (isEaten) unmarkEaten(item.id!)
        else markEaten(item.id!)
      }}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        isEaten ? 'border-success bg-success text-white' : 'border-primary-300 hover:border-primary-500'
      }`}
      aria-label={isEaten ? 'Mark as not eaten' : 'Mark as eaten'}
    >
      <AnimatePresence initial={false}>
        {isEaten && (
          <m.span key="check" variants={pop} initial="hidden" animate="visible" exit="exit">
            <Check className="h-4 w-4" />
          </m.span>
        )}
      </AnimatePresence>
    </button>
  )
}

function PlanItemRow({ item, recipe, canEat, onOpen }: { item: MealPlanItem; recipe?: Recipe; canEat: boolean; onOpen: () => void }) {
  if (!recipe) return null
  const kcal = itemNutrition(recipe, item.portions).kcal
  const details = [
    item.portions !== 1 ? `${formatPortions(item.portions)} portions` : null,
    kcal !== null ? `${kcal} kcal` : null,
  ].filter(Boolean).join(' · ')
  return (
    <div
      onClick={onOpen}
      className={`flex cursor-pointer items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-sm transition-opacity ${item.meal_entry_id !== null ? 'opacity-70' : ''}`}
    >
      <EatenButton item={item} canEat={canEat} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-text-primary">{recipe.name}</p>
        {details && <p className="text-xs text-muted">{details}</p>}
      </div>
    </div>
  )
}

function AddToPlan({ recipes, onPick }: { recipes: Recipe[]; onPick: (recipeId: number) => void }) {
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(recipes.length === 0)

  if (creating) {
    return <RecipeForm onSaved={onPick} />
  }

  const shown = recipes.filter(r => r.name.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <div>
      {recipes.length > 6 && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search recipes"
            className="w-full rounded-lg border border-primary-100 bg-surface py-2.5 pl-9 pr-3 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
          />
        </div>
      )}
      <div className="space-y-2">
        {shown.map(recipe => (
          <button
            key={recipe.id}
            onClick={() => onPick(recipe.id!)}
            className="w-full rounded-lg bg-surface px-4 py-3 text-left hover:bg-primary-50"
          >
            <p className="font-medium text-text-primary">{recipe.name}</p>
            {recipeSummary(recipe) && <p className="text-xs text-muted">{recipeSummary(recipe)}</p>}
          </button>
        ))}
      </div>
      <button
        onClick={() => setCreating(true)}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-primary-100 py-2.5 text-sm font-medium text-primary-700"
      >
        <Plus className="h-4 w-4" /> New recipe
      </button>
    </div>
  )
}

function ItemDetails({ item, recipe, canEat, onRemoved }: { item: MealPlanItem; recipe: Recipe; canEat: boolean; onRemoved: () => void }) {
  const isEaten = item.meal_entry_id !== null
  const n = itemNutrition(recipe, item.portions)
  const values = [
    n.kcal !== null ? `${n.kcal} kcal` : null,
    n.protein_g !== null ? `${n.protein_g} g protein` : null,
    n.carbs_g !== null ? `${n.carbs_g} g carbs` : null,
    n.fat_g !== null ? `${n.fat_g} g fat` : null,
  ].filter(Boolean)

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Portions{recipe.servings > 1 ? ` (recipe makes ${recipe.servings})` : ''}</p>
        <div className="flex gap-2">
          {PORTION_CHOICES.map(p => (
            <button
              key={p}
              disabled={isEaten}
              onClick={() => setPlanPortions(item.id!, p)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                item.portions === p ? 'bg-primary-500 text-white' : 'bg-surface text-muted hover:bg-primary-50'
              }`}
            >
              {formatPortions(p)}
            </button>
          ))}
        </div>
      </div>

      {values.length > 0 && <p className="text-sm text-text-primary">{values.join(' · ')}</p>}

      {recipe.ingredients && (
        <div>
          <p className="mb-1 text-xs font-medium text-muted">Ingredients</p>
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-text-primary">
            {recipe.ingredients.split('\n').filter(l => l.trim()).map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </div>
      )}
      {recipe.steps && (
        <div>
          <p className="mb-1 text-xs font-medium text-muted">Steps</p>
          <p className="whitespace-pre-line text-sm text-text-primary">{recipe.steps}</p>
        </div>
      )}

      {canEat && (
        <button
          onClick={() => (isEaten ? unmarkEaten(item.id!) : markEaten(item.id!))}
          className={`w-full rounded-lg py-2.5 font-semibold transition-colors ${
            isEaten ? 'bg-surface text-muted' : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {isEaten ? 'Eaten ✓ (tap to undo)' : 'Eaten'}
        </button>
      )}
      {!isEaten && (
        <button
          onClick={async () => {
            onRemoved()
            await removePlanItem(item.id!)
          }}
          className="w-full rounded-lg py-2 text-sm text-muted hover:text-text-primary"
        >
          Remove from plan
        </button>
      )}
    </div>
  )
}

function TargetForm({ current, onSave }: { current: number | null; onSave: (value: number | null) => void }) {
  const [value, setValue] = useState(current ? String(current) : '')
  const parsed = Number(value)
  const valid = value.trim() !== '' && Number.isFinite(parsed) && parsed > 0

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">A guide for planning, not a limit. Days over it are fine.</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="e.g. 2000"
          className="flex-1 rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
          autoFocus
        />
        <span className="text-sm text-muted">kcal a day</span>
      </div>
      <button
        disabled={!valid}
        onClick={() => onSave(Math.round(parsed))}
        className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
      >
        Save
      </button>
      {current !== null && (
        <button onClick={() => onSave(null)} className="w-full rounded-lg py-2 text-sm text-muted hover:text-text-primary">
          No target
        </button>
      )}
    </div>
  )
}

// Two taps each, so a stray tap can't wipe a plan. Eaten meals are kept.
function ClearButtons({ dayCount, weekCount, onClearDay, onClearWeek }: {
  dayCount: number
  weekCount: number
  onClearDay: () => void
  onClearWeek: () => void
}) {
  const [armed, setArmed] = useState<'day' | 'week' | null>(null)
  if (weekCount === 0) return null

  function tap(which: 'day' | 'week') {
    if (armed !== which) return setArmed(which)
    setArmed(null)
    if (which === 'day') onClearDay()
    else onClearWeek()
  }

  const button = 'flex-1 rounded-lg py-2 text-sm transition-colors'
  return (
    <div className="mt-6">
      <div className="flex gap-2">
        {dayCount > 0 && (
          <button onClick={() => tap('day')} className={`${button} ${armed === 'day' ? 'bg-primary-100 font-medium text-primary-700' : 'bg-surface text-muted'}`}>
            {armed === 'day' ? `Tap again: clear ${dayCount}` : 'Clear this day'}
          </button>
        )}
        <button onClick={() => tap('week')} className={`${button} ${armed === 'week' ? 'bg-primary-100 font-medium text-primary-700' : 'bg-surface text-muted'}`}>
          {armed === 'week' ? `Tap again: clear ${weekCount}` : 'Clear this week'}
        </button>
      </div>
      {armed && <p className="mt-1.5 text-center text-xs text-muted">Meals you already ate stay in your log.</p>}
    </div>
  )
}
