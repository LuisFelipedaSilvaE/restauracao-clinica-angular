import { Pipe, PipeTransform } from '@angular/core';
import { formatTelefone } from '../utils/telefone-formatter';

@Pipe({
  name: 'telefone',
  pure: false,
})
export class TelefonePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    return formatTelefone(value);
  }
}
