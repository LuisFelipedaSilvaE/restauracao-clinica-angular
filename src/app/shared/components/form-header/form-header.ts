import { Component, input } from '@angular/core';
import { InfoCardContent } from '../../interfaces/info-card-content';
import { IconColor } from '../../directives/icon-color';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'form-header',
  host: {
    class: 'flex items-center gap-2',
  },
  imports: [IconColor, LucideDynamicIcon],
  templateUrl: './form-header.html',
  styleUrl: './form-header.css',
})
export class FormHeader {
  readonly data = input.required<InfoCardContent>();
}
