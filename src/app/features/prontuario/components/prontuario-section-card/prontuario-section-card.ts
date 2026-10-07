import { Component, input } from '@angular/core';
import { LucideDynamicIcon, LucideIcon } from '@lucide/angular';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'prontuario-section-card',
  host: {
    class: 'block min-w-0 h-full',
  },
  imports: [CardModule, LucideDynamicIcon],
  templateUrl: './prontuario-section-card.html',
  styleUrl: './prontuario-section-card.css',
})
export class ProntuarioSectionCard {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input.required<LucideIcon>();

  protected readonly cardPt = {
    root: {
      class: 'h-full overflow-hidden border border-border-default shadow-none',
    },
    body: {
      class: 'p-0!',
    },
    content: {
      class: 'p-0!',
    },
  };
}
