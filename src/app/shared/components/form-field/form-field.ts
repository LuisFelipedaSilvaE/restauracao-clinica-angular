import {
  afterEveryRender,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
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
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string | null>(null);
  readonly errorId = input<string>();
  readonly hint = input<string>();

  protected readonly resolvedErrorId = computed(() => this.errorId() ?? `${this.inputId()}-erro`);

  constructor() {
    // PrimeNG renders the focusable element inside its host. Keep the accessible
    // state on that element, including controls recreated by conditional views.
    afterEveryRender(() => {
      const control = Array.from(
        this.element.nativeElement.querySelectorAll<HTMLElement>('[id]'),
      ).find((element) => element.id === this.inputId());
      if (!control) return;

      control.setAttribute('aria-labelledby', `${this.inputId()}-label`);
      if (control.getAttribute('role') !== 'group') {
        control.setAttribute('aria-required', String(this.required()));
      }
      control.setAttribute('aria-invalid', String(!!this.errorMessage()));
      const descriptions = new Set(
        (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean),
      );
      const errorId = this.resolvedErrorId();
      const hintId = `${this.inputId()}-dica`;
      descriptions.delete(errorId);
      descriptions.delete(hintId);
      if (this.hint()) descriptions.add(hintId);
      if (this.errorMessage()) descriptions.add(errorId);
      if (descriptions.size) control.setAttribute('aria-describedby', [...descriptions].join(' '));
      else control.removeAttribute('aria-describedby');
    });
  }
}
