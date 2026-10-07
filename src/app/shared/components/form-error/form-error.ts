import { Component, input } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { CustomErrorMessage } from '../../directives/custom-error-message';

@Component({
  selector: 'form-error',
  imports: [MessageModule, CustomErrorMessage],
  templateUrl: './form-error.html',
  styleUrl: './form-error.css',
})
export class FormError {
  readonly message = input.required<string>();
  readonly errorId = input.required<string>();
}
