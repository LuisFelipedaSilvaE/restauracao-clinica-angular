import { Pipe, PipeTransform } from '@angular/core';
import { formatCpf } from '../utils/cpf-formatter';

@Pipe({
  name: 'cpf',
  pure: false,
})
export class CpfPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    return formatCpf(value);
  }
}
