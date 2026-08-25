import { Directive, input } from '@angular/core';
import { createThemeColors } from '../utils/create-theme-colors';

@Directive({
  selector: 'span[profileColor]',
  host: {
    '[style]': "{'background-color': theme().backgroundColor, color: theme().color}",
  },
})
export class ProfileColor {
  color = input<string>('', { alias: 'profileColor' });

  theme = createThemeColors(this.color);
}
