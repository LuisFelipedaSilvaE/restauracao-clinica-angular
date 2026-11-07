import { Component, input } from '@angular/core';
import { LucideDynamicIcon, LucideIcon } from '@lucide/angular';
import { IconColor } from '../../directives/icon-color';

@Component({
  selector: 'context-summary',
  host: {
    class: 'block min-w-0',
  },
  imports: [IconColor, LucideDynamicIcon],
  templateUrl: './context-summary.html',
  styleUrl: './context-summary.css',
})
export class ContextSummary {
  readonly title = input.required<string>();
  readonly icon = input.required<LucideIcon>();
  readonly color = input('#4a5565');
}
