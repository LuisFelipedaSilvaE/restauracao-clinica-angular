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
import { Modalidade } from '../../interfaces/modalidade';

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
    LucideCheck,
  ],
  templateUrl: './modalidade-dialog.html',
  styleUrl: './modalidade-dialog.css',
})
export class ModalidadeDialog {
  readonly visible = input.required<boolean>();
  readonly type = input.required<string>();
  readonly modalidade = input<Modalidade | null>();
  readonly visibleChange = output<boolean>();
  protected readonly fb = inject(FormBuilder);
  protected readonly modalidadeForm = this.fb.group({
    descricao: ['', [Validators.required]],
    cnpj: ['', [Validators.required]],
    vagasMaximas: ['', [Validators.required]],
    corIdentificacao: ['', [Validators.required]],
  });
  protected readonly formSubmitted = signal<boolean>(false);
  protected readonly requestActive = signal<boolean>(false);
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
    cnpj: 'CNPJ',
    vagasMaximas: 'Quantidade de Vagas',
    corIdentificacao: 'Cor de Identificação',
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
        cnpj: formValue.cnpj ?? '',
        vagasMaximas: Number(formValue.vagasMaximas ?? 0),
        corIdentificacao: formValue.corIdentificacao ?? '',
        acolhidosAtivos: 0,
        ativa: true,
        id: 0,
      })),
    ),
  );

  constructor() {
    effect(() => {
      const data = this.modalidade();

      if (data) {
        this.modalidadeForm.patchValue({
          descricao: data.descricao,
          cnpj: data.cnpj,
          vagasMaximas: data.vagasMaximas.toString(),
          corIdentificacao: data.corIdentificacao,
        });
      } else {
        this.modalidadeForm.reset();
      }
    });
  }

  isInvalid(controlName: string) {
    const control = this.modalidadeForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted());
  }

  getErrorMessage(controlName: string): string | null {
    if (!this.isInvalid(controlName)) return null;

    return `${this.labels[controlName]} é obrigatório`;
  }

  private toggleFormAndRequest(): void {
    this.formSubmitted.update((value) => !value);
    this.requestActive.update((value) => !value);
  }
}
