import { Component, input } from '@angular/core';
import { InfoCardContent } from '../../interfaces/info-card-content';
import { IconColor } from '../../directives/icon-color';
import { LucideDynamicIcon } from '@lucide/angular';
import { BackButton } from '../back-button/back-button';

@Component({
  selector: 'form-header',
  host: {
    class: 'flex flex-col justify-center gap-4',
  },
  imports: [IconColor, LucideDynamicIcon, BackButton],
  templateUrl: './form-header.html',
  styleUrl: './form-header.css',
})
export class FormHeader {
  readonly data = input.required<InfoCardContent>();
  readonly btnLabel = input.required<string>();
  readonly btnUrl = input.required<string>();
}
