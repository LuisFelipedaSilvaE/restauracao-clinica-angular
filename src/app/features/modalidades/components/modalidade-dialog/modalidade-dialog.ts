import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { ModalidadeCardContent } from '../../interfaces/modalidade-card-content';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideLayers, LucideCheck } from '@lucide/angular';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ModalidadeCard } from '../modalidade-card/modalidade-card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Modalidade } from '../../interfaces/modalidade';
import { ModalidadeRequest } from '../../interfaces/modalidade-request';
import { ModalidadesService } from '../../services/modalidades-service';
import { MessageService } from 'primeng/api';
import { cnpjValidator } from '../../../../shared/validators/cnpj-validator';

type DialogType = 'registro' | 'atualizacao';

@Component({
  selector: 'modalidade-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    InfoCard,
    InputMaskModule,
    InputTextModule,
    InputNumberModule,
    ColorPickerModule,
    ModalidadeCard,
    SkeletonModule,
    MessageModule,
    SelectButtonModule,
    LucideCheck,
  ],
  templateUrl: './modalidade-dialog.html',
  styleUrl: './modalidade-dialog.css',
})
export class ModalidadeDialog {
  protected readonly fb = inject(FormBuilder);
  private readonly modalidadesService = inject(ModalidadesService);
  private readonly messageService = inject(MessageService);

  readonly visible = input.required<boolean>();
  readonly type = input.required<DialogType>();
  readonly modalidade = input<Modalidade | null>();
  readonly visibleChange = output<boolean>();
  protected readonly loading = this.modalidadesService.loading;

  protected readonly pagamentoOptions = [
    { label: 'Sim', value: true },
    { label: 'Não', value: false },
  ];

  protected readonly modalidadeForm = this.fb.group({
    descricao: ['', [Validators.required]],
    cnpj: ['', [cnpjValidator]],
    maxVagas: ['', [Validators.required]],
    pagamento: [true, [Validators.required]],
    cor: ['', [Validators.required]],
  });

  protected readonly formSubmitted = signal<boolean>(false);

  protected readonly dialogPt = {
    root: {
      class: 'min-w-md',
    },
    header: {
      class: 'bg-brand-primary/5',
    },
  };

  protected readonly messagePt = {
    contentWrapper: {
      class: 'pl-2 rounded-sm border-l-4 border-status-error-border-strong',
    },
  };

  private readonly labels: Record<string, string> = {
    descricao: 'Descrição',
    maxVagas: 'Quantidade de Vagas',
    pagamento: 'Pagamento Obrigatório',
    cor: 'Cor de Identificação',
  };

  protected readonly headerInfo = computed<InfoCardContent>(() => {
    const type = this.type();

    const config: Record<string, Record<string, string>> = {
      registro: {
        value: 'Nova Modalidade',
        label: 'Defina o nome a quantidade de vagas.',
      },
      atualizacao: {
        value: 'Editar Modalidade',
        label: 'Atualize os dados e a capacidade de vagas.',
      },
    };

    const safeConfig = config[type] ?? config['registro'];

    return {
      value: safeConfig['value'],
      label: safeConfig['label'],
      icon: LucideLayers,
      color: '#be222d',
    };
  });

  protected readonly actionBtnLabel = computed(() => {
    const config: Record<string, string> = {
      registro: 'Criar modalidade',
      atualizacao: 'Salvar alterações',
    };

    const safeConfig = config[this.type()] ?? config['registro'];

    return safeConfig;
  });

  protected readonly modalidadePreview = toSignal<ModalidadeCardContent>(
    this.modalidadeForm.valueChanges.pipe(
      startWith(this.modalidadeForm.value),
      map((formValue) => ({
        descricao: formValue.descricao ?? '',
        cnpj: formValue.cnpj?.trim() || null,
        maxVagas: Number(formValue.maxVagas ?? 0),
        cor: formValue.cor ?? '',
        acolhidosAtivos: 0,
        ativo: true,
        pagamento: formValue.pagamento ?? true,
        id: 0,
      })),
    ),
  );

  constructor() {
    effect(() => {
      if (!this.visible()) return;

      const data = this.modalidade();
      this.formSubmitted.set(false);

      if (data) {
        this.modalidadeForm.patchValue({
          descricao: data.descricao,
          cnpj: this.formatarCnpj(data.cnpj),
          maxVagas: data.maxVagas.toString(),
          pagamento: data.pagamento,
          cor: data.cor,
        });
      } else {
        this.modalidadeForm.reset({
          pagamento: true,
        });
      }
    });
  }

  private formatarCnpj(cnpj: string | null): string {
    if (!cnpj) return '';

    const valor = cnpj.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (valor.length !== 14) return valor;

    return `${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5, 8)}/${valor.slice(8, 12)}-${valor.slice(12)}`;
  }

  isInvalid(controlName: string) {
    const control = this.modalidadeForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted());
  }

  getErrorMessage(controlName: string): string | null {
    if (!this.isInvalid(controlName)) return null;

    if (controlName === 'cnpj') {
      return 'Informe um CNPJ válido';
    }

    return `${this.labels[controlName]} é obrigatório`;
  }

  onSubmit(): void {
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

    if (this.type() === 'registro') {
      this.modalidadesService.createModalidade(data).subscribe({
        next: () => {
          this.visibleChange.emit(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Modalidade Criada!',
            detail: 'Criação da modalidade realizada com sucesso.',
            life: 3000,
          });
        },
        error: () => {},
      });

      return;
    }
    const id = this.modalidade()?.id;

    if (id === undefined) return;

    this.modalidadesService.updateModalidade(id, data).subscribe({
      next: () => {
        this.visibleChange.emit(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Modalidade Atualizada!',
          detail: 'Atualização da modalidade realizada com sucesso.',
          life: 3000,
        });
      },
      error: () => {},
    });
  }
}
