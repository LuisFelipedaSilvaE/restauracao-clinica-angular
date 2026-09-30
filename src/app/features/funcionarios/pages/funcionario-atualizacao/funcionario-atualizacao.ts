import { Component, inject, signal, OnInit } from '@angular/core';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { KeyFilterModule } from 'primeng/keyfilter';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideArrowLeft, LucideUserRoundPlus } from '@lucide/angular';
import { Card } from '../../../../shared/components/card/card';
import { CustomErrorMessage } from '../../../../shared/directives/custom-error-message';
import { MessageModule } from 'primeng/message';
import { FuncionariosService } from '../../services/funcionarios-service';
import { MessageService, SelectItem } from 'primeng/api';
import { CargosService } from '../../../cargos/services/cargos-service';
import { FuncionarioRequest } from '../../interfaces/funcionario-request';
import { Funcionario } from '../../interfaces/funcionario';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-funcionario-atualizacao',
  host: {
    class: 'flex flex-col gap-4',
  },
  imports: [
    FormHeader,
    RouterLink,
    ButtonModule,
    InputTextModule,
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
  templateUrl: './funcionario-atualizacao.html',
  styleUrl: './funcionario-atualizacao.css',
})
export class FuncionarioAtualizacao implements OnInit {
  protected minDataNascimento!: Date;
  protected data!: Funcionario;
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly funcionariosService = inject(FuncionariosService);
  private readonly messageService = inject(MessageService);
  private readonly cargosService = inject(CargosService);
  protected readonly formSubmitted = signal<boolean>(false);
  protected funcionarioForm = this.fb.group({
    nome: ['', []],
    cpf: ['', []],
    cargo: [null, []],
    logradouro: ['', []],
    numero: [''],
    bairro: ['', []],
    cidade: ['', []],
    estado: [null, []],
    cep: ['', []],
    telefone: ['', []],
    email: ['', [Validators.email]],
    dataNascimento: ['', []],
    dataAdmissao: ['', []],
  });
  private readonly labels: Record<string, string> = {
    nome: 'Nome completo',
    cpf: 'CPF',
    email: 'E-mail',
    dataNascimento: 'Data de nascimento',
    telefone: 'Telefone',
    dataAdmissao: 'Data de admissão',
    cargoId: 'Cargo',
    logradouro: 'Logradouro',
    bairro: 'Bairro',
    cidade: 'Cidade',
    estado: 'Estado',
    cep: 'CEP',
  };
  private readonly errors: Record<string, string> = {
    email: 'está mal formulado.',
    required: 'é obrigatório',
  };
  protected readonly header = {
    value: 'Editar funcionário',
    label: 'Atualize os dados cadastrais, informações de contato e permissões do usuário.',
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
    this.getFuncionario();
  }

  getFuncionario(): void {
    const id: number = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isNaN(id)) this.router.navigate(['/funcionarios']);

    this.funcionariosService.getFuncionarioById(id).subscribe({
      next: (res) => {
        console.log(`func`);
        this.data = res!;
        this.populateForm(res!);
      },
    });
  }

  isInvalid(controlName: string): boolean | undefined {
    const control = this.funcionarioForm.get(controlName);
    return control?.invalid && ((control?.touched && control?.dirty) || this.formSubmitted());
  }

  hasError(controlName: string, error: string): boolean | undefined {
    const control = this.funcionarioForm.get(controlName);
    return (
      control?.hasError(error) && ((control?.touched && control?.dirty) || this.formSubmitted())
    );
  }

  getErrorMessage(controlName: string, error?: string): string | null {
    if (!error) {
      error = 'required';
    }

    if (!this.hasError(controlName, error)) return null;

    return `${this.labels[controlName]} ${this.errors[error]}`;
  }

  atualizarFuncionario(): void {
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

    const funcionarioRequest: FuncionarioRequest = {
      nome: formData.nome!,
      cpf: formData.cpf!,
      cargoId: formData.cargo!,
      endereco,
      cep: formData.cep!,
      telefone: formData.telefone!,
      email: formData.email!,
      dataNascimento: new Date(formData.dataNascimento!),
      dataAdmissao: new Date(formData.dataAdmissao!),
    };

    this.funcionariosService.updatefuncionario(this.data.id, funcionarioRequest).subscribe({
      next: () => {
        this.limparCadastro();
        this.messageService.add({
          severity: 'success',
          summary: 'Funcionário Criado!',
          detail: 'Criação do funcionário realizada com sucesso.',
          life: 3000,
        });
      },
    });
  }

  limparCadastro(): void {
    this.formSubmitted.set(false);
    this.funcionarioForm.reset();

    this.router.navigate(['/funcionarios']);
  }

  populateForm(funcionario: Funcionario): void {
    const endereco: string[] = [...funcionario.endereco?.split(/[\,\-\·]/g)!].map((s) => s.trim());
    if (Number.isNaN(Number(endereco[1]))) {
      endereco.splice(1, 0, '');
    }

    const { id, ...requestForm } = funcionario;
    let formData: Record<string, any> = { ...requestForm };

    formData = {
      ...formData,
      cargo: funcionario.cargo?.id,
      logradouro: endereco[0],
      numero: endereco[1],
      bairro: endereco[2],
      cidade: endereco[3],
      estado: endereco[4],
    };

    this.funcionarioForm.patchValue(formData);
  }
}
