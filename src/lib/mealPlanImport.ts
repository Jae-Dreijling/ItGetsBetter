import type { MealPlanItem, MealSlot, Recipe } from '../types'

// Imports a meal plan exported by another app, in the format described in
// DOCUMENTATION/2-v2/MEAL-PLAN-IMPORT.md. Two pure steps, so they're testable:
//   parseMealPlanFile: text -> validated file (or friendly errors)
//   planImport:        file + what's in the app -> exactly what will change
// The hook in useMealPlanImport applies the result in one transaction.

export const IMPORT_FORMAT = 'itgetsbetter-meal-plan'
const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']

export interface ImportNutrition {
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
}

export interface ImportRecipe extends ImportNutrition {
  sourceId: string
  name: string
  servings: number
  ingredients: string
  steps: string
}

export interface ImportEntry {
  date: string
  slot: MealSlot
  portions: number
  sourceId: string
}

export interface MealPlanFile {
  sourceApp: string | null
  from: string
  to: string
  dailyKcalTarget: number | null
  recipes: ImportRecipe[]
  entries: ImportEntry[]
}

export type ParseResult = { ok: true; file: MealPlanFile } | { ok: false; errors: string[] }

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const DATE = /^\d{4}-\d{2}-\d{2}$/

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function nutrition(v: unknown): ImportNutrition {
  const n = isObj(v) ? v : {}
  return { kcal: num(n.kcal), protein_g: num(n.protein_g), carbs_g: num(n.carbs_g), fat_g: num(n.fat_g) }
}

function formatAmount(n: number): string {
  return String(Math.round(n * 100) / 100)
}

// "350 g cod fillet", "2 onions", "1 tsp salt (heaped)". "piece" is left out.
export function ingredientLine(v: unknown): string | null {
  if (!isObj(v)) return null
  const name = text(v.name)
  if (!name) return null
  const amount = num(v.amount)
  const unit = text(v.unit)
  const note = text(v.note)
  const parts = [
    amount !== null ? formatAmount(amount) : null,
    unit && unit !== 'piece' ? unit : null,
    name,
  ].filter(Boolean)
  return parts.join(' ') + (note ? ` (${note})` : '')
}

function stepsText(v: unknown): string {
  if (!Array.isArray(v)) return text(v) ?? ''
  return v.map(text).filter(Boolean).map((step, i) => `${i + 1}. ${step}`).join('\n')
}

// A one-off item ("an apple") becomes a small recipe, keyed by its name.
function itemSourceId(name: string): string {
  return `item:${name.toLowerCase()}`
}

export function parseMealPlanFile(raw: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { ok: false, errors: ["This file isn't valid JSON. Was it exported with \"Export for ItGetsBetter\"?"] }
  }
  if (!isObj(data) || data.format !== IMPORT_FORMAT) {
    return { ok: false, errors: ["This isn't an ItGetsBetter meal plan file (the \"format\" field is missing or different)."] }
  }
  if (data.version !== 1) {
    return { ok: false, errors: [`This file is version ${String(data.version)}; this app reads version 1. Update the app or export again.`] }
  }

  const errors: string[] = []
  const recipes = new Map<string, ImportRecipe>()

  const rawRecipes = Array.isArray(data.recipes) ? data.recipes : []
  rawRecipes.forEach((r, i) => {
    const id = isObj(r) ? text(r.id) : null
    const name = isObj(r) ? text(r.name) : null
    if (!isObj(r) || !id || !name) {
      errors.push(`Recipe ${i + 1} has no id or name.`)
      return
    }
    const ingredients = Array.isArray(r.ingredients) ? r.ingredients.map(ingredientLine).filter(Boolean).join('\n') : ''
    recipes.set(id, {
      sourceId: id,
      name,
      servings: Math.max(1, Math.round(num(r.servings) ?? 1)),
      ingredients,
      steps: stepsText(r.steps),
      ...nutrition(r.nutrition_per_portion),
    })
  })

  const entries: ImportEntry[] = []
  const rawPlan = Array.isArray(data.plan) ? data.plan : []
  rawPlan.forEach((p, i) => {
    const where = `Planned meal ${i + 1}`
    if (!isObj(p)) return void errors.push(`${where} isn't readable.`)
    const date = text(p.date)
    if (!date || !DATE.test(date)) return void errors.push(`${where} has no valid date (expected YYYY-MM-DD).`)
    const slot = p.slot as MealSlot
    if (!SLOTS.includes(slot)) return void errors.push(`${where} (${date}) has slot "${String(p.slot)}"; expected breakfast, lunch, dinner or snack.`)
    const portions = num(p.portions) || 1

    let sourceId = text(p.recipe_id)
    if (sourceId) {
      if (!recipes.has(sourceId)) return void errors.push(`${where} (${date}, ${slot}) points to recipe "${sourceId}", which isn't in the file.`)
    } else {
      const item = isObj(p.item) ? p.item : null
      const name = item ? text(item.name) : null
      if (!item || !name) return void errors.push(`${where} (${date}, ${slot}) has neither a recipe_id nor an item name.`)
      sourceId = itemSourceId(name)
      if (!recipes.has(sourceId)) {
        recipes.set(sourceId, { sourceId, name, servings: 1, ingredients: '', steps: '', ...nutrition(item.nutrition_per_portion) })
      }
    }
    entries.push({ date, slot, portions, sourceId })
  })

  if (entries.length === 0 && errors.length === 0) errors.push('This file has no planned meals.')
  if (errors.length > 0) return { ok: false, errors }

  const dates = entries.map(e => e.date).sort()
  const range = isObj(data.range) ? data.range : {}
  const from = text(range.from) && DATE.test(String(range.from)) ? String(range.from) : dates[0]
  const to = text(range.to) && DATE.test(String(range.to)) ? String(range.to) : dates[dates.length - 1]
  const settings = isObj(data.settings) ? data.settings : {}
  const source = isObj(data.source) ? data.source : {}

  return {
    ok: true,
    file: {
      sourceApp: text(source.app),
      from: from < dates[0] ? from : dates[0],
      to: to > dates[dates.length - 1] ? to : dates[dates.length - 1],
      dailyKcalTarget: num(settings.daily_kcal_target) || null,
      recipes: [...recipes.values()],
      entries,
    },
  }
}

export interface ImportPlan {
  newRecipes: ImportRecipe[]
  updatedRecipes: { id: number; recipe: ImportRecipe }[]
  // Planned (not eaten) items in the file's range that the import replaces.
  replacedItemIds: number[]
  keptEatenCount: number
  entries: ImportEntry[]
  warnings: string[]
}

// Matches the file's recipes to existing ones (by source id, then by name)
// and works out what changes. Eaten meals are never touched.
export function planImport(file: MealPlanFile, existingRecipes: Recipe[], existingItems: MealPlanItem[]): ImportPlan {
  const bySource = new Map(existingRecipes.filter(r => r.source_id).map(r => [r.source_id!, r]))
  const byName = new Map(existingRecipes.map(r => [r.name.trim().toLowerCase(), r]))

  const newRecipes: ImportRecipe[] = []
  const updatedRecipes: ImportPlan['updatedRecipes'] = []
  for (const recipe of file.recipes) {
    const match = bySource.get(recipe.sourceId) ?? byName.get(recipe.name.toLowerCase())
    if (match) updatedRecipes.push({ id: match.id!, recipe })
    else newRecipes.push(recipe)
  }

  const inRange = existingItems.filter(i => i.date >= file.from && i.date <= file.to)
  const warnings: string[] = []
  const noKcal = file.recipes.filter(r => r.kcal === null).length
  if (noKcal > 0) warnings.push(`${noKcal} recipe${noKcal === 1 ? ' has' : 's have'} no calories.`)

  return {
    newRecipes,
    updatedRecipes,
    replacedItemIds: inRange.filter(i => i.meal_entry_id === null).map(i => i.id!),
    keptEatenCount: inRange.filter(i => i.meal_entry_id !== null).length,
    entries: file.entries,
    warnings,
  }
}
