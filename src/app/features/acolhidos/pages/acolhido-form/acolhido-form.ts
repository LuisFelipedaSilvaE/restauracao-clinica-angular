import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideUserPlus } from '@lucide/angular';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { Card } from '../../../../shared/components/card/card';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { formatCpf } from '../../../../shared/utils/cpf-formatter';
import { formatTelefone } from '../../../../shared/utils/telefone-formatter';
import { cpfValidator } from '../../../../shared/validators/cpf-validator';
import { telefoneValidator } from '../../../../shared/validators/telefone-validator';
import { TriagensService } from '../../../triagens/services/triagens-service';
import { Acolhido } from '../../interfaces/acolhido';
import { AcolhidoRequest } from '../../interfaces/acolhido-request';
import { AcolhidosService } from '../../services/acolhidos-service';

type ModoForm = 'registro' | 'atualizacao';

const dataValida: ValidatorFn = (control) => {
  if (control.value === null) return null;
  return control.value instanceof Date && Number.isFinite(control.value.getTime())
    ? null
    : { dataInvalida: true };
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
    DividerModule,
    SkeletonModule,
    FormField,
  ],
  templateUrl: './acolhido-form.html',
  styleUrl: './acolhido-form.css',
})
export class AcolhidoForm implements OnInit {
  readonly id = input<string>();
  readonly triagemId = input<string>();
  readonly returnUrl = input<string>();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly acolhidosService = inject(AcolhidosService);
  private readonly triagensService = inject(TriagensService);
  protected readonly formSubmitted = signal(false);
  protected readonly salvando = signal(false);
  protected readonly carregando = signal(false);
  protected readonly skeletonSecoes = [
    Array.from({ length: 3 }),
    Array.from({ length: 3 }),
    Array.from({ length: 6 }),
  ];
  protected readonly hoje = new Date();

  protected readonly acolhidoForm = this.fb.group({
    nome: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/\S/)]),
    cpf: this.fb.nonNullable.control('', [Validators.required, cpfValidator]),
    dataNascimento: this.fb.control<Date | null>(null, [
      Validators.required,
      dataValida,
      (control) =>
        control.value instanceof Date && control.value > this.hoje
          ? { nascimentoFuturo: true }
          : null,
    ]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    telefone: this.fb.nonNullable.control('', [Validators.required, telefoneValidator]),
    cep: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^\d{5}-\d{3}$/),
    ]),
    endereco: this.fb.nonNullable.group({
      logradouro: ['', [Validators.required, Validators.pattern(/\S/)]],
      numero: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      bairro: ['', [Validators.required, Validators.pattern(/\S/)]],
      cidade: ['', [Validators.required, Validators.pattern(/\S/)]],
      estado: this.fb.control<string | null>(null, [Validators.required]),
      complemento: [''],
    }),
  });

  protected readonly estados: SelectItem[] = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
  ];

  private readonly labels: Record<string, string> = {
    nome: 'Nome completo',
    cpf: 'CPF',
    dataNascimento: 'Data de nascimento',
    email: 'E-mail',
    telefone: 'Telefone',
    cep: 'CEP',
    'endereco.logradouro': 'Logradouro',
    'endereco.numero': 'Número',
    'endereco.bairro': 'Bairro',
    'endereco.cidade': 'Cidade',
    'endereco.estado': 'Estado',
    'endereco.complemento': 'Complemento',
  };

  protected readonly modo = computed<ModoForm>(() => (this.id() ? 'atualizacao' : 'registro'));
  protected readonly voltarUrl = computed(() =>
    this.returnUrl()?.startsWith('/internacoes') ? this.returnUrl()! : '/acolhidos',
  );
  protected readonly voltarLabel = computed(() =>
    this.voltarUrl() === '/acolhidos' ? 'Voltar para acolhidos' : 'Voltar para internação',
  );
  protected readonly headerInfo = computed<InfoCardContent>(() => ({
    value: this.modo() === 'registro' ? 'Novo acolhido' : 'Editar acolhido',
    label:
      this.modo() === 'registro'
        ? 'Cadastre os dados pessoais, de contato e endereço do acolhido.'
        : 'Atualize os dados pessoais, de contato e endereço do acolhido.',
    icon: LucideUserPlus,
    color: '#be222d',
  }));
  protected readonly actionBtnLabel = computed(() =>
    this.modo() === 'registro' ? 'Cadastrar acolhido' : 'Salvar alterações',
  );

  ngOnInit(): void {
    const id = this.id();
    if (id === undefined) {
      this.preencherDadosDaTriagem();
      return;
    }

    const idNumerico = Number(id);
    if (!Number.isSafeInteger(idNumerico) || idNumerico <= 0) {
      this.registroNaoEncontrado();
      return;
    }

    this.carregando.set(true);
    this.acolhidosService.getAcolhidoById(idNumerico).subscribe({
      next: (acolhido) => {
        this.preencherFormulario(acolhido);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.voltarParaLista();
      },
    });
  }

  private preencherFormulario(acolhido: Acolhido): void {
    this.acolhidoForm.patchValue({
      nome: acolhido.nome,
      cpf: formatCpf(acolhido.cpf),
      email: acolhido.email,
      telefone: formatTelefone(acolhido.telefone),
      cep: this.formatCep(acolhido.cep),
      dataNascimento: this.converterDataDaApi(acolhido.dataNascimento),
      endereco: {
        logradouro: acolhido.endereco.logradouro,
        numero: String(acolhido.endereco.numero),
        bairro: acolhido.endereco.bairro,
        cidade: acolhido.endereco.cidade,
        estado: acolhido.endereco.estado,
        complemento: acolhido.endereco.complemento ?? '',
      },
    });
  }

  protected isInvalid(campo: string): boolean {
    const control = this.acolhidoForm.get(campo);
    return !!control && control.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(campo: string): string | null {
    if (!this.isInvalid(campo)) return null;
    const errors = this.acolhidoForm.get(campo)?.errors;

    if (errors?.['required']) return `Preencha o campo ${this.labels[campo]}.`;
    if (errors?.['email']) return 'Informe um e-mail válido.';
    if (errors?.['cpfInvalido']) return 'Informe um CPF válido.';
    if (errors?.['telefoneInvalido']) return 'Informe um telefone válido com DDD.';
    if (errors?.['nascimentoFuturo']) return 'A data de nascimento não pode estar no futuro.';
    if (errors?.['dataInvalida']) return 'Informe uma data válida.';
    if (errors?.['pattern']) {
      if (campo === 'endereco.numero') return 'Informe somente números.';
      if (campo === 'cep') return 'Preencha o CEP por completo, no formato indicado.';
      return `${this.labels[campo]} não pode conter apenas espaços.`;
    }
    return `Verifique o campo ${this.labels[campo]}.`;
  }

  protected voltarParaLista(): void {
    this.router.navigateByUrl(this.voltarUrl());
  }

  protected onSubmit(): void {
    if (this.salvando()) return;
    this.formSubmitted.set(true);
    this.acolhidoForm.markAllAsTouched();
    if (this.acolhidoForm.invalid) return;

    const valor = this.acolhidoForm.getRawValue();
    const id = this.id();
    const dados: AcolhidoRequest = {
      nome: valor.nome.trim(),
      email: valor.email.trim(),
      cpf: valor.cpf,
      cep: valor.cep,
      endereco: {
        logradouro: valor.endereco.logradouro.trim(),
        numero: Number(valor.endereco.numero),
        bairro: valor.endereco.bairro.trim(),
        cidade: valor.endereco.cidade.trim(),
        estado: valor.endereco.estado!,
        complemento: (valor.endereco.complemento ?? '').trim(),
      },
      telefone: valor.telefone,
      dataNascimento: this.formatarDataParaApi(valor.dataNascimento!),
    };

    this.salvando.set(true);
    const request$ =
      id !== undefined
        ? this.acolhidosService.updateAcolhido(Number(id), dados)
        : this.acolhidosService.createAcolhido(dados);

    request$.subscribe({
      next: (acolhidoSalvo) => {
        this.messageService.add({
          severity: 'success',
          summary: id !== undefined ? 'Acolhido atualizado!' : 'Acolhido cadastrado!',
          detail: 'Os dados foram salvos com sucesso.',
          life: 3000,
        });

        if (id === undefined && this.voltarUrl() !== '/acolhidos') {
          this.router.navigate([this.voltarUrl()], {
            queryParams: {
              acolhidoId: acolhidoSalvo.id,
              triagemId: this.triagemId(),
            },
          });
          return;
        }

        this.voltarParaLista();
      },
      error: () => {
        this.salvando.set(false);
      },
    });
  }

  private preencherDadosDaTriagem(): void {
    const idTriagem = Number(this.triagemId());
    if (!Number.isSafeInteger(idTriagem) || idTriagem <= 0) return;

    this.triagensService.getTriagemById(idTriagem).subscribe((triagem) => {
      if (!triagem) return;
      this.acolhidoForm.patchValue({
        nome: triagem.nomePossivelAcolhido,
        telefone: triagem.telefone,
      });
    });
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

  private formatCep(cep: string): string {
    const numeros = cep.replace(/\D/g, '');
    return numeros.length === 8 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : cep;
  }

  private formatarDataParaApi(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private converterDataDaApi(data: string): Date {
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }
}
