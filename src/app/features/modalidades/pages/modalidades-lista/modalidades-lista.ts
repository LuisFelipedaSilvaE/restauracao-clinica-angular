import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
import { ModalidadesService } from '../../services/modalidades-service';
import { IconColor } from '../../../../shared/directives/icon-color';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { SkeletonModule } from 'primeng/skeleton';

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
    IconColor,
    ConfirmDialog,
    SkeletonModule,
    RouterLink,
  ],
  templateUrl: './modalidades-lista.html',
  styleUrl: './modalidades-lista.css',
})
export class ModalidadesLista implements OnInit {
  private readonly modalidadesService = inject(ModalidadesService);

  protected readonly modalidades = computed<ModalidadeCardContent[]>(() => {
    return this.modalidadesService.modalidades().map((modalidade) => {
      return { ...modalidade, acolhidosAtivos: Math.min(10, modalidade.maxVagas) };
    });
  });

  protected readonly infoModalidades = computed<InfoCardContent[]>(() => {
    const lista = this.modalidades();
    const vagasTotais = lista.reduce((acc, m) => (m.ativo ? acc + m.maxVagas : acc), 0);
    const vagasOcupadas = lista.reduce((acc, m) => (m.ativo ? acc + m.acolhidosAtivos : acc), 0);

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

  protected readonly dialogConfirmVisible = signal<boolean>(false);
  protected readonly acaoPendente = signal<ToggleModalidadeDto | null>(null);
  protected readonly loading = this.modalidadesService.loading;
  protected readonly skeletonCards = Array.from({ length: 6 });

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
      next: () => this.dialogConfirmVisible.set(false),
    });
  }

  toggleModalidade(dto: ToggleModalidadeDto): void {
    this.acaoPendente.set(dto);
    this.dialogConfirmVisible.set(true);
  }

  ngOnInit(): void {
    this.modalidadesService.getAllModalidades().subscribe();
  }
}
