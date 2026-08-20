import { computed, Directive, input } from '@angular/core';

@Directive({
  selector: 'p-badge[customBadge]',
  host: {
    '[class]': 'badgeTheme()',
  },
})
export class CustomBadge {
  color = input<string>('', { alias: 'customBadge' });
  badgeTheme = computed<string>(() => {
    const options: Record<string, string> = {
      red: 'bg-red-50! text-red-600! border border-red-300 rounded-full! text-[10px]! px-1! py-0.5! h-fit!',
      sky: 'bg-sky-50! text-sky-600! border border-sky-300 rounded-full! text-[10px]! px-1! py-0.5! h-fit!',
      amber:
        'bg-amber-50! text-amber-600! border border-amber-300 rounded-full! text-[10px]! px-1! py-0.5! h-fit!',
      green:
        'bg-green-50! text-green-600! border border-green-300 rounded-full! text-[10px]! px-1! py-0.5! h-fit!',
      purple:
        'bg-purple-50! text-purple-600! border border-purple-300 rounded-full! text-[10px]! px-1! py-0.5! h-fit!',
    };
    return options[this.color()];
  });
}
