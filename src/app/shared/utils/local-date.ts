export function localDateToDate(value: string): Date {
  const [ano, mes, dia] = value.split('-').map(Number);

  return new Date(ano, mes - 1, dia);
}

export function dateToLocalDate(value: Date): string {
  const ano = value.getFullYear();
  const mes = String(value.getMonth() + 1).padStart(2, '0');
  const dia = String(value.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}
