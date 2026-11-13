import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideUserPlus } from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
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
import { formatTelefone } from '../../../../shared/utils/telefone-formatter';
import { cpfValidator } from '../../../../shared/validators/cpf-validator';
import { emailValidator, normalizeEmail } from '../../../../shared/validators/email-validator';
import { comprimentoEnderecoValidator } from '../../../../shared/validators/endereco-validator';
import { integerValidator } from '../../../../shared/validators/integer-validator';
import { telefoneValidator } from '../../../../shared/validators/telefone-validator';
import { comprimentoTextoValidator } from '../../../../shared/validators/texto-validator';
import { Responsavel } from '../../interfaces/responsavel';
import { ResponsavelRequest } from '../../interfaces/responsavel-request';
import { ResponsaveisService } from '../../services/responsaveis-service';

type ModoForm = 'registro' | 'atualizacao';

@Component({
  selector: 'responsavel-form',
  host: {
    class: 'flex min-w-0 flex-col gap-6',
  },
  imports: [
    FormHeader,
    ReactiveFormsModule,
    Card,
    FormField,
    ButtonModule,
    DividerModule,
    InputTextModule,
    InputMaskModule,
    InputNumberModule,
    SelectModule,
    SkeletonModule,
  ],
  templateUrl: './responsavel-form.html',
  styleUrl: './responsavel-form.css',
})
export class ResponsavelForm implements OnInit {
  readonly id = input<string>();
  readonly returnUrl = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly responsaveisService = inject(ResponsaveisService);

  protected readonly formSubmitted = signal(false);
  protected readonly carregando = signal(false);
  protected readonly numeroMaximoEndereco = 10_000;
  protected readonly estados = ESTADOS_BRASIL;
  protected readonly loading = this.responsaveisService.loading;
  protected readonly skeletonSecoes = [
    Array.from({ length: 2 }),
    Array.from({ length: 2 }),
    Array.from({ length: 6 }),
  ];

  protected readonly responsavelForm = this.fb.group({
    nome: this.fb.nonNullable.control('', [Validators.required, comprimentoTextoValidator(3, 250)]),
    cpf: this.fb.nonNullable.control('', [Validators.required, cpfValidator]),
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
        Validators.max(this.numeroMaximoEndereco),
      ]),
      bairro: ['', [Validators.required, comprimentoEnderecoValidator()]],
      cidade: ['', [Validators.required, comprimentoEnderecoValidator()]],
      estado: this.fb.control<string | null>(null, [Validators.required]),
      complemento: ['', [comprimentoEnderecoValidator(true)]],
    }),
  });

  private readonly labels: Record<string, string> = {
    nome: 'Nome completo',
    cpf: 'CPF',
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
  protected readonly voltarUrl = computed(() => {
    const returnUrl = this.returnUrl();
    return returnUrl?.startsWith('/acolhidos') ? returnUrl : '/acolhidos';
  });
  protected readonly voltarLabel = computed(() =>
    this.voltarUrl() === '/acolhidos' ? 'Voltar para acolhidos' : 'Voltar para acolhido',
  );
  protected readonly headerInfo = computed<InfoCardContent>(() => ({
    value: this.modo() === 'registro' ? 'Novo responsável' : 'Editar responsável',
    label:
      this.modo() === 'registro'
        ? 'Cadastre os dados pessoais, de contato e endereço do responsável.'
        : 'Atualize os dados pessoais, de contato e endereço do responsável.',
    icon: LucideUserPlus,
    color: '#be222d',
  }));
  protected readonly actionBtnLabel = computed(() =>
    this.modo() === 'registro' ? 'Cadastrar responsável' : 'Salvar alterações',
  );

  ngOnInit(): void {
    const id = this.id();
    if (id === undefined) return;

    const idNumerico = Number(id);
    if (!Number.isSafeInteger(idNumerico) || idNumerico <= 0) {
      this.registroNaoEncontrado();
      return;
    }

    this.carregando.set(true);
    this.responsaveisService.getResponsavelById(idNumerico).subscribe({
      next: (responsavel) => {
        this.preencherFormulario(responsavel);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.voltarParaOrigem();
      },
    });
  }

  protected isInvalid(campo: string): boolean {
    const control = this.responsavelForm.get(campo);
    return !!control && control.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(campo: string): string | null {
    if (!this.isInvalid(campo)) return null;
    const errors = this.responsavelForm.get(campo)?.errors;

    if (errors?.['required']) return `Preencha o campo ${this.labels[campo]}.`;
    if (errors?.['email']) return 'Informe um e-mail válido.';
    if (errors?.['cpfInvalido']) return 'Informe um CPF válido.';
    if (errors?.['telefoneInvalido']) return 'Informe um celular válido com DDD.';
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
      return `O número residencial deve ser menor ou igual a ${this.numeroMaximoEndereco.toLocaleString('pt-BR')}.`;
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

  protected voltarParaOrigem(): void {
    this.router.navigateByUrl(this.voltarUrl());
  }

  protected onSubmit(): void {
    if (this.loading().mutation) return;

    this.formSubmitted.set(true);
    this.responsavelForm.markAllAsTouched();
    if (this.responsavelForm.invalid) return;

    const valor = this.responsavelForm.getRawValue();
    const dados: ResponsavelRequest = {
      nome: valor.nome.trim(),
      cpf: valor.cpf,
      email: normalizeEmail(valor.email),
      telefone: valor.telefone,
      cep: valor.cep,
      endereco: {
        logradouro: valor.endereco.logradouro.trim(),
        numero: valor.endereco.numero!,
        bairro: valor.endereco.bairro.trim(),
        cidade: valor.endereco.cidade.trim(),
        estado: valor.endereco.estado!,
        complemento: (valor.endereco.complemento ?? '').trim(),
      },
    };

    const id = this.id();
    const request$ =
      id === undefined
        ? this.responsaveisService.createResponsavel(dados)
        : this.responsaveisService.updateResponsavel(Number(id), dados);

    request$.subscribe({
      next: (responsavelSalvo) => {
        this.messageService.add({
          severity: 'success',
          summary: id === undefined ? 'Responsável cadastrado!' : 'Responsável atualizado!',
          detail: 'Os dados foram salvos com sucesso.',
          life: 3000,
        });

        if (id === undefined && this.voltarUrl() !== '/acolhidos') {
          const destino = this.router.parseUrl(this.voltarUrl());
          destino.queryParams = {
            ...destino.queryParams,
            responsavelId: responsavelSalvo.id,
          };
          this.router.navigateByUrl(destino);
          return;
        }

        this.voltarParaOrigem();
      },
    });
  }

  private preencherFormulario(responsavel: Responsavel): void {
    this.responsavelForm.patchValue({
      nome: responsavel.nome,
      cpf: formatCpf(responsavel.cpf),
      email: responsavel.email,
      telefone: formatTelefone(responsavel.telefone),
      cep: formatCep(responsavel.cep),
      endereco: {
        logradouro: responsavel.endereco.logradouro,
        numero: responsavel.endereco.numero,
        bairro: responsavel.endereco.bairro,
        cidade: responsavel.endereco.cidade,
        estado: responsavel.endereco.estado,
        complemento: responsavel.endereco.complemento ?? '',
      },
    });
  }

  private registroNaoEncontrado(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Responsável não encontrado',
      detail: 'O registro solicitado não existe ou foi removido.',
      life: 4000,
    });
    this.voltarParaOrigem();
  }
}
