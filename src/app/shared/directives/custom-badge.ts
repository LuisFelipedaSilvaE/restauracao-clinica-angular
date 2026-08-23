import { computed, Directive, input } from '@angular/core';
import { createThemeColors } from '../utils/create-theme-colors';

@Directive({
  selector: 'p-badge[customBadge]',
  host: {
    class: 'border rounded-full! text-[10px]! px-2! py-0.5! h-fit!',
    '[style]':
      "{'background-color' : theme().backgroundColor, 'border-color': theme().borderColor, color: theme().color}",
  },
})
export class CustomBadge {
  color = input<string>('', { alias: 'customBadge' });

  theme = createThemeColors(this.color);
}
