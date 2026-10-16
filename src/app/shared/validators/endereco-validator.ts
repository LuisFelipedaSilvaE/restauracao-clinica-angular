import { ValidatorFn } from '@angular/forms';
import { comprimentoTextoValidator } from './texto-validator';

export const NUMERO_MAXIMO_ENDERECO = 2_147_483_647;
export const COMPRIMENTO_MINIMO_ENDERECO = 3;
export const COMPRIMENTO_MAXIMO_ENDERECO = 250;

export function comprimentoEnderecoValidator(opcional = false): ValidatorFn {
  return comprimentoTextoValidator(
    COMPRIMENTO_MINIMO_ENDERECO,
    COMPRIMENTO_MAXIMO_ENDERECO,
    opcional,
    (valor) => valor.replace(/[-/]/g, '').trim(),
  );
}
