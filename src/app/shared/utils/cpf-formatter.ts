export function formatCpf(cpf: string): string {
  const numeros = cpf.replace(/\D/g, '');

  if (numeros.length !== 11) return cpf;

  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}
