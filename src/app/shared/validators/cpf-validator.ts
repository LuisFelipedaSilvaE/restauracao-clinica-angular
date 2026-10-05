import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const CPF_FORMATO = /^\d{11}$/;

export function normalizeCpf(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim().replace(/[.\-\s]/g, '');
}

function calcularDigito(base: string, pesoInicial: number): number {
  let soma = 0;

  for (let i = 0; i < base.length; i++) {
    const digito = Number(base.charAt(i));
    soma += digito * (pesoInicial - i);
  }

  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function todosDigitosIguais(cpf: string): boolean {
  return cpf.split('').every((char) => char === cpf.charAt(0));
}

export function cpfValido(value: string | null | undefined): boolean {
  if (!value) return false;

  const cpf = normalizeCpf(value);

  if (!CPF_FORMATO.test(cpf)) return false;
  if (todosDigitosIguais(cpf)) return false;

  const primeiroDigito = calcularDigito(cpf.substring(0, 9), 10);
  const segundoDigito = calcularDigito(cpf.substring(0, 9) + primeiroDigito, 11);

  return primeiroDigito === Number(cpf.charAt(9)) && segundoDigito === Number(cpf.charAt(10));
}

export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;

  return cpfValido(control.value) ? null : { cpfInvalido: true };
};
