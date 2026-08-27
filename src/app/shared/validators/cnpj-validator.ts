import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PESOS_PRIMEIRO_DIGITO = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_SEGUNDO_DIGITO = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function calcularDigito(cnpj: string, pesos: number[]): number {
  const soma = pesos.reduce(
    (total, peso, indice) => total + (cnpj.charCodeAt(indice) - 48) * peso,
    0,
  );
  const resto = soma % 11;

  return resto < 2 ? 0 : 11 - resto;
}

export const cnpjValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const valor = control.value;

  if (!valor) return null;

  const cnpj = String(valor).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) {
    return { cnpjInvalido: true };
  }

  const primeiroDigito = calcularDigito(cnpj.slice(0, 12), PESOS_PRIMEIRO_DIGITO);
  const segundoDigito = calcularDigito(cnpj.slice(0, 12) + primeiroDigito, PESOS_SEGUNDO_DIGITO);

  return Number(cnpj[12]) === primeiroDigito && Number(cnpj[13]) === segundoDigito
    ? null
    : { cnpjInvalido: true };
};
