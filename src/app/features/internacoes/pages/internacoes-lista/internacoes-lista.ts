import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { localDateToDate } from '../../../../shared/utils/local-date';
import { FilterInternacoesCard } from '../../components/filter-internacoes-card/filter-internacoes-card';
import { DialogRegistrarAltaInternacao } from '../../components/dialog-registrar-alta-internacao/dialog-registrar-alta-internacao';
import { InternacaoCard } from '../../components/internacao-card/internacao-card';
import { EtapaTratamento } from '../../enums/etapa-tratamento';
import { ETAPA_TRATAMENTO_CONFIG } from '../../interfaces/etapa-tratamento-config';
import { InternacaoCardContent } from '../../interfaces/internacao-card-content';
import { Internacao } from '../../interfaces/internacao';
import { InternacoesService } from '../../services/internacoes-service';

@Component({
  selector: 'app-internacoes-lista',
  host: {
    class: 'flex min-w-0 flex-col gap-8',
  },
  imports: [
    ButtonModule,
    ConfirmDialog,
    DataViewModule,
    RouterLink,
    SkeletonModule,
    EmptyList,
    DialogRegistrarAltaInternacao,
    FilterInternacoesCard,
    InfoCard,
    InternacaoCard,
    LucideCalendarPlus,
    LucideFunnelX,
  ],
  templateUrl: './internacoes-lista.html',
  styleUrl: './internacoes-lista.css',
})
export class InternacoesLista implements OnInit {
  private readonly internacoesService = inject(InternacoesService);
  private readonly messageService = inject(MessageService);
  protected readonly internacoes = this.internacoesService.internacoes;
  protected readonly loading = computed(() => this.internacoesService.loading().list);
  protected readonly mutationLoading = computed(() => this.internacoesService.loading().mutation);
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

    return [
      {
        value: internacoes.length,
        label: 'Internações totais',
        icon: LucideClipboardList,
        color: '#155dfc',
      },
      {
        value: internacoes.filter((internacao) => internacao.ativo).length,
        label: 'Internações ativas',
        icon: LucideBedSingle,
        color: '#00a63e',
      },
      {
        value: internacoes.filter(
          (internacao) =>
            internacao.ativo && internacao.etapaTratamento === EtapaTratamento.PROXIMO_ALTA,
        ).length,
        label: 'Próximas da alta',
        icon: LucideBellRing,
        color: '#e17100',
      },
      {
        value: internacoes.filter(
          (internacao) =>
            internacao.ativo && internacao.etapaTratamento === EtapaTratamento.ALTA_VENCIDA,
        ).length,
        label: 'Altas vencidas',
        icon: LucideTriangleAlert,
        color: '#e7000b',
      },
    ];
  });

  protected readonly busca = signal('');
  protected readonly convenioSelecionado = signal('todos');
  protected readonly etapaTratamentoSelecionada = signal('todos');
  protected readonly periodoEntradaSelecionado = signal<Date[] | null>(null);
  protected readonly internacaoSelecionada = signal<Internacao | null>(null);
  protected readonly internacaoParaExclusao = signal<{ id: number; nome: string } | null>(null);
  protected readonly registrarAltaVisible = signal(false);
  protected readonly excluirInternacaoVisible = signal(false);

  protected readonly convenios = computed(() => {
    const conveniosUnicos = new Map(
      this.internacoes().map((internacao) => [internacao.convenio.id, internacao.convenio]),
    );

    return [
      { name: 'Todos os convênios', code: 'todos' },
      ...Array.from(conveniosUnicos.values())
        .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR'))
        .map((convenio) => ({
          name: convenio.descricao,
          code: String(convenio.id),
        })),
    ];
  });

  protected readonly etapasTratamento = [
    { name: 'Todas etapas', code: 'todos' },
    ...Object.values(EtapaTratamento).map((etapa) => ({
      name: ETAPA_TRATAMENTO_CONFIG[etapa].label,
      code: etapa,
    })),
  ];

  protected readonly internacoesCardsFiltradas = computed<InternacaoCardContent[]>(() => {
    const busca = this.normalizarTexto(this.busca());
    const convenioFiltro =
      this.convenioSelecionado() === 'todos' ? null : this.convenioSelecionado();
    const etapaFiltro =
      this.etapaTratamentoSelecionada() === 'todos'
        ? null
        : (this.etapaTratamentoSelecionada() as EtapaTratamento);
    const [dataEntradaInicial, dataEntradaFinal] = this.periodoEntradaSelecionado() ?? [];

    return this.internacoes().flatMap<InternacaoCardContent>((internacao) => {
      const correspondeBusca =
        !busca ||
        this.normalizarTexto(internacao.acolhido.nome).includes(busca) ||
        internacao.acolhido.cpf.replace(/\D/g, '').includes(busca) ||
        this.normalizarTexto(internacao.acolhido.email).includes(busca);
      const correspondeConvenio =
        convenioFiltro === null || String(internacao.convenio.id) === convenioFiltro;
      const correspondeEtapa = etapaFiltro === null || internacao.etapaTratamento === etapaFiltro;
      const correspondePeriodoEntrada =
        !dataEntradaInicial ||
        !dataEntradaFinal ||
        this.dataDentroDoIntervalo(internacao.dataEntrada, dataEntradaInicial, dataEntradaFinal);

      if (
        !correspondeBusca ||
        !correspondeConvenio ||
        !correspondeEtapa ||
        !correspondePeriodoEntrada
      ) {
        return [];
      }

      return [
        {
          ...internacao,
          tempoInternado: this.internacoesService.calcularTempoInternado(
            internacao.dataEntrada,
            internacao.dataSaida,
          ),
        },
      ];
    });
  });

  protected clearFilters(): void {
    this.busca.set('');
    this.convenioSelecionado.set('todos');
    this.etapaTratamentoSelecionada.set('todos');
    this.periodoEntradaSelecionado.set(null);
  }

  protected abrirRegistrarAlta(internacao: Internacao): void {
    this.internacaoSelecionada.set(internacao);
    this.registrarAltaVisible.set(true);
  }

  protected solicitarExclusao(internacao: { id: number; nome: string }): void {
    this.internacaoParaExclusao.set(internacao);
    this.excluirInternacaoVisible.set(true);
  }

  protected excluirInternacao(): void {
    const internacao = this.internacaoParaExclusao();
    if (!internacao) return;

    this.internacoesService.deleteInternacao(internacao.id).subscribe({
      next: () => {
        this.excluirInternacaoVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Internação excluída!',
          detail: 'A internação foi excluída com sucesso.',
          life: 3000,
        });
      },
    });
  }

  ngOnInit(): void {
    this.internacoesService.getAllInternacoes().subscribe();
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\W_\u0300-\u036f]/g, '');
  }

  private dataDentroDoIntervalo(data: string, inicio: Date, fim: Date): boolean {
    const valor = localDateToDate(data);
    const dataInicial = new Date(inicio);
    const dataFinal = new Date(fim);

    valor.setHours(0, 0, 0, 0);
    dataInicial.setHours(0, 0, 0, 0);
    dataFinal.setHours(23, 59, 59, 999);

    return valor >= dataInicial && valor <= dataFinal;
  }
}
