import { Pipe, PipeTransform } from '@angular/core';
import { formatCep } from '../utils/cep-formatter';

@Pipe({
  name: 'cep',
})
export class CepPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatCep(value);
  }
}
