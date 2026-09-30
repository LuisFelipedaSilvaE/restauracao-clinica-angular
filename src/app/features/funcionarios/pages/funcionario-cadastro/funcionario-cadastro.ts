import { Component, inject, OnInit, signal } from '@angular/core';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { LucideArrowLeft, LucideUserRoundPlus } from '@lucide/angular';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Card } from '../../../../shared/components/card/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select';
import { CargosService } from '../../../cargos/services/cargos-service';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MessageService, SelectItem } from 'primeng/api';
import { CustomErrorMessage } from '../../../../shared/directives/custom-error-message';
import { MessageModule } from 'primeng/message';
import { FuncionarioRequest } from '../../interfaces/funcionario-request';
import { FuncionariosService } from '../../services/funcionarios-service';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-funcionario-cadastro',
  host: {
    class: 'flex flex-col gap-4',
  },
  imports: [
    FormHeader,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    InputMaskModule,
    DatePickerModule,
    SelectModule,
    KeyFilterModule,
    ReactiveFormsModule,
    LucideArrowLeft,
    FormHeader,
    Card,
    CustomErrorMessage,
    MessageModule,
    DividerModule,
  ],
  templateUrl: './funcionario-cadastro.html',
  styleUrl: './funcionario-cadastro.css',
})
export class FuncionarioCadastro implements OnInit {
  protected minDataNascimento!: Date;
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly funcionariosService = inject(FuncionariosService);
  private readonly messageService = inject(MessageService);
  private readonly cargosService = inject(CargosService);
  protected readonly formSubmitted = signal<boolean>(false);
  protected readonly blockspace = /^[^\s]+$/;
  protected funcionarioForm = this.fb.group({
    criarUsuario: [false],
    nome: ['', [Validators.required]],
    cpf: ['', [Validators.required]],
    logradouro: ['', [Validators.required]],
    numero: [''],
    bairro: ['', [Validators.required]],
    cidade: ['', [Validators.required]],
    estado: [null, [Validators.required]],
    cep: ['', [Validators.required]],
    telefone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    dataNascimento: ['', [Validators.required]],
    dataAdmissao: ['', [Validators.required]],
    usuario: this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.maxLength(128)]],
      cargo: [null, [Validators.required]],
    }),
  });
  protected readonly passwordInputPt = {
    pcInputText: { root: { class: 'placeholder:tracking-widest' } },
  };
  private readonly labels: Record<string, any> = {
    nome: 'Nome completo',
    cpf: 'CPF',
    email: 'E-mail',
    dataNascimento: 'Data de nascimento',
    telefone: 'Telefone',
    dataAdmissao: 'Data de admissão',
    logradouro: 'Logradouro',
    bairro: 'Bairro',
    cidade: 'Cidade',
    estado: 'Estado',
    cep: 'CEP',
    'usuario.username': 'Usuário',
    'usuario.password': 'Senha',
    'usuario.cargo': 'Cargo',
  };
  private readonly errors: Record<string, string> = {
    email: 'está mal formulado.',
    required: 'é obrigatório',
  };
  protected readonly header = {
    value: 'Novo funcionário',
    label: 'Cadastre um novo funcionário da plataforma e defina seu cargo.',
    icon: LucideUserRoundPlus,
    color: '#be222d',
  };
  protected readonly cargos = this.cargosService.cargos;
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

  ngOnInit(): void {
    const hoje = new Date();
    hoje.setFullYear(hoje.getFullYear() - 18);
    this.minDataNascimento = new Date(hoje);

    this.cargosService.getAllCargos();
  }

  isInvalid(controlName: string): boolean | undefined {
    const control = this.funcionarioForm.get(controlName);
    return control?.invalid && (control?.touched || this.formSubmitted());
  }

  hasError(controlName: string, error: string): boolean | undefined {
    const control = this.funcionarioForm.get(controlName);
    return control?.hasError(error) && (control?.touched || this.formSubmitted());
  }

  getErrorMessage(controlName: string, error?: string): string | null {
    if (!error) {
      error = 'required';
    }

    if (!this.hasError(controlName, error)) return null;

    return `${this.labels[controlName]} ${this.errors[error]}`;
  }

  cadastrarFuncionario(): void {
    this.formSubmitted.set(true);
    this.funcionarioForm.markAllAsDirty();

    if (this.funcionarioForm.invalid) return;
    let formData = this.funcionarioForm.getRawValue();

    if (formData.logradouro?.toLocaleLowerCase().split(' ').includes('rua')) {
      const logradouroLista: string[] = formData.logradouro?.split(' ');
      const indiceRua: number = logradouroLista.map((p) => p.toLocaleLowerCase()).indexOf('rua');
      logradouroLista.splice(indiceRua, 1);
      formData.logradouro = logradouroLista.join(' ');
    }
    const endereco: string =
      this.funcionarioForm.get('numero')?.value !== ''
        ? `Rua ${formData.logradouro}, ${formData.numero} · ${formData.bairro} · ${formData.cidade} - ${formData.estado}`
        : `Rua ${formData.logradouro} · ${formData.bairro} · ${formData.cidade} - ${formData.estado}`;

    const funcionario: FuncionarioRequest = {
      nome: formData.nome!,
      cpf: formData.cpf!,
      cargoId: formData.usuario.cargo!,
      endereco,
      cep: formData.cep!,
      telefone: formData.telefone!,
      email: formData.email!,
      dataNascimento: new Date(formData.dataNascimento!),
      dataAdmissao: new Date(formData.dataAdmissao!),
    };

    // this.funcionariosService.createFuncionario(funcionario).subscribe({
    //   next: () => {
    //     this.limparCadastro();
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Funcionário Criado!',
    //       detail: 'Criação do funcionário realizada com sucesso.',
    //       life: 3000,
    //     });
    //   },
    // });
  }

  limparCadastro(): void {
    this.formSubmitted.set(false);
    this.funcionarioForm.reset();

    this.router.navigate(['/funcionarios']);
  }
}
