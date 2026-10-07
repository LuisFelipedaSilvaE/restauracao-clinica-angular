import { Component, input } from '@angular/core';

@Component({
  selector: 'prontuario-info-field',
  host: {
    class: 'block min-w-0',
  },
  imports: [],
  templateUrl: './prontuario-info-field.html',
  styleUrl: './prontuario-info-field.css',
})
export class ProntuarioInfoField {
  readonly label = input.required<string>();
}
