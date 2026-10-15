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
import { ConvenioCardContent } from '../../interfaces/convenio-card-content';
import { ConvenioCard } from '../../components/convenio-card/convenio-card';
import { ToggleConvenioDto } from '../../interfaces/toggle-convenio-dto';
import { ConveniosService } from '../../services/convenios-service';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-convenios-lista',
  host: {
    class: 'flex gap-8 flex-col',
  },
  imports: [
    ButtonModule,
    LucidePlus,
    InfoCard,
    ConvenioCard,
    EmptyList,
    ConfirmDialog,
    SkeletonModule,
    RouterLink,
  ],
  templateUrl: './convenios-lista.html',
  styleUrl: './convenios-lista.css',
})
export class ConveniosLista implements OnInit {
  protected readonly emptyConveniosIcon = LucideFolderX;
  private readonly conveniosService = inject(ConveniosService);

  protected readonly convenios = computed<ConvenioCardContent[]>(() => {
    return this.conveniosService.convenios().map((convenio) => {
      return { ...convenio, acolhidosAtivos: Math.min(10, convenio.maxVagas) };
    });
  });

  protected readonly infoConvenios = computed<InfoCardContent[]>(() => {
    const lista = this.convenios();
    const vagasTotais = lista.reduce((acc, m) => (m.ativo ? acc + m.maxVagas : acc), 0);
    const vagasOcupadas = lista.reduce((acc, m) => (m.ativo ? acc + m.acolhidosAtivos : acc), 0);

    return [
      {
        value: lista.length,
        label: 'Convênios',
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
  protected readonly acaoPendente = signal<ToggleConvenioDto | null>(null);
  protected readonly loading = this.conveniosService.loading;
  protected readonly skeletonCards = Array.from({ length: 6 });

  protected readonly confirmTitle = computed(() => {
    return this.acaoPendente()?.ativo ? 'Ativar convênio' : 'Desativar convênio';
  });

  protected readonly confirmMessage = computed(() => {
    return this.acaoPendente()?.ativo
      ? 'Deseja ativar este convênio? Ele voltará a ficar disponível.'
      : 'Deseja desativar este convênio? Ele deixará de ficar disponível.';
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
      ? this.conveniosService.activateConvenio(dto.id)
      : this.conveniosService.deactivateConvenio(dto.id);

    acao$.subscribe({
      next: () => this.dialogConfirmVisible.set(false),
    });
  }

  toggleConvenio(dto: ToggleConvenioDto): void {
    this.acaoPendente.set(dto);
    this.dialogConfirmVisible.set(true);
  }

  ngOnInit(): void {
    this.conveniosService.getAllConvenios().subscribe();
  }
}
