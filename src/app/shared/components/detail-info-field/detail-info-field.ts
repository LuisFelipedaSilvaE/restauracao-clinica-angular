import { Component, input } from '@angular/core';

@Component({
  selector: 'detail-info-field',
  host: {
    class: 'block min-w-0',
  },
  imports: [],
  templateUrl: './detail-info-field.html',
  styleUrl: './detail-info-field.css',
})
export class DetailInfoField {
  readonly label = input.required<string>();
}
