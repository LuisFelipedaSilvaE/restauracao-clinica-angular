import { Component, input } from '@angular/core';
import { IconColor } from '../../directives/icon-color';
import { LucideDynamicIcon, LucideIcon } from '@lucide/angular';

@Component({
  selector: 'empty-list',
  imports: [IconColor, LucideDynamicIcon],
  templateUrl: './empty-list.html',
  styleUrl: './empty-list.css',
})
export class EmptyList {
  readonly icon = input.required<LucideIcon>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
