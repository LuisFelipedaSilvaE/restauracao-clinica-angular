import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'siglaNome',
  pure: false,
})
export class SiglaNomePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    const nomes: string[] = value.split(' ');

    if (!nomes) {
      return 'NF';
    }

    if (nomes.length == 1) return nomes[0][0].toUpperCase();
    if (nomes[1].length <= 2) nomes.splice(1, 1);
    nomes.splice(2);

    return nomes
      .map((palavra) => palavra.slice(0, 1))
      .reduce((sigla, palavra) => (sigla += palavra))
      .toUpperCase();
  }
}
