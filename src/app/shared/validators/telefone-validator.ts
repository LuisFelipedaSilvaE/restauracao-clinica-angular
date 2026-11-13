import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const TELEFONE_FIXO_FORMATO = /^\d{2}[2-5]\d{7}$/;
const CELULAR_FORMATO = /^\d{2}9\d{8}$/;

export function normalizeTelefone(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim().replace(/[()\-\s]/g, '');
}

export function telefoneValido(value: string | null | undefined): boolean {
  if (!value) return false;

  const telefone = normalizeTelefone(value);

  return TELEFONE_FIXO_FORMATO.test(telefone) || CELULAR_FORMATO.test(telefone);
}

export const telefoneValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  if (!control.value) return null;

  return telefoneValido(control.value) ? null : { telefoneInvalido: true };
};
