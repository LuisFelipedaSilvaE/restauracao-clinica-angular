import { computed, Directive, input } from '@angular/core';
import { createThemeColors } from '../utils/create-theme-colors';

@Directive({
  selector: 'p-progressbar[customProgressbar]',
  host: {
    '[style.backgroundColor]': 'theme().backgroundColor',
    '[style.--progressbar-value-bg]': 'theme().color',
    class: '[&>div]:bg-(--progressbar-value-bg)!',
  },
})
export class CustomProgressbar {
  color = input<string>('', { alias: 'customProgressbar' });

  theme = createThemeColors(this.color);
}
