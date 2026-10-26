import { dateToLocalDate } from './local-date';

export function dateAndTimeToLocalDateTime(data: Date, hora: Date): string {
  const horas = String(hora.getHours()).padStart(2, '0');
  const minutos = String(hora.getMinutes()).padStart(2, '0');

  return `${dateToLocalDate(data)}T${horas}:${minutos}:00.000`;
}

export function isSameLocalDate(value: Date | string, reference: Date): boolean {
  const data = value instanceof Date ? value : new Date(value);

  if (!Number.isFinite(data.getTime())) return false;

  return (
    data.getFullYear() === reference.getFullYear() &&
    data.getMonth() === reference.getMonth() &&
    data.getDate() === reference.getDate()
  );
}
