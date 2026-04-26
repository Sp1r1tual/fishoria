export function formatNumericDate(
  date: string | Date | undefined,
  locale = 'uk-UA',
): string {
  if (!date) return '';

  return new Date(date).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
