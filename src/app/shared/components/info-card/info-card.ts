import { Component, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { IconColor } from '../../directives/icon-color';
import { InfoCardContent } from '../../interfaces/info-card-content';

@Component({
  selector: 'info-card',
  host: {
    class:
      'flex basis-60 grow items-center gap-2 bg-surface-card border border-border-default rounded-lg p-4',
  },
  imports: [LucideDynamicIcon, IconColor],
  templateUrl: './info-card.html',
  styleUrl: './info-card.css',
})
export class InfoCard {
  readonly data = input.required<InfoCardContent>();
}
