import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { FormError } from '../../../../shared/components/form-error/form-error';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { dateAndTimeToLocalDateTime } from '../../../../shared/utils/local-date-time';
import {
  dataHoraFuturaValidator,
  dataValidaValidator,
} from '../../../../shared/validators/data-validator';
import { Triagem } from '../../interfaces/triagem';
import { TriagensService } from '../../services/triagens-service';

@Component({
  selector: 'triagem-reagendamento-form',
  imports: [
    ButtonModule,
    DatePickerModule,
    DialogModule,
    FormError,
    FormField,
    InputMaskModule,
    ReactiveFormsModule,
  ],
  templateUrl: './triagem-reagendamento-form.html',
})
export class TriagemReagendamentoForm {
  private readonly fb = inject(FormBuilder);
  private readonly triagensService = inject(TriagensService);
  private readonly messageService = inject(MessageService);

  readonly triagem = input<Triagem | null>(null);
  readonly visible = input.required<boolean>();
  readonly loading = input(false);

  readonly visibleChange = output<boolean>();
  readonly hidden = output<void>();
  readonly reagendada = output<Triagem>();

  protected readonly formSubmitted = signal(false);
  protected readonly hoje = (() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  })();
  protected readonly reagendamentoForm = this.fb.nonNullable.group(
    {
      dataAgendada: this.fb.control<Date | null>(null, [Validators.required, dataValidaValidator]),
      horaAgendada: this.fb.control<Date | null>(null, [Validators.required, dataValidaValidator]),
    },
    { validators: dataHoraFuturaValidator('dataAgendada', 'horaAgendada') },
  );

  constructor() {
    effect(() => {
      const triagem = this.triagem();
      const visible = this.visible();

      if (!triagem || !visible) return;

      const dataAgendada = new Date(triagem.dataAgendada);
      this.reagendamentoForm.reset({
        dataAgendada,
        horaAgendada: dataAgendada,
      });
      this.formSubmitted.set(false);
    });
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.reagendamentoForm.get(controlName);
    const exibirErro = !!control && (control.touched || control.dirty || this.formSubmitted());

    return (exibirErro && !!control.invalid) || this.exibirErroDataHoraFutura();
  }

  protected getErrorMessage(controlName: string): string | null {
    const control = this.reagendamentoForm.get(controlName);
    const exibirErro = !!control && (control.touched || control.dirty || this.formSubmitted());

    if (!control?.invalid || !exibirErro) return null;

    if (control?.hasError('required')) {
      return controlName === 'horaAgendada' ? 'Horário é obrigatório' : 'Data é obrigatória';
    }

    if (control?.hasError('dataInvalida')) {
      return controlName === 'horaAgendada'
        ? 'Informe um horário válido.'
        : 'Informe uma data válida.';
    }

    return 'Valor inválido.';
  }

  protected exibirErroDataHoraFutura(): boolean {
    const data = this.reagendamentoForm.controls.dataAgendada;
    const hora = this.reagendamentoForm.controls.horaAgendada;
    const camposInteragidos = data.touched || data.dirty || hora.touched || hora.dirty;

    return (
      this.reagendamentoForm.hasError('dataHoraNaoFutura') &&
      (camposInteragidos || this.formSubmitted())
    );
  }

  protected reagendar(): void {
    this.formSubmitted.set(true);

    if (this.reagendamentoForm.invalid) {
      this.reagendamentoForm.markAllAsTouched();
      return;
    }

    const triagem = this.triagem();
    const { dataAgendada, horaAgendada } = this.reagendamentoForm.getRawValue();
    if (!triagem || !dataAgendada || !horaAgendada) return;

    this.triagensService
      .reagendarTriagem(triagem.id, {
        novaData: dateAndTimeToLocalDateTime(dataAgendada, horaAgendada),
      })
      .subscribe({
        next: (triagemAtualizada) => {
          this.reagendada.emit(triagemAtualizada);
          this.visibleChange.emit(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Triagem reagendada!',
            detail: 'A nova data e o horário foram salvos com sucesso.',
            life: 3000,
          });
        },
      });
  }
}
