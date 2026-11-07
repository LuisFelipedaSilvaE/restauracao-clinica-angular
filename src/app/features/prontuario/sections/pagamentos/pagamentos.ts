import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, Signal, signal } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import {
  LucideBadgeDollarSign,
  LucideCalendarCheck,
  LucideCircleDollarSign,
  LucideHandCoins,
  LucideReceiptText,
  LucideWallet,
  LucideWalletCards,
} from '@lucide/angular';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { IconColor } from '../../../../shared/directives/icon-color';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { localDateToDate } from '../../../../shared/utils/local-date';
import { DialogEstornarPagamento } from '../../../pagamentos/components/dialog-estornar-pagamento/dialog-estornar-pagamento';
import { DialogRegistrarPagamento } from '../../../pagamentos/components/dialog-registrar-pagamento/dialog-registrar-pagamento';
import { PagamentoCard } from '../../../pagamentos/components/pagamento-card/pagamento-card';
import { Pagamento } from '../../../pagamentos/interfaces/pagamento';
import { PagamentosService } from '../../../pagamentos/services/pagamentos-service';
import { Internacao } from '../../../internacoes/interfaces/internacao';
import { ProntuarioSectionCard } from '../../components/prontuario-section-card/prontuario-section-card';
import { ProntuarioOutletData } from '../../interfaces/prontuario-outlet-data';

interface ResumoInternacao {
  totalPago: number;
  confirmados: number;
  ultimoPagamento: string | null;
}

@Component({
  selector: 'prontuario-pagamentos',
  host: {
    class: 'block min-w-0',
  },
  imports: [
    AccordionModule,
    ButtonModule,
    CommonModule,
    DataViewModule,
    DialogEstornarPagamento,
    DialogRegistrarPagamento,
    EmptyList,
    IconColor,
    InfoCard,
    LucideHandCoins,
    LucideWallet,
    MessageModule,
    PagamentoCard,
    ProntuarioSectionCard,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './pagamentos.html',
  styleUrl: './pagamentos.css',
})
export class Pagamentos implements OnInit {
  private readonly outletData = inject(ROUTER_OUTLET_DATA) as Signal<ProntuarioOutletData>;
  private readonly pagamentosService = inject(PagamentosService);
  private accordionInicializado = false;

  protected readonly internacoes = computed(() =>
    [...this.outletData().internacoes].sort((a, b) => {
      if (a.ativo !== b.ativo) return a.ativo ? -1 : 1;

      const dataMaisRecente = b.dataEntrada.localeCompare(a.dataEntrada);
      return dataMaisRecente !== 0 ? dataMaisRecente : b.id - a.id;
    }),
  );
  protected readonly loading = computed(
    () => this.outletData().loading || this.pagamentosService.loading().list,
  );
  protected readonly mutationLoading = computed(() => this.pagamentosService.loading().mutation);
  protected readonly pagamentosIcon = LucideWalletCards;
  protected readonly emptyInternacoesIcon = LucideReceiptText;
  protected readonly emptyPagamentosIcon = LucideHandCoins;
  protected readonly skeletonPaineis = Array.from({ length: 2 });
  protected readonly skeletonPagamentos = Array.from({ length: 3 });
  protected readonly internacaoAberta = signal<number | null>(null);
  protected readonly registrarPagamentoVisible = signal(false);
  protected readonly estornarPagamentoVisible = signal(false);
  protected readonly internacaoSelecionada = signal<Internacao | null>(null);
  protected readonly pagamentoSelecionado = signal<Pagamento | null>(null);

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

  private readonly pagamentosPorInternacao = computed(() => {
    const grupos = new Map<number, Pagamento[]>();

    for (const internacao of this.internacoes()) {
      grupos.set(internacao.id, []);
    }

    for (const pagamento of this.pagamentosService.pagamentos()) {
      grupos.get(pagamento.internacaoId)?.push(pagamento);
    }

    return grupos;
  });

  private readonly resumos = computed(() => {
    const resumos = new Map<number, ResumoInternacao>();

    for (const internacao of this.internacoes()) {
      const confirmados = (this.pagamentosPorInternacao().get(internacao.id) ?? []).filter(
        (pagamento) => pagamento.status === 'CONFIRMADO',
      );

      resumos.set(internacao.id, {
        totalPago: confirmados.reduce((total, pagamento) => total + pagamento.valor, 0),
        confirmados: confirmados.length,
        ultimoPagamento: confirmados[0]?.dataPagamento ?? null,
      });
    }

    return resumos;
  });

  constructor() {
    effect(() => {
      const internacoes = this.internacoes();
      if (this.accordionInicializado || internacoes.length === 0) return;

      this.internacaoAberta.set(
        internacoes.find((internacao) => internacao.ativo)?.id ?? internacoes[0].id,
      );
      this.accordionInicializado = true;
    });
  }

  ngOnInit(): void {
    this.pagamentosService.getAllPagamentos().subscribe();
  }

  protected pagamentosDaInternacao(internacaoId: number): Pagamento[] {
    return this.pagamentosPorInternacao().get(internacaoId) ?? [];
  }

  protected totalPago(internacaoId: number): number {
    return this.resumos().get(internacaoId)?.totalPago ?? 0;
  }

  protected indicadores(internacao: Internacao): InfoCardContent[] {
    const resumo = this.resumos().get(internacao.id) ?? {
      totalPago: 0,
      confirmados: 0,
      ultimoPagamento: null,
    };

    return [
      {
        value: this.formatarMoeda(resumo.totalPago),
        label: 'Total pago',
        icon: LucideCircleDollarSign,
        color: '#00a63e',
      },
      {
        value: resumo.confirmados,
        label: 'Pagamentos confirmados',
        icon: LucideReceiptText,
        color: '#155dfc',
      },
      {
        value: resumo.ultimoPagamento ? this.formatarData(resumo.ultimoPagamento) : 'Nenhum',
        label: 'Último pagamento',
        icon: LucideCalendarCheck,
        color: '#e17100',
      },
      {
        value: this.formatarMoeda(internacao.valorMensalidade),
        label: 'Mensalidade',
        icon: LucideBadgeDollarSign,
        color: '#7c3aed',
      },
    ];
  }

  protected abrirRegistro(internacao: Internacao): void {
    if (!internacao.convenio.pagamento || this.mutationLoading()) return;

    this.internacaoSelecionada.set(internacao);
    this.registrarPagamentoVisible.set(true);
  }

  protected abrirEstorno(pagamento: Pagamento): void {
    if (this.mutationLoading()) return;

    this.pagamentoSelecionado.set(pagamento);
    this.estornarPagamentoVisible.set(true);
  }

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  private formatarData(valor: string): string {
    return new Intl.DateTimeFormat('pt-BR').format(localDateToDate(valor));
  }
}
