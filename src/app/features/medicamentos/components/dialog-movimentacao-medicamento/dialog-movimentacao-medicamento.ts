import { DecimalPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { LucideArrowDownToLine, LucideArrowUpFromLine, LucideDynamicIcon } from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { startWith } from 'rxjs';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { AutoFocusError } from '../../../../shared/directives/auto-focus-error';
import { RestoreDialogFocus } from '../../../../shared/directives/restore-dialog-focus';
import {
  MEDICAMENTO_QUANTIDADE_MAXIMA,
  MOVIMENTACAO_JUSTIFICATIVA_MAX_LENGTH,
} from '../../constants/medicamento-limits';
import { Medicamento } from '../../interfaces/medicamento';
import { MovimentacaoEstoque } from '../../interfaces/movimentacao-estoque';
import { MedicamentosService } from '../../services/medicamentos-service';

const textoObrigatorio: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { required: true };
};

@Component({
  selector: 'dialog-movimentacao-medicamento',
  host: {
    class: 'contents',
  },
  imports: [
    RestoreDialogFocus,
    AutoFocusError,
    ButtonModule,
    DialogModule,
    MessageModule,
    ReactiveFormsModule,
    FormField,
    InputNumberModule,
    TextareaModule,
    LucideDynamicIcon,
    DecimalPipe,
  ],
  templateUrl: './dialog-movimentacao-medicamento.html',
  styleUrl: './dialog-movimentacao-medicamento.css',
})
export class DialogMovimentacaoMedicamento {
  readonly medicamento = input.required<Medicamento>();
  readonly visible = model.required<boolean>();
  readonly type = model.required<'entrada' | 'saida' | null>();
  readonly movimentacaoRegistrada = output<MovimentacaoEstoque>();

  protected readonly justificativaMaxLength = MOVIMENTACAO_JUSTIFICATIVA_MAX_LENGTH;
  protected readonly fb = inject(FormBuilder);
  protected readonly medicamentosService = inject(MedicamentosService);
  protected readonly messageService = inject(MessageService);

  protected readonly form = this.fb.group({
    quantidade: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(MEDICAMENTO_QUANTIDADE_MAXIMA),
      Validators.pattern(/^[0-9]+$/),
    ]),
    justificativa: this.fb.nonNullable.control('', [
      textoObrigatorio,
      Validators.maxLength(MOVIMENTACAO_JUSTIFICATIVA_MAX_LENGTH),
    ]),
  });

  private readonly autoFocusError = viewChild(AutoFocusError);
  private readonly formSubmitted = signal<boolean>(false);
  private readonly labels: Record<string, string> = {
    quantidade: 'Quantidade',
    justificativa: 'Justificativa',
  };

  protected readonly quantidadeMaximaPermitida = computed(() => {
    const estoqueAtual = Math.max(0, this.medicamento().quantidadeEstoque);
    if (this.type() === 'saida') return estoqueAtual;
    return Math.max(0, MEDICAMENTO_QUANTIDADE_MAXIMA - estoqueAtual);
  });

  protected readonly semSaldoParaSaida = computed(
    () => this.type() === 'saida' && this.medicamento().quantidadeEstoque <= 0,
  );

  private readonly quantidadeValor = toSignal(
    this.form.controls.quantidade.valueChanges.pipe(startWith(this.form.controls.quantidade.value)),
    { initialValue: this.form.controls.quantidade.value },
  );

  private readonly justificativaValor = toSignal(
    this.form.controls.justificativa.valueChanges.pipe(
      startWith(this.form.controls.justificativa.value),
    ),
    { initialValue: this.form.controls.justificativa.value },
  );

  protected readonly justificativaLength = computed(() => this.justificativaValor().length);

  protected readonly saldoAposMovimentacao = computed<number | null>(() => {
    const mode = this.type();
    const valor = this.quantidadeValor();
    if (!mode || valor === null || !Number.isInteger(valor) || valor < 1) return null;
    if (valor > this.quantidadeMaximaPermitida()) return null;

    const atual = this.medicamento().quantidadeEstoque;
    return mode === 'entrada' ? atual + valor : atual - valor;
  });

  protected readonly config = computed(() => {
    const mode = this.type();

    return {
      title: mode === 'entrada' ? 'Registrar entrada' : 'Registrar saída',
      severity: mode === 'entrada' ? 'success' : 'warn',
      btnLabel: mode === 'entrada' ? 'Registrar entrada' : 'Registrar saída',
      msgIcon: mode === 'entrada' ? LucideArrowDownToLine : LucideArrowUpFromLine,
    };
  });

  constructor() {
    effect(() => {
      const maxPermitido = this.quantidadeMaximaPermitida();
      const quantidadeControl = this.form.controls.quantidade;

      quantidadeControl.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(maxPermitido),
        Validators.pattern(/^[0-9]+$/),
      ]);
      quantidadeControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control?.invalid && (control.touched || this.formSubmitted() || control.dirty);
  }

  protected getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);

    if (!this.isInvalid(controlName) || !control?.errors) return null;

    if (control.errors['required']) {
      return controlName === 'justificativa'
        ? 'Informe a justificativa da movimentação.'
        : `${this.labels[controlName]} é obrigatório.`;
    }

    if (control.errors['min']) {
      return `${this.labels[controlName]} deve ser maior ou igual a 1.`;
    }

    if (control.errors['max']) {
      if (controlName === 'quantidade' && this.type() === 'saida') {
        const disponivel = this.medicamento().quantidadeEstoque;
        return `Estoque insuficiente. Disponível: ${disponivel.toLocaleString('pt-BR')} ${disponivel === 1 ? 'unidade' : 'unidades'}.`;
      }
      return `${this.labels[controlName]} deve ser de no máximo ${this.quantidadeMaximaPermitida().toLocaleString('pt-BR')}.`;
    }

    if (control.errors['maxlength']) {
      return `A justificativa deve ter no máximo ${MOVIMENTACAO_JUSTIFICATIVA_MAX_LENGTH} caracteres.`;
    }

    if (control.errors['pattern']) {
      return `${this.labels[controlName]} deve ser um número inteiro.`;
    }

    return `${this.labels[controlName]} é inválido.`;
  }

  protected cancelar(): void {
    if (this.medicamentosService.loading().mutation) return;
    this.visible.set(false);
  }

  protected resetarFormulario(): void {
    this.form.reset({
      quantidade: null,
      justificativa: '',
    });
    this.formSubmitted.set(false);
  }

  protected atualizarQuantidadeEstoque(): void {
    if (this.medicamentosService.loading().mutation || this.semSaldoParaSaida()) {
      return;
    }

    const justificativaControl = this.form.controls.justificativa;
    justificativaControl.setValue(justificativaControl.value.trim());

    this.formSubmitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.form.markAllAsDirty();
      this.autoFocusError()?.focusInvalidControl();
      return;
    }

    const mode = this.type();
    if (!mode) return;

    const request = {
      quantidade: Number(this.form.controls.quantidade.value),
      justificativa: justificativaControl.value,
    };

    const acao$ =
      mode === 'entrada'
        ? this.medicamentosService.registrarEntrada(this.medicamento().id, request)
        : this.medicamentosService.registrarSaida(this.medicamento().id, request);

    acao$.subscribe({
      next: (movimentacao) => {
        this.visible.set(false);
        this.resetarFormulario();
        this.messageService.add({
          severity: 'success',
          summary: 'Movimentação registrada!',
          detail: 'O estoque foi atualizado com sucesso.',
          life: 3000,
        });

        this.movimentacaoRegistrada.emit(movimentacao);
      },
    });
  }
}
