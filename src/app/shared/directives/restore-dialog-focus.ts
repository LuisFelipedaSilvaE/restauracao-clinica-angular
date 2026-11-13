import { DOCUMENT } from '@angular/common';
import { afterNextRender, Directive, effect, inject, Injector, input } from '@angular/core';

@Directive({ selector: 'p-dialog[restoreDialogFocus]' })
export class RestoreDialogFocus {
  readonly restoreDialogFocus = input.required<boolean>();
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private trigger: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.restoreDialogFocus()) {
        this.trigger = this.document.activeElement as HTMLElement;
      } else if (this.trigger) {
        const trigger = this.trigger;
        this.trigger = null;
        afterNextRender(
          () => {
            if (trigger.isConnected && !trigger.matches(':disabled')) trigger.focus();
          },
          { injector: this.injector },
        );
      }
    });
  }
}
