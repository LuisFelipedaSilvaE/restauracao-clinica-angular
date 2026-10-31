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
import { MessageService } from 'primeng/api';

type AcaoPendente =
  { tipo: 'status'; dados: ToggleConvenioDto } | { tipo: 'exclusao'; id: number; nome: string };

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
  private readonly messageService = inject(MessageService);

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
  protected readonly acaoPendente = signal<AcaoPendente | null>(null);
  protected readonly loading = this.conveniosService.loading;
  protected readonly skeletonCards = Array.from({ length: 6 });

  protected readonly confirmTitle = computed(() => {
    const acao = this.acaoPendente();
    if (acao?.tipo === 'exclusao') return 'Excluir convênio';
    return acao?.dados.ativo ? 'Ativar convênio' : 'Desativar convênio';
  });

  protected readonly confirmMessage = computed(() => {
    const acao = this.acaoPendente();
    if (acao?.tipo === 'exclusao') {
      return `Deseja excluir ${acao.nome}? Esta ação não poderá ser desfeita.`;
    }
    return acao?.dados.ativo
      ? 'Deseja ativar este convênio? Ele voltará a ficar disponível.'
      : 'Deseja desativar este convênio? Ele deixará de ficar disponível.';
  });

  protected readonly confirmLabel = computed(() => {
    const acao = this.acaoPendente();
    if (acao?.tipo === 'exclusao') return 'Excluir';
    return acao?.dados.ativo ? 'Ativar' : 'Desativar';
  });

  protected readonly confirmSeverity = computed<'success' | 'danger'>(() => {
    const acao = this.acaoPendente();
    return acao?.tipo === 'status' && acao.dados.ativo ? 'success' : 'danger';
  });

  confirmarAcao(): void {
    const acao = this.acaoPendente();

    if (!acao) return;

    if (acao.tipo === 'exclusao') {
      this.conveniosService.deleteConvenio(acao.id).subscribe({
        next: () => {
          this.dialogConfirmVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Convênio excluído!',
            detail: 'O convênio foi excluído com sucesso.',
            life: 3000,
          });
        },
      });
      return;
    }

    const acao$ = acao.dados.ativo
      ? this.conveniosService.activateConvenio(acao.dados.id)
      : this.conveniosService.deactivateConvenio(acao.dados.id);

    acao$.subscribe({
      next: () => this.dialogConfirmVisible.set(false),
    });
  }

  toggleConvenio(dto: ToggleConvenioDto): void {
    this.acaoPendente.set({ tipo: 'status', dados: dto });
    this.dialogConfirmVisible.set(true);
  }

  solicitarExclusao(convenio: { id: number; nome: string }): void {
    this.acaoPendente.set({ tipo: 'exclusao', ...convenio });
    this.dialogConfirmVisible.set(true);
  }

  ngOnInit(): void {
    this.conveniosService.getAllConvenios().subscribe();
  }
}
