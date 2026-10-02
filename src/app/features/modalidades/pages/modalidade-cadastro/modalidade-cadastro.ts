import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LucideArrowLeft, LucideLayers } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { ColorPickerModule } from 'primeng/colorpicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

import { Card } from '../../../../shared/components/card/card';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { ModalidadeCard } from '../../components/modalidade-card/modalidade-card';
import { ModalidadesService } from '../../services/modalidades-service';
import { Modalidade } from '../../interfaces/modalidade';
import { ModalidadeRequest } from '../../interfaces/modalidade-request';
import { ModalidadeCardContent } from '../../interfaces/modalidade-card-content';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { cnpjValidator } from '../../../../shared/validators/cnpj-validator';

type ModoForm = 'registro' | 'atualizacao';

@Component({
  selector: 'app-modalidade-cadastro',
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
    MessageModule,
    SkeletonModule,
    ReactiveFormsModule,
    Card,
    FormHeader,
    ModalidadeCard,
    LucideArrowLeft,
    RouterLink
  ],
  templateUrl: './modalidade-cadastro.html',
  styleUrl: './modalidade-cadastro.css',
})
export class ModalidadeCadastro implements OnInit {
  readonly id = input<string>();

  protected readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly modalidadesService = inject(ModalidadesService);

  protected readonly loading = this.modalidadesService.loading;
  protected readonly carregando = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly skeletonCampos = Array.from({ length: 5 });

  protected readonly modo = computed<ModoForm>(() => (this.id() ? 'atualizacao' : 'registro'));

  protected readonly modalidadeForm = this.fb.group({
    descricao: [
      '',
      [Validators.required, Validators.pattern(/.*\S.*/), Validators.minLength(3), Validators.maxLength(200)],
    ],
    cnpj: ['', [cnpjValidator]],
    maxVagas: [null as number | null, [Validators.required, Validators.min(0)]],
    pagamento: [true, [Validators.required]],
    cor: ['#3b82f6', [Validators.required]],
  });

  private readonly labels: Record<string, string> = {
    descricao: 'Nome da modalidade',
    maxVagas: 'Quantidade de vagas',
    pagamento: 'Pagamento obrigatório',
    cor: 'Cor de identificação',
  };

  protected readonly messagePt = {
    contentWrapper: {
      class: 'pl-2 rounded-sm border-l-4 border-status-error-border-strong',
    },
  };

  protected readonly pagamentoOptions = [
    { label: 'Sim', value: true },
    { label: 'Não', value: false },
  ];

  protected readonly headerInfo = computed<InfoCardContent>(() => {
    const registro = this.modo() === 'registro';

    return {
      value: registro ? 'Nova modalidade' : 'Editar modalidade',
      label: registro
        ? 'Cadastre uma modalidade de acolhimento e defina sua capacidade.'
        : 'Atualize os dados e a capacidade de vagas desta modalidade.',
      icon: LucideLayers,
      color: '#be222d',
    };
  });

  protected readonly actionBtnLabel = computed(() =>
    this.modo() === 'registro' ? 'Criar modalidade' : 'Salvar alterações',
  );

  protected readonly modalidadePreview = toSignal<ModalidadeCardContent>(
    this.modalidadeForm.valueChanges.pipe(
      startWith(this.modalidadeForm.value),
      map((formValue) => ({
        id: 0,
        descricao: formValue.descricao ?? '',
        cnpj: formValue.cnpj?.trim() || null,
        maxVagas: Number(formValue.maxVagas ?? 1),
        ativo: true,
        pagamento: formValue.pagamento ?? true,
        cor: formValue.cor ?? '',
        acolhidosAtivos: 0,
      })),
    ),
  );

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    const idNumerico = Number(id);

    if (Number.isNaN(idNumerico)) {
      this.voltarParaLista();
      return;
    }

    this.carregando.set(true);

    this.modalidadesService
      .getAllModalidades()
      .pipe(map((lista) => lista.find((modalidade) => modalidade.id === idNumerico)))
      .subscribe({
        next: (modalidade) => {
          this.carregando.set(false);

          if (!modalidade) {
            this.modalidadeNaoEncontrada();
            return;
          }

          this.preencherFormulario(modalidade);
        },
        error: () => {
          this.carregando.set(false);
          this.voltarParaLista();
        },
      });
  }

  private preencherFormulario(modalidade: Modalidade): void {
    this.modalidadeForm.patchValue({
      descricao: modalidade.descricao,
      cnpj: this.formatarCnpj(modalidade.cnpj),
      maxVagas: modalidade.maxVagas,
      pagamento: modalidade.pagamento,
      cor: modalidade.cor || '#3b82f6',
    });
  }

  private formatarCnpj(cnpj: string | null): string {
    if (!cnpj) return '';

    const valor = cnpj.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (valor.length !== 14) return valor;

    return `${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5, 8)}/${valor.slice(8, 12)}-${valor.slice(12)}`;
  }

  private modalidadeNaoEncontrada(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Modalidade não encontrada',
      detail: 'O registro solicitado não existe ou foi removido.',
      life: 4000,
    });

    this.voltarParaLista();
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.modalidadeForm.get(controlName);
    return !!control?.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(controlName: string): string | null {
    const control = this.modalidadeForm.get(controlName);

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

    return `${this.labels[controlName]} é inválido`;
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/modalidades']);
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.modalidadeForm.invalid) return;

    const cnpj = this.modalidadeForm.controls.cnpj.value?.trim().toUpperCase();
    const data: ModalidadeRequest = {
      descricao: this.modalidadeForm.controls.descricao.value ?? '',
      cnpj: cnpj || null,
      maxVagas: Number(this.modalidadeForm.controls.maxVagas.value),
      pagamento: this.modalidadeForm.controls.pagamento.value ?? true,
      cor: this.modalidadeForm.controls.cor.value ?? '',
    };

    const id = this.id();
    const request$ = id
      ? this.modalidadesService.updateModalidade(Number(id), data)
      : this.modalidadesService.createModalidade(data);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Modalidade atualizada!' : 'Modalidade criada!',
          detail: id
            ? 'As alterações foram salvas com sucesso.'
            : 'A modalidade foi cadastrada com sucesso.',
          life: 3000,
        });

        this.voltarParaLista();
      },
      error: () => {},
    });
  }
}
