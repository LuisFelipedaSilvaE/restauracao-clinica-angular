import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const integerValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const valor = control.value;

  if (valor === null || valor === undefined || valor === '') return null;

  return Number.isInteger(valor) ? null : { inteiro: true };
};
