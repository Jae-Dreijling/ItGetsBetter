// "My Quotes" was replaced by the companion. Saved quotes become General
// lines of the default companion (or the first companion if there's no
// default), so nothing the user wrote is lost. Used by the database upgrade
// that removes the customQuotes table and by restoring older backups.

interface QuoteRow {
  text?: unknown
}

interface CompanionRow {
  id?: number
  is_default?: boolean
  messages?: { general?: string[] } & Record<string, unknown>
}

export function mergeQuotesIntoCompanions<T extends CompanionRow>(companions: T[], quotes: QuoteRow[]): T[] {
  const texts = quotes
    .map(q => (typeof q.text === 'string' ? q.text.trim() : ''))
    .filter(Boolean)
  const target = companions.find(c => c.is_default) ?? companions[0]
  if (texts.length === 0 || !target) return companions

  const general = target.messages?.general ?? []
  const added = texts.filter((t, i) => !general.includes(t) && texts.indexOf(t) === i)
  if (added.length === 0) return companions

  const updated = { ...target, messages: { ...target.messages, general: [...general, ...added] } }
  return companions.map(c => (c === target ? updated : c))
}
