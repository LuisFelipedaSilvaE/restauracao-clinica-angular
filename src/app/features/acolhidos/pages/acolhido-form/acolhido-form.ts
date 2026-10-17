import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideUserPlus } from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { Card } from '../../../../shared/components/card/card';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { ESTADOS_BRASIL } from '../../../../shared/data/estados-brasil';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { formatCep } from '../../../../shared/utils/cep-formatter';
import { formatCpf } from '../../../../shared/utils/cpf-formatter';
import { dateToLocalDate, localDateToDate } from '../../../../shared/utils/local-date';
import { formatTelefone } from '../../../../shared/utils/telefone-formatter';
import { cpfValidator } from '../../../../shared/validators/cpf-validator';
import {
  calcularDataLimiteIdade,
  dataMaximaValidator,
  dataMinimaValidator,
  dataValidaValidator,
  idadeMinimaValidator,
} from '../../../../shared/validators/data-validator';
import { emailValidator, normalizeEmail } from '../../../../shared/validators/email-validator';
import {
  comprimentoEnderecoValidator,
  NUMERO_MAXIMO_ENDERECO,
} from '../../../../shared/validators/endereco-validator';
import { telefoneValidator } from '../../../../shared/validators/telefone-validator';
import { comprimentoTextoValidator } from '../../../../shared/validators/texto-validator';
import { integerValidator } from '../../../../shared/validators/integer-validator';
import { TriagensService } from '../../../triagens/services/triagens-service';
import { Acolhido } from '../../interfaces/acolhido';
import { AcolhidoRequest } from '../../interfaces/acolhido-request';
import { AcolhidosService } from '../../services/acolhidos-service';

type ModoForm = 'registro' | 'atualizacao';

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
    InputNumberModule,
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
  protected readonly dataMinimaNascimento = new Date(1900, 0, 1);
  protected readonly dataMaximaNascimento = calcularDataLimiteIdade(18, this.hoje);

  protected readonly acolhidoForm = this.fb.group({
    nome: this.fb.nonNullable.control('', [Validators.required, comprimentoTextoValidator(3, 250)]),
    cpf: this.fb.nonNullable.control('', [Validators.required, cpfValidator]),
    dataNascimento: this.fb.control<Date | null>(null, [
      Validators.required,
      dataValidaValidator,
      dataMinimaValidator(this.dataMinimaNascimento),
      dataMaximaValidator(this.hoje),
      idadeMinimaValidator(18, this.hoje),
    ]),
    email: this.fb.nonNullable.control('', [Validators.required, emailValidator]),
    telefone: this.fb.nonNullable.control('', [Validators.required, telefoneValidator]),
    cep: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^\d{5}-\d{3}$/),
    ]),
    endereco: this.fb.nonNullable.group({
      logradouro: ['', [Validators.required, comprimentoEnderecoValidator()]],
      numero: this.fb.control<number | null>(null, [
        Validators.required,
        integerValidator,
        Validators.min(1),
        Validators.max(NUMERO_MAXIMO_ENDERECO),
      ]),
      bairro: ['', [Validators.required, comprimentoEnderecoValidator()]],
      cidade: ['', [Validators.required, comprimentoEnderecoValidator()]],
      estado: this.fb.control<string | null>(null, [Validators.required]),
      complemento: ['', [comprimentoEnderecoValidator(true)]],
    }),
  });

  protected readonly estados = ESTADOS_BRASIL;

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
      cep: formatCep(acolhido.cep),
      dataNascimento: localDateToDate(acolhido.dataNascimento),
      endereco: {
        logradouro: acolhido.endereco.logradouro,
        numero: acolhido.endereco.numero,
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
    if (errors?.['dataPosteriorMaxima']) return 'A data de nascimento não pode estar no futuro.';
    if (errors?.['dataAnteriorMinima']) {
      return 'A data de nascimento não pode ser anterior a 01/01/1900.';
    }
    if (errors?.['idadeMinima']) return 'O acolhido deve ter pelo menos 18 anos.';
    if (errors?.['dataInvalida']) return 'Informe uma data válida.';
    if (errors?.['minlength']) {
      return `${this.labels[campo]} deve ter no mínimo ${errors['minlength'].requiredLength} caracteres.`;
    }
    if (errors?.['maxlength']) {
      return `${this.labels[campo]} deve ter no máximo ${errors['maxlength'].requiredLength} caracteres.`;
    }
    if (errors?.['min'] && campo === 'endereco.numero') {
      return 'O número residencial deve ser maior que zero.';
    }
    if (errors?.['max'] && campo === 'endereco.numero') {
      return `O número residencial deve ser menor ou igual a ${NUMERO_MAXIMO_ENDERECO}.`;
    }
    if (errors?.['inteiro'] && campo === 'endereco.numero') {
      return 'Informe um número residencial inteiro.';
    }
    if (errors?.['pattern']) {
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
      email: normalizeEmail(valor.email),
      cpf: valor.cpf,
      cep: valor.cep,
      endereco: {
        logradouro: valor.endereco.logradouro.trim(),
        numero: valor.endereco.numero!,
        bairro: valor.endereco.bairro.trim(),
        cidade: valor.endereco.cidade.trim(),
        estado: valor.endereco.estado!,
        complemento: (valor.endereco.complemento ?? '').trim(),
      },
      telefone: valor.telefone,
      dataNascimento: dateToLocalDate(valor.dataNascimento!),
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
}
