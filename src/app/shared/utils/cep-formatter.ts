export function formatCep(cep: string | null | undefined): string {
  if (!cep) return '';

  const numeros = cep.replace(/\D/g, '');

  if (numeros.length !== 8) return cep;

  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
}
