import { computed, Directive, input } from '@angular/core';
import { createThemeColors } from '../utils/create-theme-colors';

@Directive({
  selector: '[iconColor]',
  host: {
    '[style.backgroundColor]': 'theme().backgroundColor',
    '[style.--icone-stroke]': 'theme().color',
    '[class]': '"[&>svg]:stroke-(--icone-stroke)"',
  },
})
export class IconColor {
  color = input<string>('', { alias: 'iconColor' });

  theme = createThemeColors(this.color);
}
