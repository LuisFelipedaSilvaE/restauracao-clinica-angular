import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { LucideUserPlus } from '@lucide/angular';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { Card } from '../../../../shared/components/card/card';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { AcolhidosMockService } from '../../services/acolhidos-mock-service';
import { Acolhido } from '../../interfaces/acolhido';

type ModoForm = 'registro' | 'atualizacao';

const dataValida: ValidatorFn = (control) => {
  if (control.value === null) return null;
  return control.value instanceof Date && Number.isFinite(control.value.getTime())
    ? null
    : { dataInvalida: true };
};

const datasCoerentes: ValidatorFn = (form) => {
  const nascimento = form.get('dataNascimento')?.value;
  const entrada = form.get('dataEntrada')?.value;
  return nascimento instanceof Date && entrada instanceof Date && nascimento > entrada
    ? { entradaAntesNascimento: true }
    : null;
};

@Component({
  selector: 'app-acolhido-form',
  host: {
    class: 'flex min-w-0 flex-col gap-6',
  },
  imports: [
    FormHeader,
    ReactiveFormsModule,
    Card,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    DatePickerModule,
    SelectModule,
    InputNumberModule,
    TextareaModule,
    DividerModule,
    SkeletonModule,
    FormField,
  ],
  templateUrl: './acolhido-form.html',
  styleUrl: './acolhido-form.css',
})
export class AcolhidoForm implements OnInit {
  readonly id = input<string>();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly acolhidosService = inject(AcolhidosMockService);
  private idTriagem?: number;
  protected readonly formSubmitted = signal(false);
  protected readonly salvando = signal(false);
  protected readonly carregando = signal(false);
  protected readonly skeletonSecoes = computed(() => [
    { campos: [true, false, false], textarea: false },
    { campos: [false, false, false], textarea: false },
    {
      campos: this.modo() === 'atualizacao' ? [false, false, false, true] : [false, false],
      textarea: false,
    },
    { campos: [false], textarea: true },
  ]);
  protected readonly hoje = new Date();
  protected readonly modalidades = this.acolhidosService.modalidades;
  protected readonly etapas = [
    'Em tratamento',
    'Próximo da alta',
    'Alta vencida',
    'Alta concedida',
    'Desligado',
  ];
  protected readonly statusOptions = ['Ativo', 'Inativo'];

  protected readonly acolhidoForm = this.fb.group(
    {
      nome: ['', [Validators.required, Validators.pattern(/\S/)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      dataNascimento: [
        null as Date | null,
        [
          Validators.required,
          dataValida,
          (control) =>
            control.value instanceof Date && control.value > this.hoje
              ? { nascimentoFuturo: true }
              : null,
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      modalidadeId: [null as number | null, [Validators.required]],
      dataEntrada: [new Date() as Date | null, [Validators.required, dataValida]],
      etapaTratamento: ['Em tratamento', [Validators.required]],
      status: ['Ativo', [Validators.required]],
      valorPagamento: [
        0 as number | null,
        [
          Validators.required,
          Validators.min(0),
          (control) =>
            control.value === null ||
            (Number.isFinite(control.value) &&
              Math.abs(control.value * 100 - Math.round(control.value * 100)) < 0.000001)
              ? null
              : { moedaInvalida: true },
        ],
      ],
      observacaoIsencao: [''],
    },
    { validators: datasCoerentes },
  );

  private readonly labels: Record<string, string> = {
    nome: 'Nome completo',
    cpf: 'CPF',
    dataNascimento: 'Data de nascimento',
    email: 'E-mail',
    telefone: 'Telefone',
    cep: 'CEP',
    modalidadeId: 'Modalidade',
    dataEntrada: 'Data de entrada',
    etapaTratamento: 'Etapa de tratamento',
    status: 'Status',
    valorPagamento: 'Valor do pagamento',
  };
  protected readonly modo = computed<ModoForm>(() => (this.id() ? 'atualizacao' : 'registro'));

  protected readonly headerInfo = computed<InfoCardContent>(() => {
    const registro = this.modo() === 'registro';

    return {
      value: registro ? 'Novo acolhido' : 'Editar acolhido',
      label: registro
        ? 'Cadastre um novo acolhido e defina seus dados de internação.'
        : 'Atualize os dados de internação e informações de contato do acolhido.',
      icon: LucideUserPlus,
      color: '#be222d',
    };
  });

  protected readonly actionBtnLabel = computed(() =>
    this.modo() === 'registro' ? 'Cadastrar acolhido' : 'Salvar alterações',
  );

  ngOnInit(): void {
    const id = this.id();
    if (id === undefined) return;
    const idNumerico = Number(id);
    const acolhido =
      Number.isSafeInteger(idNumerico) && idNumerico > 0
        ? this.acolhidosService.acolhidos().find((item) => item.id === idNumerico)
        : undefined;

    if (!acolhido) {
      this.registroNaoEncontrado();
      return;
    }

    this.idTriagem = acolhido.id_triagem;
    this.acolhidoForm.patchValue({
      nome: acolhido.nome,
      cpf: acolhido.cpf,
      email: acolhido.email,
      telefone: acolhido.telefone,
      cep: acolhido.cep,
      modalidadeId: acolhido.modalidade.id,
      dataNascimento: new Date(acolhido.dataNascimento),
      dataEntrada: new Date(acolhido.dataEntrada),
      etapaTratamento: acolhido.etapaTratamento,
      status: acolhido.status,
      valorPagamento: acolhido.valorPagamento,
      observacaoIsencao: acolhido.observacaoIsencao ?? '',
    });
  }

  protected isInvalid(campo: string): boolean {
    const control = this.acolhidoForm.get(campo);
    return (
      !!control &&
      (control.touched || this.formSubmitted()) &&
      (control.invalid ||
        (campo === 'dataEntrada' && this.acolhidoForm.hasError('entradaAntesNascimento')))
    );
  }

  protected getErrorMessage(campo: string): string | null {
    if (!this.isInvalid(campo)) return null;
    const errors = this.acolhidoForm.get(campo)?.errors;
    if (errors?.['required']) return `Preencha o campo ${this.labels[campo]}.`;
    if (errors?.['email']) return 'Informe um e-mail válido.';
    if (errors?.['pattern']) {
      if (campo === 'nome') return 'O nome não pode conter apenas espaços.';
      return `Preencha ${this.labels[campo]} por completo, no formato indicado.`;
    }
    if (errors?.['nascimentoFuturo']) return 'A data de nascimento não pode estar no futuro.';
    if (errors?.['dataInvalida']) return 'Informe uma data válida.';
    if (errors?.['min']) return `${this.labels[campo]} deve ser no mínimo ${errors['min'].min}.`;
    if (errors?.['moedaInvalida']) return 'Informe um valor válido com até duas casas decimais.';
    if (campo === 'dataEntrada' && this.acolhidoForm.hasError('entradaAntesNascimento')) {
      return 'A data de entrada não pode ser anterior ao nascimento.';
    }
    return `Verifique o campo ${this.labels[campo]}.`;
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/acolhidos']);
  }

  private registroNaoEncontrado(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Acolhido não encontrado',
      detail: 'O registro solicitado não existe ou foi removido.',
      life: 4000,
    });
    this.voltarParaLista();
  }

  protected onSubmit(): void {
    if (this.salvando()) return;
    this.formSubmitted.set(true);
    this.acolhidoForm.markAllAsTouched();
    if (this.acolhidoForm.invalid) return;

    const valor = this.acolhidoForm.getRawValue();
    const registro = this.modo() === 'registro';
    const etapaTratamento = registro ? 'Em tratamento' : valor.etapaTratamento;
    const status = registro ? 'Ativo' : valor.status;
    const modalidade = this.modalidades.find((item) => item.id === valor.modalidadeId);
    if (
      !modalidade ||
      !this.etapas.includes(etapaTratamento ?? '') ||
      !this.statusOptions.includes(status ?? '')
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Revise o formulário',
        detail: registro
          ? 'Selecione uma modalidade válida.'
          : 'Selecione uma modalidade, uma etapa e um status válidos.',
        life: 4000,
      });
      return;
    }

    const dados: Omit<Acolhido, 'id'> = {
      modalidade,
      ...(registro || this.idTriagem === undefined ? {} : { id_triagem: this.idTriagem }),
      nome: valor.nome!.trim(),
      cpf: valor.cpf!,
      cep: valor.cep!,
      telefone: valor.telefone!,
      email: valor.email!.trim(),
      dataNascimento: new Date(valor.dataNascimento!),
      dataEntrada: new Date(valor.dataEntrada!),
      valorPagamento: valor.valorPagamento!,
      observacaoIsencao: valor.observacaoIsencao?.trim() || undefined,
      etapaTratamento: etapaTratamento!,
      status: status!,
    };
    this.salvando.set(true);
    const id = this.id();
    if (id !== undefined) {
      if (!this.acolhidosService.atualizar(Number(id), dados)) {
        this.salvando.set(false);
        this.registroNaoEncontrado();
        return;
      }
    } else {
      this.acolhidosService.criar(dados);
    }
    this.messageService.add({
      severity: 'success',
      summary: id !== undefined ? 'Acolhido atualizado!' : 'Acolhido cadastrado!',
      detail: 'Os dados foram salvos com sucesso.',
      life: 3000,
    });
    this.voltarParaLista();
  }
}
