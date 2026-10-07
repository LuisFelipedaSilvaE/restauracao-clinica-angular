import { booleanAttribute, Component, computed, input } from '@angular/core';
import { FormError } from '../form-error/form-error';

@Component({
  selector: 'form-field',
  host: {
    class: 'block min-w-0',
  },
  imports: [FormError],
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
})
export class FormField {
  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string | null>(null);
  readonly errorId = input<string>();

  protected readonly resolvedErrorId = computed(() => this.errorId() ?? `${this.inputId()}-erro`);
}
