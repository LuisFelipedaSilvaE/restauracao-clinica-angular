import { Component, computed, inject, signal } from '@angular/core';
import {
  LucideBellRing,
  LucideFolderX,
  LucideFunnelX,
  LucideHeartPulse,
  LucidePlus,
  LucideSearchX,
  LucideTriangleAlert,
  LucideUserRoundPlus,
  LucideUserRoundX,
  LucideUsersRound,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { AcolhidosMockService } from '../../services/acolhidos-mock-service';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { FilterAcolhidosCard } from '../../components/filter-acolhidos-card/filter-acolhidos-card';
import { DataViewModule } from 'primeng/dataview';
import { AcolhidoCard } from '../../components/acolhido-card/acolhido-card';
import { AcolhidoCardContent } from '../../interfaces/acolhido-card-content';
import { Acolhido } from '../../interfaces/acolhido';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToggleAcolhidoDto } from '../../interfaces/toggle-acolhido-dto';
import { FilterOption } from '../../interfaces/filter-option';
import { RouterLink } from '@angular/router';
import { IconColor } from '../../../../shared/directives/icon-color';

@Component({
  selector: 'app-acolhidos-lista',
  host: {
    class: 'flex min-w-0 flex-col gap-8',
  },
  imports: [
    ButtonModule,
    LucideUserRoundPlus,
    InfoCard,
    FilterAcolhidosCard,
    DataViewModule,
    AcolhidoCard,
    ConfirmDialog,
    RouterLink,
    LucideUserRoundX,
    LucidePlus,
    IconColor,
    LucideSearchX,
    LucideFunnelX,
  ],
  templateUrl: './acolhidos-lista.html',
  styleUrl: './acolhidos-lista.css',
})
export class AcolhidosLista {
  private readonly acolhidosService = inject(AcolhidosMockService);
  protected readonly acolhidos = this.acolhidosService.acolhidos;
  protected readonly acaoPendente = signal<ToggleAcolhidoDto | null>(null);
  protected readonly infoAcolhidos = computed<InfoCardContent[]>(() => {
    const acolhidos = this.acolhidos();
    const total = acolhidos.filter((a) => a.status == 'Ativo').length;
    const emTratamento = acolhidos.filter(
      (a) => a.etapaTratamento === 'Em tratamento' && a.status === 'Ativo',
    ).length;
    const proximosDaAlta = acolhidos.filter(
      (a) => a.etapaTratamento === 'Próximo da alta' && a.status === 'Ativo',
    ).length;
    const altasVencidas = acolhidos.filter(
      (a) => a.etapaTratamento === 'Alta vencida' && a.status === 'Ativo',
    ).length;

    return [
      {
        value: total,
        label: 'Acolhidos ativos',
        icon: LucideUsersRound,
        color: '#e7000b',
      },
      {
        value: emTratamento,
        label: 'Em tratamento',
        icon: LucideHeartPulse,
        color: '#00a63e',
      },
      {
        value: proximosDaAlta,
        label: 'Próximos da alta',
        icon: LucideBellRing,
        color: '#e17100',
      },
      {
        value: altasVencidas,
        label: 'Altas vencidas',
        icon: LucideTriangleAlert,
        color: '#e7000b',
      },
    ];
  });

  private obterSeverity(etapaTratamento: string): AcolhidoCardContent['severity'] {
    const severidades: Record<string, AcolhidoCardContent['severity']> = {
      'Em tratamento': 'success',
      'Próximo da alta': 'warn',
      'Alta vencida': 'danger',
      'Alta concedida': 'info',
      Desligado: 'secondary',
    };

    return severidades[etapaTratamento] ?? 'secondary';
  }

  private calcularPrevisaoDeAlta(dataEntrada: Date): Date {
    const previsaoDeAlta = new Date(dataEntrada);
    previsaoDeAlta.setMonth(previsaoDeAlta.getMonth() + 3);

    return previsaoDeAlta;
  }

  private calcularTempoInternado(dataEntrada: Date): string {
    const diasTotais = Math.max(0, Math.floor((Date.now() - dataEntrada.getTime()) / 86_400_000));
    const meses = Math.floor(diasTotais / 30);
    const dias = diasTotais % 30;

    if (meses === 0) return `${dias}d`;

    return `${meses} ${meses === 1 ? 'mês' : 'meses'} e ${dias}d`;
  }

  protected readonly dataviewPt = {
    root: {
      class: 'flex! min-w-0 flex-col gap-2',
    },
    content: {
      class: 'min-w-0 overflow-hidden bg-transparent!',
    },
    pcPaginator: {
      root: {
        class: 'border! border-border-default',
      },
    },
  };

  protected readonly acolhidosCardsFiltrados = computed<AcolhidoCardContent[]>(() => {
    const busca = (this.busca() || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\W_\u0300-\u036f]/g, '');

    const modalidadesFiltro =
      this.modalidadeSelecionada() === 'todos' ? null : this.modalidadeSelecionada().toLowerCase();
    const statusFiltro =
      this.statusSelecionado() === 'todos' ? null : this.statusSelecionado().toLowerCase();
    const etapaTratamentoFiltro =
      this.etapaTratamentoSelecionado() === 'todos'
        ? null
        : this.etapaTratamentoSelecionado().toLowerCase();

    const acolhidosFiltrados: Acolhido[] = this.acolhidos().filter((acolhido) => {
      const nome = acolhido.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\W_\u0300-\u036f]/g, '');
      const cpf = acolhido.cpf.replace(/\D/g, '') || '';
      const email =
        acolhido.email
          .normalize('NFD')
          .toLowerCase()
          .replace(/[\W_\u0300-\u036f]/g, '') || '';
      const validBusca =
        !busca || nome.includes(busca) || cpf.includes(busca) || email.includes(busca);
      const validStatus = statusFiltro === null || acolhido.status.toLowerCase() === statusFiltro;

      const validModalidade =
        modalidadesFiltro === null ||
        acolhido.modalidade.descricao.toLowerCase() === modalidadesFiltro;

      const validEtapaTratamento =
        etapaTratamentoFiltro === null ||
        acolhido.etapaTratamento.toLowerCase() === etapaTratamentoFiltro;

      return validBusca && validModalidade && validStatus && validEtapaTratamento;
    });

    return acolhidosFiltrados.map((acolhido) => {
      return {
        ...acolhido,
        severity: this.obterSeverity(acolhido.etapaTratamento),
        previsaoDeAlta: this.calcularPrevisaoDeAlta(acolhido.dataEntrada),
        tempoInternado: this.calcularTempoInternado(acolhido.dataEntrada),
      };
    });
  });

  clearFilters(): void {
    this.busca.set('');
    this.modalidadeSelecionada.set('todos');
    this.statusSelecionado.set('todos');
    this.etapaTratamentoSelecionado.set('todos');
  }

  protected readonly busca = signal('');
  protected readonly modalidadeSelecionada = signal('todos');
  protected readonly statusSelecionado = signal('todos');
  protected readonly etapaTratamentoSelecionado = signal('todos');

  protected readonly modalidades = computed<FilterOption[]>(() => [
    { name: 'Todas modalidades', code: 'todos' },
    ...[
      ...new Map(
        this.acolhidos().map((acolhido) => [
          acolhido.modalidade.id,
          {
            name: acolhido.modalidade.descricao,
            code: acolhido.modalidade.descricao,
          },
        ]),
      ).values(),
    ],
  ]);

  protected readonly etapasTratamento = computed<FilterOption[]>(() => [
    { name: 'Todas etapas', code: 'todos' },
    ...[...new Set(this.acolhidos().map((acolhido) => acolhido.etapaTratamento))].map((etapa) => ({
      name: etapa,
      code: etapa,
    })),
  ]);

  protected readonly dialogConfirmVisible = signal<boolean>(false);

  protected readonly confirmTitle = computed(() => {
    return this.acaoPendente()?.ativo == 'Ativo' ? 'Ativar acolhido' : 'Desativar acolhido';
  });

  protected readonly confirmMessage = computed(() => {
    return this.acaoPendente()?.ativo == 'Ativo'
      ? 'Deseja ativar este acolhido? Ele voltará a ficar disponível.'
      : 'Deseja desativar este acolhido? Ele deixará de ficar disponível.';
  });

  protected readonly confirmLabel = computed(() => {
    return this.acaoPendente()?.ativo == 'Ativo' ? 'Ativar' : 'Desativar';
  });

  protected readonly confirmSeverity = computed<'success' | 'danger'>(() => {
    return this.acaoPendente()?.ativo == 'Ativo' ? 'success' : 'danger';
  });

  confirmarAlteracaoStatus(): void {
    const dto = this.acaoPendente();

    if (!dto) return;

    this.acolhidosService.alterarStatus(dto.id, dto.ativo);
    this.dialogConfirmVisible.set(false);

    // const acao$ = dto.ativo
    //   ? this.modalidadesService.activateModalidade(dto.id)
    //   : this.modalidadesService.deactivateModalidade(dto.id);

    // acao$.subscribe({
    //   next: () => this.dialogConfirmVisible.set(false),
    // });
  }

  toggleAcolhido(dto: ToggleAcolhidoDto): void {
    this.acaoPendente.set(dto);
    this.dialogConfirmVisible.set(true);
  }
}
