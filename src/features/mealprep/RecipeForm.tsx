import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { saveRecipe, type RecipeInput } from '../../hooks/useMealPlan'
import type { Recipe } from '../../types'

const SCORE_LABELS = ['', 'Poor', 'Below Avg', 'Average', 'Good', 'Great']

const inputClass = 'w-full rounded-lg border border-primary-100 bg-surface px-3 py-2.5 text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none'

// Accepts "12,5" as well as "12.5". Empty or invalid means unknown.
function parseAmount(value: string): number | null {
  const n = Number(value.trim().replace(',', '.'))
  return value.trim() === '' || !Number.isFinite(n) || n < 0 ? null : n
}

function show(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

interface RecipeFormProps {
  recipe?: Recipe
  onSaved: (id: number) => void
}

// Only the name is required; everything else can be filled in later.
export default function RecipeForm({ recipe, onSaved }: RecipeFormProps) {
  const [name, setName] = useState(recipe?.name ?? '')
  const [kcal, setKcal] = useState(show(recipe?.kcal))
  const [protein, setProtein] = useState(show(recipe?.protein_g))
  const [carbs, setCarbs] = useState(show(recipe?.carbs_g))
  const [fat, setFat] = useState(show(recipe?.fat_g))
  const [score, setScore] = useState(recipe?.health_score ?? 3)
  const [servings, setServings] = useState(show(recipe?.servings ?? 1))
  const [ingredients, setIngredients] = useState(recipe?.ingredients ?? '')
  const [steps, setSteps] = useState(recipe?.steps ?? '')
  const [showDetails, setShowDetails] = useState(!!(recipe?.ingredients || recipe?.steps))
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || saving) return
    setSaving(true)
    const data: RecipeInput = {
      name: name.trim(),
      servings: Math.max(1, Math.round(parseAmount(servings) ?? 1)),
      ingredients: ingredients.trim(),
      steps: steps.trim(),
      kcal: parseAmount(kcal),
      protein_g: parseAmount(protein),
      carbs_g: parseAmount(carbs),
      fat_g: parseAmount(fat),
      health_score: score,
    }
    const id = await saveRecipe(data, recipe?.id)
    setSaving(false)
    onSaved(id)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Recipe name"
        className={inputClass}
        autoFocus={!recipe}
      />

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Per portion (optional)</p>
        <div className="grid grid-cols-4 gap-2">
          <AmountInput label="kcal" value={kcal} onChange={setKcal} />
          <AmountInput label="protein g" value={protein} onChange={setProtein} />
          <AmountInput label="carbs g" value={carbs} onChange={setCarbs} />
          <AmountInput label="fat g" value={fat} onChange={setFat} />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Health score</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setScore(s)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                score === s ? 'bg-primary-500 text-white scale-110' : 'bg-surface text-muted hover:bg-primary-100'
              }`}
            >
              {s}
            </button>
          ))}
          <span className="ml-1 text-xs text-muted">{SCORE_LABELS[score]}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1 text-sm font-medium text-primary-500"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        Ingredients & steps
      </button>

      {showDetails && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-text-primary">
            Makes
            <input
              type="text"
              inputMode="numeric"
              value={servings}
              onChange={e => setServings(e.target.value)}
              className="w-16 rounded-lg border border-primary-100 bg-surface px-2 py-1.5 text-center text-text-primary focus:border-primary-400 focus:outline-none"
            />
            portions
          </label>
          <textarea
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            placeholder={'Ingredients, one per line\n200 g rice\n1 tin of beans'}
            rows={5}
            className={inputClass}
          />
          <textarea
            value={steps}
            onChange={e => setSteps(e.target.value)}
            placeholder="Steps"
            rows={5}
            className={inputClass}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!name.trim() || saving}
        className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
      >
        {recipe ? 'Save recipe' : 'Add recipe'}
      </button>
    </form>
  )
}

function AmountInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="–"
        className="w-full rounded-lg border border-primary-100 bg-surface px-2 py-2 text-center text-text-primary placeholder:text-muted focus:border-primary-400 focus:outline-none"
      />
      <span className="mt-0.5 block text-center text-[11px] text-muted">{label}</span>
    </label>
  )
}
