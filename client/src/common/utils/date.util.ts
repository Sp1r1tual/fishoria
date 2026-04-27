export type DateFormatType = 'date' | 'time' | 'dateTime';

export function formatDate(
  date: string | Date | undefined,
  format: DateFormatType = 'date',
  locale = 'uk-UA',
): string {
  if (!date) return '';

  const d = new Date(date);

  if (isNaN(d.getTime())) return String(date);

  switch (format) {
    case 'time':
      return d.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'dateTime':
      return d.toLocaleString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'date':
    default:
      return d.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
  }
}
