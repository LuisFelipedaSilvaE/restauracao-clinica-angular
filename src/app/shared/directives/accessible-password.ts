import { afterEveryRender, Directive, ElementRef, inject } from '@angular/core';
import { Password } from 'primeng/password';

/** Adds keyboard operation to PrimeNG's existing mask icon without changing its layout. */
@Directive({
  selector: 'p-password[accessiblePassword]',
  host: { '(keydown)': 'onKeydown($event)' },
})
export class AccessiblePassword {
  private readonly password = inject(Password);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private restoreFocus = false;

  constructor() {
    afterEveryRender(() => {
      const toggle = this.element.nativeElement.querySelector<SVGElement>(
        '[data-p-icon="eye"], [data-p-icon="eyeslash"]',
      );
      if (!toggle) return;
      toggle.removeAttribute('aria-hidden');
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('tabindex', '0');
      toggle.setAttribute('focusable', 'true');
      toggle.setAttribute('aria-label', this.password.unmasked ? 'Ocultar senha' : 'Mostrar senha');
      if (this.restoreFocus) {
        toggle.focus();
        this.restoreFocus = false;
      }
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as Element;
    if (!target.closest('[data-p-icon="eye"], [data-p-icon="eyeslash"]')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    this.restoreFocus = true;
    this.password.onMaskToggle();
  }
}
