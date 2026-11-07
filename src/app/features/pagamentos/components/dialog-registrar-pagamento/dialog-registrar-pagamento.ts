import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { startWith } from 'rxjs';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { dateToLocalDate, localDateToDate } from '../../../../shared/utils/local-date';
import { Internacao } from '../../../internacoes/interfaces/internacao';
import { Pagamento } from '../../interfaces/pagamento';
import { PagamentoRequest } from '../../interfaces/pagamento-request';
import { PagamentosService } from '../../services/pagamentos-service';

const VALOR_MAXIMO = 9_999_999_999.99;
const TAMANHO_MAXIMO_OBSERVACAO = 500;

@Component({
  selector: 'dialog-registrar-pagamento',
  host: {
    class: 'contents',
  },
  imports: [
    ButtonModule,
    CommonModule,
    DatePickerModule,
    DialogModule,
    FormField,
    InputNumberModule,
    MessageModule,
    ReactiveFormsModule,
    TextareaModule,
  ],
  templateUrl: './dialog-registrar-pagamento.html',
  styleUrl: './dialog-registrar-pagamento.css',
})
export class DialogRegistrarPagamento {
  readonly internacao = input.required<Internacao>();
  readonly visible = model.required<boolean>();
  readonly pagamentoRegistrado = output<Pagamento>();

  private readonly fb = inject(FormBuilder);
  private readonly pagamentosService = inject(PagamentosService);
  private readonly messageService = inject(MessageService);

  protected readonly valorMaximo = VALOR_MAXIMO;
  protected readonly tamanhoMaximoObservacao = TAMANHO_MAXIMO_OBSERVACAO;
  protected readonly loading = computed(() => this.pagamentosService.loading().mutation);
  protected readonly dataEntrada = computed(() => localDateToDate(this.internacao().dataEntrada));
  protected readonly hoje = new Date();
  private readonly formSubmitted = signal(false);

  protected readonly form = this.fb.group({
    valor: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(VALOR_MAXIMO),
    ]),
    dataPagamento: this.fb.control<Date | null>(new Date(), [Validators.required]),
    competencia: this.fb.control<Date | null>(new Date(), [Validators.required]),
    observacao: this.fb.nonNullable.control('', [Validators.maxLength(TAMANHO_MAXIMO_OBSERVACAO)]),
  });

  private readonly valorPagamento = toSignal(
    this.form.controls.valor.valueChanges.pipe(startWith(this.form.controls.valor.value)),
    { initialValue: this.form.controls.valor.value },
  );
  protected readonly observacaoObrigatoria = computed(
    () => (this.valorPagamento() ?? 0) > this.internacao().valorMensalidade,
  );

  protected isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control?.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(controlName: string): string | null {
    if (!this.isInvalid(controlName)) return null;
    const errors = this.form.get(controlName)?.errors;

    if (controlName === 'observacao' && errors?.['required']) {
      return 'Explique por que o valor é superior à mensalidade.';
    }
    if (errors?.['required']) {
      const mensagens: Record<string, string> = {
        valor: 'Informe o valor do pagamento.',
        dataPagamento: 'Informe a data do pagamento.',
        competencia: 'Informe a competência do pagamento.',
      };
      return mensagens[controlName] ?? 'Preencha o campo obrigatório.';
    }
    if (errors?.['min']) return 'O valor do pagamento deve ser maior que zero.';
    if (errors?.['max']) return 'O valor deve ter no máximo 10 dígitos inteiros.';
    if (errors?.['maxlength']) {
      return `A observação deve ter no máximo ${TAMANHO_MAXIMO_OBSERVACAO} caracteres.`;
    }
    return 'Verifique o campo informado.';
  }

  protected inicializarFormulario(): void {
    const valorMensalidade = this.internacao().valorMensalidade;

    this.form.reset({
      valor: valorMensalidade > 0 ? valorMensalidade : null,
      dataPagamento: new Date(),
      competencia: new Date(),
      observacao: '',
    });
    this.formSubmitted.set(false);
  }

  protected cancelar(): void {
    if (this.loading()) return;
    this.visible.set(false);
  }

  protected registrarPagamento(): void {
    if (this.loading() || !this.internacao().convenio.pagamento) return;

    this.formSubmitted.set(true);
    this.form.markAllAsTouched();

    const observacaoControl = this.form.controls.observacao;
    observacaoControl.setValue(observacaoControl.value.trim());
    observacaoControl.setValidators([
      Validators.maxLength(TAMANHO_MAXIMO_OBSERVACAO),
      ...(this.observacaoObrigatoria() ? [Validators.required] : []),
    ]);
    observacaoControl.updateValueAndValidity();

    if (this.form.invalid) return;

    const valor = this.form.getRawValue();
    const request: PagamentoRequest = {
      internacaoId: this.internacao().id,
      valor: valor.valor!,
      dataPagamento: dateToLocalDate(valor.dataPagamento!),
      competencia: this.dateToCompetencia(valor.competencia!),
      observacao: valor.observacao.trim() || null,
    };

    this.pagamentosService.createPagamento(request).subscribe({
      next: (pagamento) => {
        this.visible.set(false);
        this.pagamentoRegistrado.emit(pagamento);
        this.messageService.add({
          severity: 'success',
          summary: 'Pagamento registrado!',
          detail: 'O pagamento foi adicionado ao histórico da internação.',
          life: 3000,
        });
      },
      error: (error: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Não foi possível registrar o pagamento',
          detail: error.message,
          life: 5000,
        });
      },
    });
  }

  protected limparFormulario(): void {
    this.form.reset({
      valor: null,
      dataPagamento: new Date(),
      competencia: new Date(),
      observacao: '',
    });
    this.formSubmitted.set(false);
  }

  private dateToCompetencia(data: Date): string {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
  }
}
