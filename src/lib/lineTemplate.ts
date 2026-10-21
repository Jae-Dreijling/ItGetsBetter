import { TRIGGERS, TRIGGER_GROUPS } from './companionTriggers'

// The template for "Import all categories" (COMPANION-PLAN 11i), built from
// the trigger registry so it always lists every moment. Lines starting with
// // are comments the importer skips. The copy in
// DOCUMENTATION/4-companion/message-import-template.txt is checked against
// this by a test.
export function buildLineTemplate(): string {
  const out: string[] = [
    '// ItGetsBetter: lines for one companion (or a personality group).',
    '// Paste this into "Import all categories" in the companion editor.',
    '// Lines starting with // are skipped. Under each [header], write one line',
    '// per message. {name} is always you; other placeholders are listed per',
    '// moment. A line that uses a placeholder the moment does not have is',
    '// never said. Moments without lines of their own use built-in ones.',
    '// [lover] (companions only) fills the Journey lover lines.',
    '// Nickname categories take nicknames, one per line, not sentences.',
    '',
  ]
  for (const group of TRIGGER_GROUPS) {
    const triggers = TRIGGERS.filter(t => t.group === group)
    if (!triggers.length) continue
    out.push(`// ===== ${group} =====`, '')
    for (const t of triggers) {
      const extra = t.placeholders?.length ? `  Placeholders: ${t.placeholders.map(p => `{${p}}`).join(' ')}` : ''
      out.push(`[${t.key}]`, `// ${t.label}.${extra}`, '')
    }
  }
  out.push('// ===== Journey =====', '', '[lover]', '// Lines it says when it visits as your Lover in the Journey.', '')
  return out.join('\n')
}
