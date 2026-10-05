// Saved names: the active name (display_name) plus others the user can switch
// to with one tap. Kept as plain functions so the rules are easy to test.

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

// Every name the user can pick from, active one first, without duplicates.
export function listNames(displayName: string, savedNames: string[] | undefined): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const name of [displayName, ...(savedNames ?? [])]) {
    const clean = normalizeName(name)
    const key = clean.toLowerCase()
    if (clean && !seen.has(key)) {
      seen.add(key)
      result.push(clean)
    }
  }
  return result
}

// The saved list after switching to `name`: the previous active name stays
// available, so switching back is one tap too.
export function namesAfterSwitch(displayName: string, savedNames: string[] | undefined, name: string): string[] {
  return listNames(displayName, savedNames).filter(n => n.toLowerCase() !== normalizeName(name).toLowerCase())
}

export function namesAfterAdd(displayName: string, savedNames: string[] | undefined, name: string): string[] {
  return listNames(displayName, [...(savedNames ?? []), name]).slice(1)
}

// The active name can't be removed, only names in the saved list.
export function namesAfterRemove(displayName: string, savedNames: string[] | undefined, name: string): string[] {
  const target = normalizeName(name).toLowerCase()
  return listNames(displayName, savedNames).slice(1).filter(n => n.toLowerCase() !== target)
}
