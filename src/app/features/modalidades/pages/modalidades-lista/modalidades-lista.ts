import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  LucideDoorOpen,
  LucideFolderX,
  LucideLayers,
  LucideLayoutGrid,
  LucidePlus,
  LucideUsersRound,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { ModalidadeCardContent } from '../../interfaces/modalidade-card-content';
import { ModalidadeCard } from '../../components/modalidade-card/modalidade-card';
import { ToggleModalidadeDto } from '../../interfaces/toggle-modalidade-dto';
import { ModalidadeDialog } from '../../components/modalidade-dialog/modalidade-dialog';
import { Modalidade } from '../../interfaces/modalidade';
import { ModalidadesService } from '../../services/modalidades-service';
import { MessageService } from 'primeng/api';
import { IconColor } from '../../../../shared/directives/icon-color';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { SkeletonModule } from 'primeng/skeleton';

type DialogType = 'registro' | 'atualizacao';

@Component({
  selector: 'app-modalidades-lista',
  host: {
    class: 'flex gap-8 flex-col',
  },
  imports: [
    ButtonModule,
    LucidePlus,
    LucideFolderX,
    InfoCard,
    ModalidadeCard,
    ModalidadeDialog,
    IconColor,
    ConfirmDialog,
    SkeletonModule,
  ],
  templateUrl: './modalidades-lista.html',
  styleUrl: './modalidades-lista.css',
})
export class ModalidadesLista implements OnInit {
  private readonly modalidadesService = inject(ModalidadesService);
  private readonly messageService = inject(MessageService);

  protected readonly modalidades = computed<ModalidadeCardContent[]>(() => {
    return this.modalidadesService.modalidades().map((modalidade) => {
      return { ...modalidade, acolhidosAtivos: 10 };
    });
  });

  protected readonly infoModalidades = computed<InfoCardContent[]>(() => {
    const lista = this.modalidades();
    const vagasTotais = lista.reduce((acc, m) => acc + m.maxVagas, 0);
    const vagasOcupadas = lista.reduce((acc, m) => acc + m.acolhidosAtivos, 0);

    return [
      {
        value: lista.length,
        label: 'Modalidades',
        icon: LucideLayoutGrid,
        color: '#e7000b',
      },
      {
        value: vagasTotais,
        label: 'Vagas totais',
        icon: LucideLayers,
        color: '#0084d1',
      },
      {
        value: vagasOcupadas,
        label: 'Vagas ocupadas',
        icon: LucideUsersRound,
        color: '#e17100',
      },
      {
        value: vagasTotais - vagasOcupadas,
        label: 'Vagas disponíveis',
        icon: LucideDoorOpen,
        color: '#00a63e',
      },
    ];
  });

  protected readonly modalidadeParaAtualizar = signal<Modalidade | null>(null);
  protected readonly dialogVisible = signal<boolean>(false);
  protected readonly dialogConfirmVisible = signal<boolean>(false);
  protected readonly dialogType = signal<DialogType>('registro');
  protected readonly acaoPendente = signal<ToggleModalidadeDto | null>(null);
  protected readonly loading = this.modalidadesService.loading;
  protected readonly skeletonCards = Array.from({ length: 6 });

  showDialog(type: DialogType): void {
    this.dialogVisible.set(true);
    this.dialogType.set(type);
  }

  closeDialog(state: boolean): void {
    this.dialogVisible.set(state);
    this.modalidadeParaAtualizar.set(null);
  }

  closeConfirmDialog(state: boolean): void {
    this.dialogConfirmVisible.set(state);
  }

  limparAcaoPendente(): void {
    this.acaoPendente.set(null);
  }

  protected readonly confirmTitle = computed(() => {
    return this.acaoPendente()?.ativo ? 'Ativar modalidade' : 'Desativar modalidade';
  });

  protected readonly confirmMessage = computed(() => {
    return this.acaoPendente()?.ativo
      ? 'Deseja ativar esta modalidade? Ela voltará a ficar disponível.'
      : 'Deseja desativar esta modalidade? Ela deixará de ficar disponível.';
  });

  protected readonly confirmLabel = computed(() => {
    return this.acaoPendente()?.ativo ? 'Ativar' : 'Desativar';
  });

  protected readonly confirmSeverity = computed<'success' | 'danger'>(() => {
    return this.acaoPendente()?.ativo ? 'success' : 'danger';
  });

  confirmarAlteracaoStatus(): void {
    const dto = this.acaoPendente();

    if (!dto) return;

    const acao$ = dto.ativo
      ? this.modalidadesService.activateModalidade(dto.id)
      : this.modalidadesService.deactivateModalidade(dto.id);

    acao$.subscribe({
      next: () => this.closeConfirmDialog(false),
      error: () => {},
    });
  }

  editarModalidade(modalidade: Modalidade) {
    this.modalidadeParaAtualizar.set(modalidade);
    this.showDialog('atualizacao');
  }

  toggleModalidade(dto: ToggleModalidadeDto): void {
    this.acaoPendente.set(dto);
    this.dialogConfirmVisible.set(true);
  }

  ngOnInit(): void {
    this.modalidadesService.getAllModalidades().subscribe({
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao carregar modalidades',
          detail: err?.error?.message ?? 'Não foi possível carregar as modalidades.',
          life: 3000,
        });
      },
    });
  }
}
