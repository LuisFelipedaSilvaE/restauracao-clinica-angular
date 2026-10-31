import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LucideLayers } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { ColorPickerModule } from 'primeng/colorpicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

import { Card } from '../../../../shared/components/card/card';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { ConvenioCard } from '../../components/convenio-card/convenio-card';
import { ConveniosService } from '../../services/convenios-service';
import { Convenio } from '../../interfaces/convenio';
import { ConvenioRequest } from '../../interfaces/convenio-request';
import { ConvenioCardContent } from '../../interfaces/convenio-card-content';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { cnpjValidator } from '../../../../shared/validators/cnpj-validator';
import { integerValidator } from '../../../../shared/validators/integer-validator';
import { FormField } from '../../../../shared/components/form-field/form-field';

@Component({
  selector: 'app-convenio-form',
  host: {
    class: 'flex flex-col gap-6',
  },
  imports: [
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    InputNumberModule,
    ColorPickerModule,
    SelectButtonModule,
    SkeletonModule,
    ReactiveFormsModule,
    Card,
    FormHeader,
    ConvenioCard,
    FormField,
  ],
  templateUrl: './convenio-form.html',
  styleUrl: './convenio-form.css',
})
export class ConvenioForm implements OnInit {
  readonly id = input<string>();

  protected readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly conveniosService = inject(ConveniosService);

  protected readonly loading = this.conveniosService.loading;
  protected readonly carregando = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly skeletonCampos = Array.from({ length: 5 });
  protected readonly maximoVagas = 2_147_483_647;

  protected readonly modo = computed<FormState>(() => (this.id() ? 'atualizacao' : 'registro'));

  protected readonly convenioForm = this.fb.group({
    descricao: [
      '',
      [
        Validators.required,
        Validators.pattern(/.*\S.*/),
        Validators.minLength(3),
        Validators.maxLength(200),
      ],
    ],
    cnpj: ['', [cnpjValidator]],
    maxVagas: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(this.maximoVagas), integerValidator],
    ],
    pagamento: [true, [Validators.required]],
    cor: ['#3b82f6', [Validators.required]],
  });

  private readonly labels: Record<string, string> = {
    descricao: 'Nome do convênio',
    maxVagas: 'Quantidade de vagas',
    pagamento: 'Pagamento obrigatório',
    cor: 'Cor de identificação',
  };

  protected readonly pagamentoOptions = [
    { label: 'Sim', value: true },
    { label: 'Não', value: false },
  ];

  protected readonly headerInfo = computed<InfoCardContent>(() => {
    const registro = this.modo() === 'registro';

    return {
      value: registro ? 'Novo convênio' : 'Editar convênio',
      label: registro
        ? 'Cadastre um convênio de acolhimento e defina sua capacidade.'
        : 'Atualize os dados e a capacidade de vagas deste convênio.',
      icon: LucideLayers,
      color: '#be222d',
    };
  });

  protected readonly actionBtnLabel = computed(() =>
    this.modo() === 'registro' ? 'Criar convênio' : 'Salvar alterações',
  );

  protected readonly convenioPreview = toSignal<ConvenioCardContent>(
    this.convenioForm.valueChanges.pipe(
      startWith(this.convenioForm.value),
      map((formValue) => {
        const maxVagas = Number(formValue.maxVagas ?? 0);

        return {
          id: 0,
          descricao: formValue.descricao ?? '',
          cnpj: formValue.cnpj?.trim() || null,
          maxVagas,
          ativo: true,
          pagamento: formValue.pagamento ?? true,
          cor: formValue.cor ?? '',
          acolhidosAtivos: this.modo() === 'registro' ? Math.floor(maxVagas / 2) : 0,
        };
      }),
    ),
  );

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    const idNumerico = Number(id);

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      this.voltarParaLista();
      return;
    }

    this.carregando.set(true);

    this.conveniosService
      .getAllConvenios()
      .pipe(map((lista) => lista.find((convenio) => convenio.id === idNumerico)))
      .subscribe({
        next: (convenio) => {
          this.carregando.set(false);

          if (!convenio) {
            this.convenioNaoEncontrado();
            return;
          }

          this.preencherFormulario(convenio);
        },
        error: () => {
          this.carregando.set(false);
          this.voltarParaLista();
        },
      });
  }

  private preencherFormulario(convenio: Convenio): void {
    this.convenioForm.patchValue({
      descricao: convenio.descricao,
      cnpj: this.formatarCnpj(convenio.cnpj),
      maxVagas: convenio.maxVagas,
      pagamento: convenio.pagamento,
      cor: convenio.cor || '#3b82f6',
    });
  }

  private formatarCnpj(cnpj: string | null): string {
    if (!cnpj) return '';

    const valor = cnpj.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (valor.length !== 14) return valor;

    return `${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5, 8)}/${valor.slice(8, 12)}-${valor.slice(12)}`;
  }

  private convenioNaoEncontrado(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Convênio não encontrado',
      detail: 'O registro solicitado não existe ou foi removido.',
      life: 4000,
    });

    this.voltarParaLista();
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.convenioForm.get(controlName);
    return !!control?.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(controlName: string): string | null {
    const control = this.convenioForm.get(controlName);

    if (!this.isInvalid(controlName) || !control?.errors) return null;

    if (control.errors['required']) {
      return `${this.labels[controlName]} é obrigatório`;
    }

    if (control.errors['pattern']) {
      return `${this.labels[controlName]} não pode conter apenas espaços`;
    }

    if (control.errors['minlength']) {
      const { requiredLength } = control.errors['minlength'];
      return `${this.labels[controlName]} deve ter pelo menos ${requiredLength} caracteres`;
    }

    if (control.errors['maxlength']) {
      const { requiredLength } = control.errors['maxlength'];
      return `${this.labels[controlName]} deve ter no máximo ${requiredLength} caracteres`;
    }

    if (control.errors['cnpjInvalido']) {
      return 'Informe um CNPJ válido';
    }

    if (control.errors['min']) {
      const { min } = control.errors['min'];
      return `${this.labels[controlName]} deve ser de no mínimo ${min}`;
    }

    if (control.errors['max']) {
      return `${this.labels[controlName]} deve ser de no máximo ${this.maximoVagas.toLocaleString('pt-BR')}`;
    }

    if (control.errors['inteiro']) {
      return `${this.labels[controlName]} deve ser um número inteiro`;
    }

    return `${this.labels[controlName]} é inválido`;
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/convenios']);
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.convenioForm.invalid) return;

    const cnpj = this.convenioForm.controls.cnpj.value?.trim().toUpperCase();
    const data: ConvenioRequest = {
      descricao: this.convenioForm.controls.descricao.value ?? '',
      cnpj: cnpj || null,
      maxVagas: Number(this.convenioForm.controls.maxVagas.value),
      pagamento: this.convenioForm.controls.pagamento.value ?? true,
      cor: this.convenioForm.controls.cor.value ?? '',
    };

    const id = this.id();
    const request$ = id
      ? this.conveniosService.updateConvenio(Number(id), data)
      : this.conveniosService.createConvenio(data);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Convênio atualizado!' : 'Convênio criado!',
          detail: id
            ? 'As alterações foram salvas com sucesso.'
            : 'O convênio foi cadastrado com sucesso.',
          life: 3000,
        });

        this.voltarParaLista();
      },
      error: () => {},
    });
  }
}
