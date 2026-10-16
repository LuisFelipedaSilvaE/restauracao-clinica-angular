import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cep',
})
export class CepPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    const numeros = value.replace(/\D/g, '');
    if (numeros.length !== 8) return value;

    return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
  }
}
