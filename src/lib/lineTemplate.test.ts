import { describe, it, expect } from 'vitest'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildLineTemplate } from './lineTemplate'
import { TRIGGERS } from './companionTriggers'

const DOC = resolve(__dirname, '../../DOCUMENTATION/4-companion/message-import-template.txt')

describe('the lines template', () => {
  it('has a header for every moment', () => {
    const template = buildLineTemplate()
    for (const t of TRIGGERS) expect(template).toContain(`[${t.key}]`)
  })

  // Run with UPDATE_TEMPLATE=1 to rewrite the docs copy after adding triggers.
  it('matches the copy in the docs', () => {
    if (process.env.UPDATE_TEMPLATE) writeFileSync(DOC, buildLineTemplate())
    expect(readFileSync(DOC, 'utf-8').replace(/\r\n/g, '\n')).toBe(buildLineTemplate())
  })
})
