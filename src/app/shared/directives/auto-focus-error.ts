import { afterNextRender, Directive, ElementRef, inject, Injector } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Directive({
  selector: 'form[autoFocusError]',
  exportAs: 'autoFocusError',
  host: { '(submit)': 'focusInvalidControl()', novalidate: '' },
})
export class AutoFocusError {
  private readonly element = inject<ElementRef<HTMLFormElement>>(ElementRef);
  private readonly form = inject(FormGroupDirective);
  private readonly injector = inject(Injector);

  focusInvalidControl(): void {
    afterNextRender(
      {
        read: () => {
          if (this.form.valid) return;
          const controls = this.element.nativeElement.querySelectorAll<HTMLElement>(
            'input[aria-invalid="true"], textarea[aria-invalid="true"], select[aria-invalid="true"], [role="combobox"][aria-invalid="true"], [role="group"][aria-invalid="true"] button',
          );
          const first = Array.from(controls).find(
            (control) =>
              !control.matches(':disabled, [aria-disabled="true"]') &&
              control.getClientRects().length > 0,
          );
          first?.focus();
        },
      },
      { injector: this.injector },
    );
  }
}
