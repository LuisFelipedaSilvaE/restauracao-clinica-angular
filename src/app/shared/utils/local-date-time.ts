import { dateToLocalDate } from './local-date';

export function dateAndTimeToLocalDateTime(data: Date, hora: Date): string {
  const horas = String(hora.getHours()).padStart(2, '0');
  const minutos = String(hora.getMinutes()).padStart(2, '0');

  return `${dateToLocalDate(data)}T${horas}:${minutos}:00.000`;
}
