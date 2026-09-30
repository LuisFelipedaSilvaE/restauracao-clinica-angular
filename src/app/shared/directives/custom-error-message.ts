import { Directive } from '@angular/core';

@Directive({
  selector: 'p-message[customErrorMessage]',
  host: {
    class:
      ' [&>div]:pl-2 [&>div]:rounded-sm [&>div]:border-l-4 [&>div]:border-status-error-border-strong border-error-left mt-1.5',
  },
})
export class CustomErrorMessage {
  constructor() {}
}
