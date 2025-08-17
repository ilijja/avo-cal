/**
 * Date utilities for handling timezones and daily operations
 */

export interface DayInfo {
  date: Date;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  isSelected: boolean;
}

/**
 * Get the start of the week (Monday) for a given date
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Get the end of the week (Sunday) for a given date
 */
export function getEndOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 7; 
  return new Date(d.setDate(diff));
}

/**
 * Get all days in a week
 */
export function getWeekDays(date: Date): DayInfo[] {
  const startOfWeek = getStartOfWeek(date);
  const today = new Date();
  const selectedDate = new Date(date);
  
  const days: DayInfo[] = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    
    const isToday = isSameDay(currentDate, today);
    const isSelected = isSameDay(currentDate, selectedDate);
    
    days.push({
      date: currentDate,
      dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: currentDate.getDate().toString(),
      isToday,
      isSelected,
    });
  }
  
  return days;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get start and end of day in user's timezone
 */
export function getDayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get today's date in user's timezone
 */
export function getToday(): Date {
  return new Date();
}
