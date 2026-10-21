import { format, subDays } from 'date-fns'

const DAY_BOUNDARY_HOUR = 3

export function getLogicalDate(timestamp: Date = new Date()): string {
  if (timestamp.getHours() < DAY_BOUNDARY_HOUR) {
    return format(subDays(timestamp, 1), 'yyyy-MM-dd')
  }
  return format(timestamp, 'yyyy-MM-dd')
}


export function nowISO(): string {
  return new Date().toISOString()
}
