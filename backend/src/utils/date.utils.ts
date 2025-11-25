// ============================================================
// utils/date.utils.ts - Date Helper Functions
// ============================================================

/**
 * Format date to SQL format (YYYY-MM-DD)
 */
export const formatDateToSQL = (date: Date): string => {
  return date.toISOString().split("T")[0]!;
};

/**
 * Format datetime to SQL format (YYYY-MM-DD HH:MM:SS)
 */
export const formatDateTimeToSQL = (date: Date): string => {
  const isoString = date.toISOString().slice(0, 19);
  return isoString.replace("T", " ");
};

/**
 * Parse SQL date to JavaScript Date
 */
export const parseSQLDate = (sqlDate: string): Date => {
  return new Date(sqlDate);
};

/**
 * Get date difference in days
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is in the past
 */
export const isDateInPast = (date: Date): boolean => {
  return date < new Date();
};

/**
 * Add days to date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
