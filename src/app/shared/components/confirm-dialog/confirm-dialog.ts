import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'confirm-dialog',
  imports: [DialogModule, ButtonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input<string>('Confirmar');
  readonly severity = input<'danger' | 'success' | 'primary'>('danger');
  readonly visible = input.required<boolean>();
  readonly loading = input(false);

  readonly visibleChange = output<boolean>();
  readonly onConfirm = output<void>();
  readonly hidden = output<void>();
}
