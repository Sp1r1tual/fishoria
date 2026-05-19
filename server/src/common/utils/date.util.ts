/**
 * Returns the difference in calendar days between date1 and date2 (date1 - date2).
 * It ignores the time portion and only compares the calendar dates.
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
};
