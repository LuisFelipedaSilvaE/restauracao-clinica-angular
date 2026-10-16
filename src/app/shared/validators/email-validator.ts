import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const EMAIL_FORMATO = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const EMAIL_COMPRIMENTO_MAXIMO = 254;

export function normalizeEmail(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

export function emailValido(value: string | null | undefined): boolean {
  const email = normalizeEmail(value);

  if (!email || email.length > EMAIL_COMPRIMENTO_MAXIMO || email.includes('..')) return false;
  return EMAIL_FORMATO.test(email);
}

export const emailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;

  const email = normalizeEmail(control.value);
  if (email.length > EMAIL_COMPRIMENTO_MAXIMO) {
    return {
      maxlength: {
        requiredLength: EMAIL_COMPRIMENTO_MAXIMO,
        actualLength: email.length,
      },
    };
  }

  return emailValido(email) ? null : { email: true };
};
