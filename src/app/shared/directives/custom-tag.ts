import { Directive, input } from '@angular/core';
import { createThemeColors } from '../utils/create-theme-colors';

@Directive({
  selector: 'p-tag[customTag]',
  host: {
    '[style.backgroundColor]': 'theme().backgroundColor',
    '[style.color]': 'theme().color',
  },
})
export class CustomTag {
  color = input<string>('', { alias: 'customTag' });

  theme = createThemeColors(this.color);
}
