import { Pipe, PipeTransform } from '@angular/core';
import { Endereco } from '../interfaces/endereco';

@Pipe({
  name: 'endereco',
})
export class EnderecoPipe implements PipeTransform {
  transform(value: Endereco): string {
    if (!value) {
      return '';
    }

    console.log(value);

    if (value.complemento === null || value.complemento === '') {
      return `${value.logradouro}, ${value.numero} - ${value.bairro} - ${value.cidade}/${value.estado}`;
    }

    return `${value.logradouro}, ${value.numero} - ${value.bairro} - ${value.cidade}/${value.estado} - ${value.complemento}`;
  }
}
