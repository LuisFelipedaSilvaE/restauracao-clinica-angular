import { computed, Directive, input } from '@angular/core';

@Directive({
  selector: 'p-progressbar[customProgressbar]',
  host: {
    '[class]': 'progressBarTheme()',
  },
})
export class CustomProgressbar {
  color = input<string>('', { alias: 'customProgressbar' });
  progressBarTheme = computed<string>(() => {
    const options: Record<string, string> = {
      red: 'bg-red-100! [&>div]:bg-red-600!',
      sky: 'bg-sky-100! [&>div]:bg-sky-600!',
      amber: 'bg-amber-100! [&>div]:bg-amber-600!',
      green: 'bg-green-100! [&>div]:bg-green-600!',
      purple: 'bg-purple-100! [&>div]:bg-purple-600!',
    };
    return options[this.color()];
  });
}
