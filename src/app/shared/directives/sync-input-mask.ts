import { Directive, ElementRef, inject } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { InputMaskDirective } from 'primeng/inputmask';

@Directive({
  selector: '[pInputMask][formControlName]',
})
export class SyncInputMask {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly mask = inject(InputMaskDirective, { self: true });

  private readonly datePicker = inject(DatePicker, { self: true, optional: true });

  constructor() {
    this.mask.onUnmaskedChange.subscribe(() => {
      const host = this.element.nativeElement;
      const input = host instanceof HTMLInputElement ? host : host.querySelector('input');

      if (this.datePicker) {
        this.datePicker.isKeydown = true;
      }

      input?.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
}
