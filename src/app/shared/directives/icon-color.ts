import { computed, Directive, input } from '@angular/core';

@Directive({
  selector: '[iconColor]',
  host: {
    '[class]': 'iconTheme()',
  },
})
export class IconColor {
  color = input<string>('', { alias: 'iconColor' });
  iconTheme = computed<string>(() => {
    const options: Record<string, string> = {
      red: 'bg-red-50 [&>svg]:stroke-red-600',
      sky: 'bg-sky-50 [&>svg]:stroke-sky-600',
      amber: 'bg-amber-50 [&>svg]:stroke-amber-600',
      green: 'bg-green-50 [&>svg]:stroke-green-600',
      purple: 'bg-purple-50 [&>svg]:stroke-purple-600',
      gray: 'bg-gray-50 [&>svg]:stroke-gray-600',
    };
    return options[this.color()];
  });
}
