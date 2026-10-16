import { ValidatorFn } from '@angular/forms';

export const dataValidaValidator: ValidatorFn = (control) => {
  if (control.value === null || control.value === '') return null;

  return control.value instanceof Date && Number.isFinite(control.value.getTime())
    ? null
    : { dataInvalida: true };
};

export function dataMinimaValidator(dataMinima: Date): ValidatorFn {
  return (control) => {
    if (!(control.value instanceof Date) || !Number.isFinite(control.value.getTime())) return null;

    return control.value < dataMinima ? { dataAnteriorMinima: true } : null;
  };
}

export function dataMaximaValidator(dataMaxima: Date): ValidatorFn {
  return (control) => {
    if (!(control.value instanceof Date) || !Number.isFinite(control.value.getTime())) return null;

    return control.value > dataMaxima ? { dataPosteriorMaxima: true } : null;
  };
}

export function calcularDataLimiteIdade(idade: number, referencia = new Date()): Date {
  const ano = referencia.getFullYear() - idade;
  const mes = referencia.getMonth();
  const dia = referencia.getDate();
  const limite = new Date(ano, mes, dia);

  if (limite.getMonth() !== mes) {
    return new Date(ano, mes + 1, 0);
  }

  return limite;
}

export function idadeMinimaValidator(idade: number, referencia = new Date()): ValidatorFn {
  const dataLimite = calcularDataLimiteIdade(idade, referencia);

  return (control) => {
    if (!(control.value instanceof Date) || !Number.isFinite(control.value.getTime())) return null;

    return control.value > dataLimite ? { idadeMinima: { idade } } : null;
  };
}
