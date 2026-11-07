import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { Pagamento } from '../../interfaces/pagamento';
import { PagamentosService } from '../../services/pagamentos-service';

const TAMANHO_MAXIMO_MOTIVO = 500;

@Component({
  selector: 'dialog-estornar-pagamento',
  host: {
    class: 'contents',
  },
  imports: [
    ButtonModule,
    CommonModule,
    DialogModule,
    FormField,
    ReactiveFormsModule,
    TextareaModule,
  ],
  templateUrl: './dialog-estornar-pagamento.html',
  styleUrl: './dialog-estornar-pagamento.css',
})
export class DialogEstornarPagamento {
  readonly pagamento = input.required<Pagamento>();
  readonly visible = model.required<boolean>();
  readonly pagamentoEstornado = output<Pagamento>();

  private readonly fb = inject(FormBuilder);
  private readonly pagamentosService = inject(PagamentosService);
  private readonly messageService = inject(MessageService);

  protected readonly tamanhoMaximoMotivo = TAMANHO_MAXIMO_MOTIVO;
  protected readonly loading = computed(() => this.pagamentosService.loading().mutation);
  private readonly formSubmitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    motivo: ['', [Validators.required, Validators.maxLength(TAMANHO_MAXIMO_MOTIVO)]],
  });

  protected isInvalid(): boolean {
    const control = this.form.controls.motivo;
    return control.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(): string | null {
    if (!this.isInvalid()) return null;

    if (this.form.controls.motivo.hasError('required')) {
      return 'Informe o motivo do estorno.';
    }

    if (this.form.controls.motivo.hasError('maxlength')) {
      return `O motivo deve ter no máximo ${TAMANHO_MAXIMO_MOTIVO} caracteres.`;
    }

    return 'Verifique o motivo informado.';
  }

  protected cancelar(): void {
    if (this.loading()) return;
    this.visible.set(false);
  }

  protected estornar(): void {
    if (this.loading()) return;

    const motivoControl = this.form.controls.motivo;
    motivoControl.setValue(motivoControl.value.trim());
    this.formSubmitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.pagamentosService
      .estornarPagamento(this.pagamento().id, { motivo: motivoControl.value })
      .subscribe({
        next: (pagamento) => {
          this.visible.set(false);
          this.pagamentoEstornado.emit(pagamento);
          this.messageService.add({
            severity: 'success',
            summary: 'Pagamento estornado!',
            detail: 'O estorno foi registrado no histórico da internação.',
            life: 3000,
          });
        },
        error: (error: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Não foi possível estornar o pagamento',
            detail: error.message,
            life: 5000,
          });
        },
      });
  }

  protected limparFormulario(): void {
    this.form.reset();
    this.formSubmitted.set(false);
  }
}
