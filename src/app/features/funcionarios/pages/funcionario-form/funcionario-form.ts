import { Component, computed, inject, input, signal } from '@angular/core';
import { FuncionariosService } from '../../services/funcionarios-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, SelectItem } from 'primeng/api';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { LucideUsersRound } from '@lucide/angular';
import { FuncionarioRequest } from '../../interfaces/funcionario-request';
import { Funcionario } from '../../interfaces/funcionario';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { KeyFilterModule } from 'primeng/keyfilter';
import { Card } from '../../../../shared/components/card/card';
import { CustomErrorMessage } from '../../../../shared/directives/custom-error-message';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { CargosService } from '../../../cargos/services/cargos-service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { cpfValidator } from '../../../../shared/validators/cpf-validator';
import { telefoneValidator } from '../../../../shared/validators/telefone-validator';
import { formatCpf } from '../../../../shared/utils/cpf-formatter';
import { formatTelefone } from '../../../../shared/utils/telefone-formatter';

@Component({
  selector: 'app-funcionario-form',
  host: {
    class: 'flex flex-col gap-6',
  },
  imports: [
    FormHeader,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    InputMaskModule,
    DatePickerModule,
    SelectModule,
    KeyFilterModule,
    ReactiveFormsModule,
    FormHeader,
    Card,
    CustomErrorMessage,
    MessageModule,
    DividerModule,
    SelectButtonModule,
  ],
  templateUrl: './funcionario-form.html',
  styleUrl: './funcionario-form.css',
})
export class FuncionarioForm {
  readonly id = input<string>();

  protected readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly funcionariosService = inject(FuncionariosService);
  private readonly cargosService = inject(CargosService);
  protected readonly blockspace = /^[^\s]+$/;
  protected readonly blockslashandhyphen = /^[^-/]+$/;
  protected readonly cargos = this.cargosService.cargos;
  protected readonly loading = this.funcionariosService.loading;
  protected readonly hoje = new Date();
  protected minDataNascimento!: Date;
  protected readonly carregando = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly skeletonCampos = Array.from({ length: 5 });
  protected readonly modo = computed<FormState>(() => (this.id() ? 'atualizacao' : 'registro'));
  protected readonly funcionarioForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    cpf: ['', [Validators.required, cpfValidator]],
    email: ['', [Validators.required, Validators.email]],
    dataNascimento: this.fb.control<Date | null>(null, [Validators.required]),
    endereco: this.fb.nonNullable.group({
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: this.fb.control<string | null>(null, [Validators.required]),
      complemento: [''],
    }),
    cep: ['', [Validators.required]],
    telefone: ['', [Validators.required, telefoneValidator]],
    dataAdmissao: this.fb.control<Date | null>(null, [Validators.required]),
    user: this.fb.nonNullable.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.maxLength(128)]],
      cargo: this.fb.control<number | null>(null, [Validators.required]),
    }),
  });
  protected estados: SelectItem[] = [
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
    email: 'E-mail',
    dataNascimento: 'Data de nascimento',
    'endereco.logradouro': 'Logradouro',
    'endereco.numero': 'Número',
    'endereco.bairro': 'Bairro',
    'endereco.cidade': 'Cidade',
    'endereco.estado': 'Estado',
    'endereco.complemento': 'Complemento',
    cep: 'CEP',
    telefone: 'Telefone',
    dataAdmissao: 'Data de admissão',
    'user.username': 'Usuário',
    'user.password': 'Senha',
    'user.cargo': 'Cargo',
  };

  protected readonly passwordInputPt = {
    pcInputText: { root: { class: 'placeholder:tracking-widest' } },
  };

  protected readonly headerInfo = computed<InfoCardContent>(() => {
    const registro = this.modo() === 'registro';

    return {
      value: registro ? 'Novo funcionário' : 'Editar funcionário',
      label: registro
        ? 'Cadastre um novo funcionário para integrar a equipe e vincular a um cargo.'
        : 'Atualize os dados cadastrais e as informações do funcionário.',
      icon: LucideUsersRound,
      color: '#be222d',
    };
  });

  protected readonly actionBtnLabel = computed(() =>
    this.modo() === 'registro' ? 'Criar funcionário' : 'Salvar alterações',
  );

  ngOnInit(): void {
    const dataMinima = new Date();
    dataMinima.setFullYear(dataMinima.getFullYear() - 18);
    this.minDataNascimento = new Date(dataMinima);

    this.cargosService.getAllCargos().subscribe();
    const id = this.id();
    if (!id) return;

    const idNumerico = Number(id);

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      this.voltarParaLista();
      return;
    }

    this.carregando.set(true);

    this.funcionariosService.getFuncionarioById(Number(id)).subscribe({
      next: (funcionario) => {
        this.carregando.set(false);

        if (!funcionario) {
          this.funcionarioNaoEncontrado();
          return;
        }

        this.preencherFormulario(funcionario);
      },
      error: () => {
        this.carregando.set(false);
        this.voltarParaLista();
      },
    });
  }

  private preencherFormulario(funcionario: Funcionario): void {
    this.funcionarioForm.patchValue({
      nome: funcionario.nome,
      cpf: formatCpf(funcionario.cpf),
      endereco: {
        logradouro: funcionario.endereco.logradouro,
        numero: String(funcionario.endereco.numero),
        bairro: funcionario.endereco.bairro,
        cidade: funcionario.endereco.cidade,
        estado: funcionario.endereco.estado,
      },
      cep: this.formatCep(funcionario.cep),
      telefone: formatTelefone(funcionario.telefone),
      email: funcionario.email,
      dataNascimento: new Date(funcionario.dataNascimento),
      dataAdmissao: new Date(funcionario.dataAdmissao),
      user: {
        username: funcionario.user.username,
        password: '',
        cargo: funcionario.cargo.id,
      },
    });
  }

  private funcionarioNaoEncontrado(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Funcionário não encontrado',
      detail: 'O registro solicitado não existe ou foi removido.',
      life: 4000,
    });

    this.voltarParaLista();
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.funcionarioForm.get(controlName);
    return !!control?.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(controlName: string): string | null {
    const control = this.funcionarioForm.get(controlName);

    if (!this.isInvalid(controlName) || !control?.errors) return null;

    if (control.errors['required']) {
      return `${this.labels[controlName]} é obrigatório`;
    }

    if (control.errors['email']) {
      return `${this.labels[controlName]} está no formato incorreto`;
    }

    if (control.errors['cpfInvalido'] || control.errors['telefoneInvalido']) {
      return `Informe um ${this.labels[controlName]} válido`;
    }

    if (control.errors['minlength']) {
      const { requiredLength } = control.errors['minlength'];
      return `${this.labels[controlName]} deve ter pelo menos ${requiredLength} caracteres`;
    }

    if (control.errors['maxlength']) {
      const { requiredLength } = control.errors['maxlength'];
      return `${this.labels[controlName]} deve ter no máximo ${requiredLength} caracteres`;
    }

    return `${this.labels[controlName]} é inválido`;
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/funcionarios']);
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    console.log('entrou');
    if (this.funcionarioForm.invalid) {
      this.funcionarioForm.markAllAsDirty();
      return;
    }
    const funcionario = this.fromFormToRequest(this.funcionarioForm);

    const id = this.id();
    const request$ = id
      ? this.funcionariosService.updateFuncionario(Number(id), funcionario!)
      : this.funcionariosService.createFuncionario(funcionario!);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Funcionário atualizado!' : 'Funcionário criado!',
          detail: id
            ? 'As alterações foram salvas com sucesso.'
            : 'O funcionário foi cadastrado com sucesso.',
          life: 3000,
        });

        this.voltarParaLista();
      },
    });
  }

  fromFormToRequest(form: FormGroup): FuncionarioRequest {
    const { endereco, user, ...formData } = form.getRawValue();
    const { cargo, ...userNormalizado } = user;

    return {
      ...formData,
      dataNascimento: new Date(formData.dataNascimento!),
      cargoId: cargo!,
      dataAdmissao: new Date(formData.dataAdmissao!),
      endereco: {
        ...endereco,
        numero: Number(endereco.numero),
        estado: endereco.estado!,
      },
      user: {
        ...userNormalizado,
      },
    };
  }

  limparForm(): void {
    this.formSubmitted.set(false);
    this.funcionarioForm.reset();

    this.router.navigate(['/funcionarios']);
  }

  formatCep(cep: string): string {
    return `${cep.slice(0, 5)}-${cep.slice(5)}`;
  }
}
