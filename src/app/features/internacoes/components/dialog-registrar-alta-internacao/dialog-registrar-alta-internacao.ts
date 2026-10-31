import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { dateToLocalDate, localDateToDate } from '../../../../shared/utils/local-date';
import { TIPO_ALTA_LABELS, TipoAlta } from '../../enums/tipo-alta';
import { Internacao } from '../../interfaces/internacao';
import { InternacaoEndRequest } from '../../interfaces/internacao-end-request';
import { InternacoesService } from '../../services/internacoes-service';

const dataValida: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value === null) return null;
  return control.value instanceof Date && Number.isFinite(control.value.getTime())
    ? null
    : { dataInvalida: true };
};

@Component({
  selector: 'dialog-registrar-alta-internacao',
  host: {
    class: 'contents',
  },
  imports: [
    ButtonModule,
    DatePickerModule,
    DialogModule,
    FormField,
    ReactiveFormsModule,
    SelectModule,
  ],
  templateUrl: './dialog-registrar-alta-internacao.html',
  styleUrl: './dialog-registrar-alta-internacao.css',
})
export class DialogRegistrarAltaInternacao {
  readonly internacao = input.required<Internacao>();
  readonly visible = model.required<boolean>();
  readonly altaRegistrada = output<Internacao>();

  private readonly fb = inject(FormBuilder);
  private readonly internacoesService = inject(InternacoesService);
  private readonly messageService = inject(MessageService);

  protected readonly hoje = new Date();
  protected readonly dataEntrada = computed(() => localDateToDate(this.internacao().dataEntrada));
  protected readonly tiposAlta = Object.values(TipoAlta).map((value) => ({
    value,
    label: TIPO_ALTA_LABELS[value],
  }));
  protected readonly loading = computed(() => this.internacoesService.loading().mutation);
  private readonly formSubmitted = signal(false);

  protected readonly form = this.fb.group({
    alta: this.fb.control<TipoAlta | null>(null, [Validators.required]),
    dataSaida: this.fb.control<Date | null>(new Date(), [Validators.required, dataValida]),
  });

  protected isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control?.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(controlName: string): string | null {
    if (!this.isInvalid(controlName)) return null;

    if (this.form.get(controlName)?.hasError('required')) {
      return controlName === 'alta' ? 'Selecione o tipo de alta.' : 'Informe a data de saída.';
    }

    if (this.form.get(controlName)?.hasError('dataInvalida')) {
      return 'Informe uma data de saída válida.';
    }
    if (this.form.get(controlName)?.hasError('anteriorEntrada')) {
      return 'A data de saída não pode ser anterior à data de entrada.';
    }
    if (this.form.get(controlName)?.hasError('dataFutura')) {
      return 'A data de saída não pode estar no futuro.';
    }

    return 'Verifique o campo informado.';
  }

  protected cancelar(): void {
    if (this.loading()) return;
    this.visible.set(false);
  }

  protected registrarAlta(): void {
    if (this.loading()) return;

    this.formSubmitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const valor = this.form.getRawValue();
    const dataSaida = valor.dataSaida!;
    const dataSaidaLocal = dateToLocalDate(dataSaida);
    const dataSaidaControl = this.form.controls.dataSaida;

    if (dataSaidaLocal < this.internacao().dataEntrada) {
      dataSaidaControl.setErrors({ anteriorEntrada: true });
      return;
    }
    if (dataSaidaLocal > dateToLocalDate(new Date())) {
      dataSaidaControl.setErrors({ dataFutura: true });
      return;
    }

    const encerramento: InternacaoEndRequest = {
      alta: valor.alta!,
      dataSaida: dataSaidaLocal,
    };

    this.internacoesService.encerrarInternacao(this.internacao().id, encerramento).subscribe({
      next: (internacaoEncerrada) => {
        this.visible.set(false);
        this.altaRegistrada.emit(internacaoEncerrada);
        this.messageService.add({
          severity: 'success',
          summary: 'Alta registrada!',
          detail: 'A internação foi encerrada com sucesso.',
          life: 3000,
        });
      },
    });
  }

  protected limparFormulario(): void {
    this.form.reset({
      alta: null,
      dataSaida: new Date(),
    });
    this.formSubmitted.set(false);
  }
}
