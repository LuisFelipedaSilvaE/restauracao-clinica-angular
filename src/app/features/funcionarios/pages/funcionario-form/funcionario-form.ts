import { SyncInputMask } from '../../../../shared/directives/sync-input-mask';
import { AccessiblePassword } from '../../../../shared/directives/accessible-password';
import { AutoFocusError } from '../../../../shared/directives/auto-focus-error';
import { Component, computed, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LucideUsersRound } from '@lucide/angular';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Card } from '../../../../shared/components/card/card';
import { UserRole } from '../../../../core/guards/models/user-role.model';
import { AuthService } from '../../../../core/services/auth-service';
import { UsersService } from '../../../../core/services/users-service';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { FormState } from '../../../../shared/types/form-state';
import { ESTADOS_BRASIL } from '../../../../shared/data/estados-brasil';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { formatCep } from '../../../../shared/utils/cep-formatter';
import { formatCpf } from '../../../../shared/utils/cpf-formatter';
import { dateToLocalDate, localDateToDate } from '../../../../shared/utils/local-date';
import { formatTelefone } from '../../../../shared/utils/telefone-formatter';
import { cpfValidator } from '../../../../shared/validators/cpf-validator';
import { emailValidator, normalizeEmail } from '../../../../shared/validators/email-validator';
import {
  comprimentoEnderecoValidator,
  NUMERO_MAXIMO_ENDERECO,
} from '../../../../shared/validators/endereco-validator';
import { integerValidator } from '../../../../shared/validators/integer-validator';
import { telefoneValidator } from '../../../../shared/validators/telefone-validator';
import { comprimentoTextoValidator } from '../../../../shared/validators/texto-validator';
import { CargosService } from '../../../cargos/services/cargos-service';
import { Funcionario } from '../../interfaces/funcionario';
import { FuncionarioRequest } from '../../interfaces/funcionario-request';
import { FuncionariosService } from '../../services/funcionarios-service';

const DATA_MINIMA = new Date(1900, 0, 1);

function normalizarDataSemHora(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

const dataNoIntervaloValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  if (control.value === null || control.value === '') return null;
  if (!(control.value instanceof Date) || !Number.isFinite(control.value.getTime())) {
    return { dataInvalida: true };
  }

  const data = normalizarDataSemHora(control.value);
  const hoje = normalizarDataSemHora(new Date());

  if (data < DATA_MINIMA) return { dataMuitoAntiga: true };
  if (data > hoje) return { dataFutura: true };

  return null;
};

const datasFuncionarioCoerentes: ValidatorFn = (
  form: AbstractControl,
): ValidationErrors | null => {
  const nascimento = form.get('dataNascimento')?.value;
  const admissao = form.get('dataAdmissao')?.value;

  if (
    !(nascimento instanceof Date) ||
    !Number.isFinite(nascimento.getTime()) ||
    !(admissao instanceof Date) ||
    !Number.isFinite(admissao.getTime())
  ) {
    return null;
  }

  return normalizarDataSemHora(admissao) < normalizarDataSemHora(nascimento)
    ? { admissaoAntesNascimento: true }
    : null;
};

@Component({
  selector: 'app-funcionario-form',
  host: {
    class: 'flex flex-col gap-6',
  },
  imports: [
    AccessiblePassword,
    AutoFocusError,
    FormHeader,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    PasswordModule,
    InputMaskModule,
    SyncInputMask,
    DatePickerModule,
    SelectModule,
    KeyFilterModule,
    ReactiveFormsModule,
    Card,
    FormField,
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
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly funcionariosService = inject(FuncionariosService);
  private readonly cargosService = inject(CargosService);
  protected readonly blockspace = /^[^\s]+$/;
  protected readonly blockslashandhyphen = /^[^-/]+$/;
  protected readonly numeroMaximoEndereco = NUMERO_MAXIMO_ENDERECO;
  protected readonly cargos = this.cargosService.cargos;
  private readonly cargoOriginalId = signal<number | null>(null);
  protected readonly cargosDisponiveis = computed(() => {
    const originalId = this.cargoOriginalId();
    return this.cargos().filter((cargo) => cargo.ativo || cargo.id === originalId);
  });
  protected readonly loading = this.funcionariosService.loading;
  protected readonly hoje = new Date();
  protected minDataNascimento!: Date;
  protected readonly carregando = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly skeletonCampos = Array.from({ length: 5 });
  private usernameOriginal: string | null = null;
  protected readonly modo = computed<FormState>(() => (this.id() ? 'atualizacao' : 'registro'));
  protected readonly roles = computed<SelectItem<UserRole>[]>(() =>
    this.usersService.roles().map((role) => ({
      label: this.roleLabels[role],
      value: role,
    })),
  );
  protected readonly funcionarioForm = this.fb.nonNullable.group(
    {
      nome: ['', [Validators.required, comprimentoTextoValidator(3, 250)]],
      cpf: ['', [Validators.required, cpfValidator]],
      email: ['', [Validators.required, emailValidator]],
      dataNascimento: this.fb.control<Date | null>(null, [
        Validators.required,
        dataNoIntervaloValidator,
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
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      telefone: ['', [Validators.required, telefoneValidator]],
      cargo: this.fb.control<number | null>(null, [Validators.required]),
      dataAdmissao: this.fb.control<Date | null>(null, [
        Validators.required,
        dataNoIntervaloValidator,
      ]),
      user: this.fb.nonNullable.group({
        id: this.fb.control<number | undefined>(undefined),
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(128)]],
        role: this.fb.nonNullable.control<UserRole>('USER', [Validators.required]),
      }),
    },
    { validators: datasFuncionarioCoerentes },
  );
  protected readonly estados = ESTADOS_BRASIL;

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
    cargo: 'Cargo',
    dataAdmissao: 'Data de admissão',
    'user.username': 'Usuário',
    'user.password': 'Senha',
    'user.role': 'Nível de acesso',
  };

  private readonly roleLabels: Record<UserRole, string> = {
    ADMIN: 'Administrador',
    USER: 'Usuário',
    NO_ACCESS: 'Sem acesso',
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
    this.usersService.getAllRoles().subscribe();
    const id = this.id();

    if (!id) return;

    const passwordControl = this.funcionarioForm.controls.user.controls.password;
    passwordControl.clearValidators();
    passwordControl.updateValueAndValidity();

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
    this.usernameOriginal = funcionario.user.username;
    this.cargoOriginalId.set(funcionario.cargo.id);

    this.funcionarioForm.patchValue({
      nome: funcionario.nome,
      cpf: formatCpf(funcionario.cpf),
      email: funcionario.email,
      dataNascimento: localDateToDate(funcionario.dataNascimento),
      endereco: {
        logradouro: funcionario.endereco.logradouro,
        numero: funcionario.endereco.numero,
        bairro: funcionario.endereco.bairro,
        cidade: funcionario.endereco.cidade,
        estado: funcionario.endereco.estado,
        complemento: funcionario.endereco.complemento ?? '',
      },
      cep: formatCep(funcionario.cep),
      telefone: formatTelefone(funcionario.telefone),
      cargo: funcionario.cargo.id,
      dataAdmissao: localDateToDate(funcionario.dataAdmissao),
      user: {
        id: funcionario.user.id,
        username: funcionario.user.username,
        password: '',
        role: funcionario.user.role ?? 'USER',
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
    return (
      !!control &&
      (control.touched || this.formSubmitted()) &&
      (control.invalid ||
        (controlName === 'dataAdmissao' &&
          this.funcionarioForm.hasError('admissaoAntesNascimento')))
    );
  }

  protected getErrorMessage(controlName: string): string | null {
    const control = this.funcionarioForm.get(controlName);

    if (!this.isInvalid(controlName)) return null;

    const errors = control?.errors;

    if (errors?.['required']) {
      return `${this.labels[controlName]} é obrigatório`;
    }

    if (errors?.['email']) {
      return `${this.labels[controlName]} está no formato incorreto`;
    }

    if (errors?.['cpfInvalido'] || errors?.['telefoneInvalido']) {
      return `Informe um ${this.labels[controlName]} válido`;
    }

    if (errors?.['pattern']) {
      if (controlName === 'cep') {
        return 'Preencha o CEP por completo, no formato 00000-000';
      }
      return `${this.labels[controlName]} é inválido`;
    }

    if (errors?.['minlength']) {
      const { requiredLength } = errors['minlength'];
      return `${this.labels[controlName]} deve ter pelo menos ${requiredLength} caracteres`;
    }

    if (errors?.['maxlength']) {
      const { requiredLength } = errors['maxlength'];
      return `${this.labels[controlName]} deve ter no máximo ${requiredLength} caracteres`;
    }

    if (errors?.['inteiro']) {
      return `${this.labels[controlName]} deve ser um número inteiro`;
    }

    if (errors?.['min']) {
      const { min } = errors['min'];
      return `${this.labels[controlName]} deve ser de no mínimo ${min}`;
    }

    if (errors?.['max']) {
      const { max } = errors['max'];
      return `${this.labels[controlName]} deve ser de no máximo ${Number(max).toLocaleString('pt-BR')}`;
    }

    if (errors?.['dataInvalida']) {
      return 'Informe uma data válida';
    }

    if (errors?.['dataMuitoAntiga']) {
      return `${this.labels[controlName]} não pode ser anterior a 01/01/1900`;
    }

    if (errors?.['dataFutura']) {
      return `${this.labels[controlName]} não pode estar no futuro`;
    }

    if (
      controlName === 'dataAdmissao' &&
      this.funcionarioForm.hasError('admissaoAntesNascimento')
    ) {
      return 'A data de admissão não pode ser anterior à data de nascimento';
    }

    return `${this.labels[controlName]} é inválido`;
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/funcionarios']);
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);
    this.funcionarioForm.markAllAsTouched();

    if (this.funcionarioForm.invalid) {
      this.funcionarioForm.markAllAsDirty();
      return;
    }
    const funcionario = this.fromFormToRequest(this.funcionarioForm);

    const id = this.id();
    const alterouProprioUsername =
      !!id &&
      this.usernameOriginal === this.authService.getUsername() &&
      funcionario.user.username !== this.usernameOriginal;
    const request$ = id
      ? this.funcionariosService.updateFuncionario(Number(id), funcionario!)
      : this.funcionariosService.createFuncionario(funcionario!);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Funcionário atualizado!' : 'Funcionário criado!',
          detail: alterouProprioUsername
            ? 'Seu nome de usuário foi alterado. Entre novamente para continuar.'
            : id
              ? 'As alterações foram salvas com sucesso.'
              : 'O funcionário foi cadastrado com sucesso.',
          life: 3000,
        });

        if (alterouProprioUsername) {
          this.authService.logout();
          return;
        }

        this.voltarParaLista();
      },
    });
  }

  fromFormToRequest(form: FormGroup): FuncionarioRequest {
    const { endereco, user, ...formData } = form.getRawValue();
    const { ...userNormalizado } = user;

    return {
      ...formData,
      nome: (formData.nome ?? '').trim(),
      email: normalizeEmail(formData.email),
      dataNascimento: dateToLocalDate(formData.dataNascimento!),
      cargoId: formData.cargo!,
      dataAdmissao: dateToLocalDate(formData.dataAdmissao!),
      endereco: {
        ...endereco,
        logradouro: (endereco.logradouro ?? '').trim(),
        numero: Number(endereco.numero),
        bairro: (endereco.bairro ?? '').trim(),
        cidade: (endereco.cidade ?? '').trim(),
        estado: endereco.estado!,
        complemento: (endereco.complemento ?? '').trim(),
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
}
