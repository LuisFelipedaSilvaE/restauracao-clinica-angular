import { computed, Signal } from '@angular/core';
import { Theme } from '../interfaces/theme';

export function createThemeColors(baseColor: Signal<string>) {
  return computed<Theme>(() => ({
    color: `color-mix(in oklch, ${baseColor()} 100%, transparent)`,
    backgroundColor: `color-mix(in oklch, ${baseColor()} 8%, transparent)`,
    borderColor: `color-mix(in oklch, ${baseColor()} 20%, transparent)`,
  }));
}
