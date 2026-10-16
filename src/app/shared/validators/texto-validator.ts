import { ValidatorFn } from '@angular/forms';

export function comprimentoTextoValidator(
  minimo: number,
  maximo: number,
  opcional = false,
  normalizar: (valor: string) => string = (valor) => valor.trim(),
): ValidatorFn {
  return (control) => {
    const valor = normalizar(String(control.value ?? ''));

    if (!valor) return opcional ? null : { required: true };
    if (valor.length < minimo) {
      return { minlength: { requiredLength: minimo, actualLength: valor.length } };
    }
    if (valor.length > maximo) {
      return { maxlength: { requiredLength: maximo, actualLength: valor.length } };
    }

    return null;
  };
}
