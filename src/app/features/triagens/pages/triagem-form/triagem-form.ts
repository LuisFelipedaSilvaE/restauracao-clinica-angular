import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideCalendar, LucideCalendarPlus } from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { Card } from '../../../../shared/components/card/card';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { dateAndTimeToLocalDateTime } from '../../../../shared/utils/local-date-time';
import {
  dataHoraFuturaValidator,
  dataValidaValidator,
} from '../../../../shared/validators/data-validator';
import { integerValidator } from '../../../../shared/validators/integer-validator';
import { telefoneValidator } from '../../../../shared/validators/telefone-validator';
import { comprimentoTextoValidator } from '../../../../shared/validators/texto-validator';
import { ConveniosService } from '../../../convenios/services/convenios-service';
import { Triagem } from '../../interfaces/triagem';
import { TriagemRequest } from '../../interfaces/triagem-request';
import { TriagensService } from '../../services/triagens-service';

@Component({
  selector: 'app-triagem-form',
  host: {
    class: 'flex flex-col gap-6',
  },
  imports: [
    FormHeader,
    Card,
    DividerModule,
    ButtonModule,
    TextareaModule,
    InputTextModule,
    SelectModule,
    InputMaskModule,
    DatePickerModule,
    SkeletonModule,
    ReactiveFormsModule,
    FormField,
  ],
  templateUrl: './triagem-form.html',
  styleUrl: './triagem-form.css',
})
export class TriagemForm implements OnInit {
  protected readonly id = input<string>();
  private readonly conveniosService = inject(ConveniosService);
  private readonly triagensService = inject(TriagensService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  protected readonly convenios = computed(() =>
    this.conveniosService.convenios().filter((convenio) => convenio.ativo),
  );
  protected readonly carregando = signal(false);
  protected readonly formSubmitted = signal<boolean>(false);
  protected readonly skeletonCampos = Array.from({ length: 5 });
  protected readonly hoje = (() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  })();
  private readonly fb = inject(FormBuilder);
  protected readonly triagemForm = this.fb.nonNullable.group(
    {
      convenio: this.fb.control<number | null>(null, [
        Validators.required,
        integerValidator,
        Validators.min(1),
      ]),
      nomePossivelAcolhido: ['', [Validators.required, comprimentoTextoValidator(3, 255)]],
      telefone: ['', [Validators.required, telefoneValidator]],
      dataAgendada: this.fb.control<Date | null>(null, [Validators.required, dataValidaValidator]),
      horaAgendada: this.fb.control<Date | null>(null, [Validators.required, dataValidaValidator]),
      observacaoEntrevista: ['', [Validators.maxLength(1000)]],
    },
    { validators: dataHoraFuturaValidator('dataAgendada', 'horaAgendada') },
  );
  protected readonly headerContent = computed(() => {
    const id = this.id();

    return {
      value: id ? 'Editar triagem' : 'Nova triagem',
      label: id
        ? 'Atualize os dados e as informações do agendamento desta triagem.'
        : 'Agende o acolhimento inicial do candidato.',
      icon: id ? LucideCalendar : LucideCalendarPlus,
      color: '#be222d',
    };
  });
  private readonly labels: Record<string, string> = {
    convenio: 'Convênio',
    nomePossivelAcolhido: 'Nome do candidato',
    telefone: 'Telefone',
    dataAgendada: 'Data',
    horaAgendada: 'Horário',
    observacaoEntrevista: 'Observações',
  };

  ngOnInit(): void {
    this.conveniosService.getAllConvenios().subscribe();

    if (this.id()) {
      this.getTriagem();
    }
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.triagemForm.get(controlName);
    const exibirErro = !!control && (control.touched || this.formSubmitted());
    const dataHoraNaoFutura =
      controlName === 'dataAgendada' && this.triagemForm.hasError('dataHoraNaoFutura');

    return exibirErro && (!!control.invalid || dataHoraNaoFutura);
  }

  protected getErrorMessage(controlName: string): string | null {
    const control = this.triagemForm.get(controlName);

    if (!this.isInvalid(controlName)) return null;

    if (controlName === 'dataAgendada' && this.triagemForm.hasError('dataHoraNaoFutura')) {
      return 'A data e o horário agendados devem estar no futuro.';
    }

    if (!control?.errors) return null;

    if (control.errors['required']) {
      return `${this.labels[controlName]} é obrigatório`;
    }

    if (control.errors['telefoneInvalido']) {
      return 'Informe um celular válido com DDD.';
    }

    if (control.errors['dataInvalida']) {
      return controlName === 'horaAgendada'
        ? 'Informe um horário válido.'
        : 'Informe uma data válida.';
    }

    if (control.errors['minlength']) {
      return `${this.labels[controlName]} deve ter no mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
    }

    if (control.errors['maxlength']) {
      return `${this.labels[controlName]} deve ter no máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
    }

    if (control.errors['min'] || control.errors['inteiro']) {
      return 'Selecione um convênio válido.';
    }

    return `${this.labels[controlName]} é inválido`;
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/triagens']);
  }

  limparForm(): void {
    this.formSubmitted.set(false);
    this.triagemForm.reset();

    this.router.navigate(['/triagens']);
  }

  getTriagem(): void {
    const idNumerico = Number(this.id());

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      this.voltarParaLista();
      return;
    }

    this.carregando.set(true);

    this.triagensService.getTriagemById(idNumerico).subscribe({
      next: (triagem) => {
        this.carregando.set(false);

        if (!triagem) {
          this.triagemNaoEncontrada();
          return;
        }

        this.preencherFormulario(triagem);
      },
      error: () => {
        this.carregando.set(false);
        this.voltarParaLista();
      },
    });
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.triagemForm.invalid) {
      this.triagemForm.markAllAsDirty();
      return;
    }
    const triagem = this.fromFormToRequest(this.triagemForm);

    const id = this.id();
    const request$ = id
      ? this.triagensService.updateTriagem(Number(id), triagem!)
      : this.triagensService.createTriagem(triagem!);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Triagem atualizada!' : 'Triagem criada!',
          detail: id
            ? 'As alterações foram salvas com sucesso.'
            : 'A triagem foi cadastrada com sucesso.',
          life: 3000,
        });

        this.voltarParaLista();
      },
    });
  }

  fromFormToRequest(form: FormGroup): TriagemRequest {
    const { convenio, dataAgendada, horaAgendada, ...formData } = form.getRawValue();

    return {
      ...formData,
      nomePossivelAcolhido: formData.nomePossivelAcolhido.trim(),
      observacaoEntrevista: formData.observacaoEntrevista.trim(),
      convenioId: convenio!,
      dataAgendada: dateAndTimeToLocalDateTime(dataAgendada, horaAgendada),
    };
  }

  private preencherFormulario(triagem: Triagem): void {
    this.triagemForm.patchValue({
      convenio: triagem.convenio.id,
      nomePossivelAcolhido: triagem.nomePossivelAcolhido,
      telefone: triagem.telefone,
      dataAgendada: new Date(triagem.dataAgendada),
      horaAgendada: new Date(triagem.dataAgendada),
      observacaoEntrevista: triagem.observacaoEntrevista,
    });
  }

  private triagemNaoEncontrada(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Funcionário não encontrado',
      detail: 'O registro solicitado não existe ou foi removido.',
      life: 4000,
    });

    this.voltarParaLista();
  }
}
