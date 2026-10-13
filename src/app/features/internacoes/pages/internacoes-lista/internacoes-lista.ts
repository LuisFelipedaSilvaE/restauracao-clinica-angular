import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideBedSingle,
  LucideBellRing,
  LucideCalendarPlus,
  LucideClipboardList,
  LucideFunnelX,
  LucideSearchX,
  LucideTriangleAlert,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { AcolhidosMockService } from '../../../acolhidos/services/acolhidos-mock-service';
import { FilterInternacoesCard } from '../../components/filter-internacoes-card/filter-internacoes-card';
import { InternacaoCard } from '../../components/internacao-card/internacao-card';
import { InternacaoCardContent } from '../../interfaces/internacao-card-content';
import { InternacoesMockService } from '../../services/internacoes-mock-service';

@Component({
  selector: 'app-internacoes-lista',
  host: {
    class: 'flex min-w-0 flex-col gap-8',
  },
  imports: [
    ButtonModule,
    DataViewModule,
    RouterLink,
    SkeletonModule,
    EmptyList,
    FilterInternacoesCard,
    InfoCard,
    InternacaoCard,
    LucideCalendarPlus,
    LucideFunnelX,
  ],
  templateUrl: './internacoes-lista.html',
  styleUrl: './internacoes-lista.css',
})
export class InternacoesLista {
  private readonly acolhidosService = inject(AcolhidosMockService);
  private readonly internacoesService = inject(InternacoesMockService);
  protected readonly internacoes = this.internacoesService.internacoes;
  protected readonly loading = signal(false);
  protected readonly skeletonCards = Array.from({ length: 10 });
  protected readonly emptySearchIcon = LucideSearchX;
  protected readonly emptyInternacoesIcon = LucideBedSingle;

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

  protected readonly infoInternacoes = computed<InfoCardContent[]>(() => {
    const internacoes = this.internacoes();
    const etapasEncerradas = new Set(['Alta concedida', 'Desligado']);

    return [
      {
        value: internacoes.length,
        label: 'Internações totais',
        icon: LucideClipboardList,
        color: '#155dfc',
      },
      {
        value: internacoes.filter((internacao) => !etapasEncerradas.has(internacao.etapaTratamento))
          .length,
        label: 'Internações ativas',
        icon: LucideBedSingle,
        color: '#00a63e',
      },
      {
        value: internacoes.filter((internacao) => internacao.etapaTratamento === 'Próximo da alta')
          .length,
        label: 'Próximas da alta',
        icon: LucideBellRing,
        color: '#e17100',
      },
      {
        value: internacoes.filter((internacao) => internacao.etapaTratamento === 'Alta vencida')
          .length,
        label: 'Altas vencidas',
        icon: LucideTriangleAlert,
        color: '#e7000b',
      },
    ];
  });

  protected readonly busca = signal('');
  protected readonly modalidadeSelecionada = signal('todos');
  protected readonly etapaTratamentoSelecionada = signal('todos');
  protected readonly periodoEntradaSelecionado = signal<Date[] | null>(null);

  protected readonly modalidades = computed(() => [
    { name: 'Todas modalidades', code: 'todos' },
    ...this.acolhidosService.modalidades.map((modalidade) => ({
      name: modalidade.descricao,
      code: modalidade.descricao,
    })),
  ]);

  protected readonly etapasTratamento = [
    { name: 'Todas etapas', code: 'todos' },
    { name: 'Em tratamento', code: 'Em tratamento' },
    { name: 'Próximo da alta', code: 'Próximo da alta' },
    { name: 'Alta vencida', code: 'Alta vencida' },
    { name: 'Alta concedida', code: 'Alta concedida' },
    { name: 'Desligado', code: 'Desligado' },
  ];

  protected readonly internacoesCardsFiltradas = computed<InternacaoCardContent[]>(() => {
    const busca = this.normalizarTexto(this.busca());
    const modalidadeFiltro =
      this.modalidadeSelecionada() === 'todos' ? null : this.modalidadeSelecionada().toLowerCase();
    const etapaFiltro =
      this.etapaTratamentoSelecionada() === 'todos'
        ? null
        : this.etapaTratamentoSelecionada().toLowerCase();
    const [dataEntradaInicial, dataEntradaFinal] = this.periodoEntradaSelecionado() ?? [];

    const acolhidosPorId = new Map(
      this.acolhidosService.acolhidos().map((acolhido) => [acolhido.id, acolhido]),
    );
    const modalidadesPorId = new Map(
      this.acolhidosService.modalidades.map((modalidade) => [modalidade.id, modalidade]),
    );

    return this.internacoes().flatMap((internacao) => {
      const acolhido = acolhidosPorId.get(internacao.idAcolhido);
      const modalidade = modalidadesPorId.get(internacao.idModalidade);

      if (!acolhido || !modalidade) return [];

      const correspondeBusca =
        !busca ||
        this.normalizarTexto(acolhido.nome).includes(busca) ||
        acolhido.cpf.replace(/\D/g, '').includes(busca) ||
        this.normalizarTexto(acolhido.email).includes(busca);
      const correspondeModalidade =
        modalidadeFiltro === null || modalidade.descricao.toLowerCase() === modalidadeFiltro;
      const correspondeEtapa =
        etapaFiltro === null || internacao.etapaTratamento.toLowerCase() === etapaFiltro;
      const correspondePeriodoEntrada =
        !dataEntradaInicial ||
        !dataEntradaFinal ||
        this.dataDentroDoIntervalo(internacao.dataAdmissao, dataEntradaInicial, dataEntradaFinal);

      if (
        !correspondeBusca ||
        !correspondeModalidade ||
        !correspondeEtapa ||
        !correspondePeriodoEntrada
      ) {
        return [];
      }

      return [
        {
          ...internacao,
          acolhido,
          modalidade,
          encerrada: ['Alta concedida', 'Desligado'].includes(internacao.etapaTratamento),
          severity: this.internacoesService.obterSeverity(internacao.etapaTratamento),
        },
      ];
    });
  });

  protected clearFilters(): void {
    this.busca.set('');
    this.modalidadeSelecionada.set('todos');
    this.etapaTratamentoSelecionada.set('todos');
    this.periodoEntradaSelecionado.set(null);
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\W_\u0300-\u036f]/g, '');
  }

  private dataDentroDoIntervalo(data: Date, inicio: Date, fim: Date): boolean {
    const valor = new Date(data);
    const dataInicial = new Date(inicio);
    const dataFinal = new Date(fim);

    valor.setHours(0, 0, 0, 0);
    dataInicial.setHours(0, 0, 0, 0);
    dataFinal.setHours(23, 59, 59, 999);

    return valor >= dataInicial && valor <= dataFinal;
  }
}
