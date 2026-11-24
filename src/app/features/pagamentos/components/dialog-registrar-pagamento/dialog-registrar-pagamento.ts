import { RestoreDialogFocus } from '../../../../shared/directives/restore-dialog-focus';
import { AutoFocusError } from '../../../../shared/directives/auto-focus-error';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { LucideWalletCards } from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { startWith } from 'rxjs';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { ContextSummary } from '../../../../shared/components/context-summary/context-summary';
import { dateToLocalDate, localDateToDate } from '../../../../shared/utils/local-date';
import { Internacao } from '../../../internacoes/interfaces/internacao';
import { StatusPagamento } from '../../enums/status-pagamento';
import { Pagamento } from '../../interfaces/pagamento';
import { PagamentoRequest } from '../../interfaces/pagamento-request';
import { PagamentosService } from '../../services/pagamentos-service';

const VALOR_MAXIMO = 9_999_999_999.99;
const TAMANHO_MAXIMO_OBSERVACAO = 500;

const dataValida: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value === null) return null;
  return control.value instanceof Date && Number.isFinite(control.value.getTime())
    ? null
    : { dataInvalida: true };
};

const textoObrigatorio: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { required: true };
};

@Component({
  selector: 'dialog-registrar-pagamento',
  host: {
    class: 'contents',
  },
  imports: [
    RestoreDialogFocus,
    AutoFocusError,
    ButtonModule,
    CommonModule,
    ContextSummary,
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
  protected readonly dataMaximaPagamento = computed(() => {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    const dataSaida = this.internacao().dataSaida;
    if (!dataSaida) return hoje;

    const saida = localDateToDate(dataSaida);
    saida.setHours(23, 59, 59, 999);
    return saida.getTime() < hoje.getTime() ? saida : hoje;
  });
  protected readonly contextIcon = LucideWalletCards;
  private readonly formSubmitted = signal(false);

  protected readonly form = this.fb.group({
    valor: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(VALOR_MAXIMO),
    ]),
    dataPagamento: this.fb.control<Date | null>(new Date(), [Validators.required, dataValida]),
    competencia: this.fb.control<Date | null>(new Date(), [Validators.required, dataValida]),
    observacao: this.fb.nonNullable.control('', [Validators.maxLength(TAMANHO_MAXIMO_OBSERVACAO)]),
  });

  private readonly valorPagamento = toSignal(
    this.form.controls.valor.valueChanges.pipe(startWith(this.form.controls.valor.value)),
    { initialValue: this.form.controls.valor.value },
  );
  protected readonly observacaoObrigatoria = computed(() => {
    const valor = this.valorPagamento();
    if (valor === null || valor <= 0) return false;
    return Math.round(valor * 100) !== Math.round(this.internacao().valorMensalidade * 100);
  });

  private readonly competenciaValor = toSignal(
    this.form.controls.competencia.valueChanges.pipe(
      startWith(this.form.controls.competencia.value),
    ),
    { initialValue: this.form.controls.competencia.value },
  );
  protected readonly competenciaDuplicada = computed(() => {
    const data = this.competenciaValor();
    if (!(data instanceof Date) || !Number.isFinite(data.getTime())) return false;
    return this.competenciaJaAtiva(this.dateToCompetencia(data));
  });

  constructor() {
    effect(() => {
      const obrigatoria = this.observacaoObrigatoria();
      const observacaoControl = this.form.controls.observacao;

      observacaoControl.setValidators([
        Validators.maxLength(TAMANHO_MAXIMO_OBSERVACAO),
        ...(obrigatoria ? [textoObrigatorio] : []),
      ]);
      observacaoControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control?.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(controlName: string): string | null {
    if (!this.isInvalid(controlName)) return null;
    const errors = this.form.get(controlName)?.errors;

    if (controlName === 'observacao' && errors?.['required']) {
      return 'Pagamentos com valores diferentes da mensalidade exigem uma observação.';
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
    if (errors?.['max']) {
      return 'O valor deve ter no máximo 10 dígitos inteiros e 2 casas decimais.';
    }
    if (errors?.['maxlength']) {
      return `A observação não pode ultrapassar ${TAMANHO_MAXIMO_OBSERVACAO} caracteres.`;
    }
    if (errors?.['dataInvalida']) {
      return controlName === 'competencia'
        ? 'Informe uma competência válida.'
        : 'Informe uma data de pagamento válida.';
    }
    if (errors?.['anteriorEntrada']) {
      return 'A data do pagamento não pode ser anterior à data de entrada.';
    }
    if (errors?.['dataFutura']) {
      return 'A data do pagamento não pode ser futura.';
    }
    if (errors?.['posteriorSaida']) {
      return 'A data do pagamento não pode ser posterior à data de saída.';
    }
    if (errors?.['competenciaDuplicada']) {
      return 'Já existe um pagamento ativo para esta competência nesta internação.';
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
    if (this.loading() || !this.internacao().convenio.pagamento || !this.internacao().ativo) {
      return;
    }

    const observacaoControl = this.form.controls.observacao;
    observacaoControl.setValue(observacaoControl.value.trim());

    this.formSubmitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const valor = this.form.getRawValue();
    const dataPagamentoLocal = dateToLocalDate(valor.dataPagamento!);
    const dataPagamentoControl = this.form.controls.dataPagamento;
    const internacao = this.internacao();

    if (dataPagamentoLocal > dateToLocalDate(new Date())) {
      dataPagamentoControl.setErrors({ dataFutura: true });
      return;
    }
    if (dataPagamentoLocal < internacao.dataEntrada) {
      dataPagamentoControl.setErrors({ anteriorEntrada: true });
      return;
    }
    if (internacao.dataSaida && dataPagamentoLocal > internacao.dataSaida) {
      dataPagamentoControl.setErrors({ posteriorSaida: true });
      return;
    }

    const competencia = this.dateToCompetencia(valor.competencia!);
    if (this.competenciaJaAtiva(competencia)) {
      this.form.controls.competencia.setErrors({ competenciaDuplicada: true });
      return;
    }

    const request: PagamentoRequest = {
      internacaoId: internacao.id,
      valor: Number(valor.valor!.toFixed(2)),
      dataPagamento: dataPagamentoLocal,
      competencia,
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

  private competenciaJaAtiva(competencia: string): boolean {
    const internacaoId = this.internacao().id;
    return this.pagamentosService
      .pagamentos()
      .some(
        (pagamento) =>
          pagamento.internacaoId === internacaoId &&
          pagamento.status === StatusPagamento.ATIVO &&
          pagamento.competencia === competencia,
      );
  }

  private dateToCompetencia(data: Date): string {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
  }
}
