export function validateDate(dateString: string): boolean {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(regex);

  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  const date = new Date(year, month - 1, day);
  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
}

export function formatDateToCalendar(dateString: string): string {
  if (!dateString || !validateDate(dateString)) return '';
  const [day, month, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function formatDateInput(text: string): string {
  const cleaned = text.replace(/\D/g, '');

  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 4) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  } else {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(
      4,
      8
    )}`;
  }
}

export function convertDate(dateStr: string) {
  if (!dateStr) return new Date().toISOString();
  const [day, month, year] = dateStr.split('/');
  const date = new Date(`${month}/${day}/${year}`);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
