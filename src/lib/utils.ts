import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, addYears, setYear, isBefore, isAfter, addDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNextOccurrence(date: Date): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thisYear = today.getFullYear()
  const candidate = setYear(date, thisYear)
  if (isBefore(candidate, today)) {
    return addYears(candidate, 1)
  }
  return candidate
}

export function getDaysUntil(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const next = getNextOccurrence(date)
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatShortDate(date: Date): string {
  return format(date, 'MMM d')
}

export function formatFullDate(date: Date): string {
  return format(date, 'MMMM d, yyyy')
}

export function formatTimeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}

export const FREQUENCY_DAYS: Record<string, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
  never: Infinity,
}

export function isOverdue(checkInFrequency: string, lastContactedAt: Date | null): boolean {
  if (checkInFrequency === 'never') return false
  if (!lastContactedAt) return true
  const days = FREQUENCY_DAYS[checkInFrequency] ?? 30
  const dueDate = addDays(lastContactedAt, days)
  return isBefore(dueDate, new Date())
}

export function getDaysOverdue(checkInFrequency: string, lastContactedAt: Date | null): number {
  if (checkInFrequency === 'never') return 0
  if (!lastContactedAt) return 999
  const days = FREQUENCY_DAYS[checkInFrequency] ?? 30
  const dueDate = addDays(lastContactedAt, days)
  const today = new Date()
  if (isAfter(dueDate, today)) return 0
  return Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
}

export function getRelationshipColor(type: string): string {
  const colors: Record<string, string> = {
    partner: 'bg-purple-100 text-purple-800',
    family: 'bg-blue-100 text-blue-800',
    friend: 'bg-green-100 text-green-800',
    acquaintance: 'bg-gray-100 text-gray-800',
  }
  return colors[type] ?? 'bg-gray-100 text-gray-800'
}

export function getMethodIcon(method: string): string {
  const icons: Record<string, string> = {
    call: '📞',
    text: '💬',
    email: '✉️',
    in_person: '🤝',
    social_media: '📱',
  }
  return icons[method] ?? '💬'
}

export function getOccasionIcon(type: string): string {
  const icons: Record<string, string> = {
    birthday: '🎂',
    anniversary: '💑',
    graduation: '🎓',
    work_anniversary: '💼',
    memorial: '🕯️',
    other: '⭐',
  }
  return icons[type] ?? '⭐'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
