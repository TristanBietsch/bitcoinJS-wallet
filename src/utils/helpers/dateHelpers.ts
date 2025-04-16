/**
 * Date utility functions for handling timestamps and date formatting
 */

/**
 * Gets the start of day timestamp for a given date
 */
export const getStartOfDay = (date: Date): number => {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate.getTime()
}

/**
 * Checks if a given timestamp is from today
 */
export const isToday = (timestamp: number): boolean => {
  const today = getStartOfDay(new Date())
  const date = getStartOfDay(new Date(timestamp))
  return date === today
}

/**
 * Checks if a given timestamp is from the past week
 */
export const isThisWeek = (timestamp: number): boolean => {
  const today = getStartOfDay(new Date())
  const date = getStartOfDay(new Date(timestamp))
  const oneWeekAgo = today - (7 * 24 * 60 * 60 * 1000)
  return date >= oneWeekAgo && date < today
}

/**
 * Returns a formatted string of month and year for a given timestamp
 */
export const getMonthYear = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
} 