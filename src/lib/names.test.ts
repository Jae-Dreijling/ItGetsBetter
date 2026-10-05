import { describe, it, expect } from 'vitest'
import { listNames, namesAfterSwitch, namesAfterAdd, namesAfterRemove } from './names'

describe('saved names', () => {
  it('lists the active name first, without blanks or duplicates', () => {
    expect(listNames('Jae', ['Sam', ' ', 'jae', 'Sam', '  Alex  '])).toEqual(['Jae', 'Sam', 'Alex'])
    expect(listNames('Jae', undefined)).toEqual(['Jae'])
  })

  it('keeps the previous name available after switching', () => {
    expect(namesAfterSwitch('Jae', ['Sam'], 'Sam')).toEqual(['Jae'])
    expect(namesAfterSwitch('Jae', ['Sam', 'Alex'], 'Alex')).toEqual(['Jae', 'Sam'])
  })

  it('adds a name once, ignoring case and spacing', () => {
    expect(namesAfterAdd('Jae', ['Sam'], ' Alex ')).toEqual(['Sam', 'Alex'])
    expect(namesAfterAdd('Jae', ['Sam'], 'sam')).toEqual(['Sam'])
    expect(namesAfterAdd('Jae', ['Sam'], 'JAE')).toEqual(['Sam'])
    expect(namesAfterAdd('Jae', undefined, '   ')).toEqual([])
  })

  it('removes a saved name', () => {
    expect(namesAfterRemove('Jae', ['Sam', 'Alex'], 'sam')).toEqual(['Alex'])
    expect(namesAfterRemove('Jae', ['Sam'], 'Jae')).toEqual(['Sam'])
  })
})
