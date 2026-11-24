import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, Signal, signal, untracked } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import {
  LucideBadgeDollarSign,
  LucideBanknoteCheck,
  LucideCalendarCheck,
  LucideHandCoins,
  LucideReceiptText,
  LucideWallet,
  LucideWalletCards,
} from '@lucide/angular';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { finalize, forkJoin } from 'rxjs';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { IconColor } from '../../../../shared/directives/icon-color';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { localDateToDate } from '../../../../shared/utils/local-date';
import { DialogEstornarPagamento } from '../../../pagamentos/components/dialog-estornar-pagamento/dialog-estornar-pagamento';
import { DialogRegistrarPagamento } from '../../../pagamentos/components/dialog-registrar-pagamento/dialog-registrar-pagamento';
import { PagamentoCard } from '../../../pagamentos/components/pagamento-card/pagamento-card';
import { StatusPagamento } from '../../../pagamentos/enums/status-pagamento';
import { Pagamento } from '../../../pagamentos/interfaces/pagamento';
import { PagamentosService } from '../../../pagamentos/services/pagamentos-service';
import { Internacao } from '../../../internacoes/interfaces/internacao';
import { ProntuarioSectionCard } from '../../components/prontuario-section-card/prontuario-section-card';
import { ProntuarioOutletData } from '../../interfaces/prontuario-outlet-data';

interface ResumoInternacao {
  totalPago: number;
  ativos: number;
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
    PaginatorModule,
    PagamentoCard,
    ProntuarioSectionCard,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './pagamentos.html',
  styleUrl: './pagamentos.css',
})
export class Pagamentos {
  private readonly outletData = inject(ROUTER_OUTLET_DATA) as Signal<ProntuarioOutletData>;
  private readonly pagamentosService = inject(PagamentosService);

  protected readonly rowsPorPagina = 5;
  protected readonly primeiroIndice = signal(0);
  protected readonly internacoesTotais = computed(() => this.outletData().internacoes);
  protected readonly internacaoAtualIsenta = computed(() =>
    this.internacoesTotais().some((internacao) => internacao.ativo && !internacao.convenio.pagamento),
  );
  protected readonly internacoes = computed(() =>
    [...this.internacoesTotais()]
      .filter((internacao) => internacao.convenio.pagamento)
      .sort((a, b) => {
        if (a.ativo !== b.ativo) return a.ativo ? -1 : 1;

        const dataMaisRecente = b.dataEntrada.localeCompare(a.dataEntrada);
        return dataMaisRecente !== 0 ? dataMaisRecente : b.id - a.id;
      }),
  );
  protected readonly internacoesPaginadas = computed(() =>
    this.internacoes().slice(this.primeiroIndice(), this.primeiroIndice() + this.rowsPorPagina),
  );
  private readonly internacaoIdsChave = computed(() =>
    this.internacoes()
      .map((internacao) => internacao.id)
      .join(','),
  );
  private readonly pagamentosCarregadosIds = signal<Set<number>>(new Set());
  private readonly carregandoPagamentosIds = signal<Set<number>>(new Set());
  private readonly erroPagamentosIds = signal<Set<number>>(new Set());
  private readonly resumosCarregadosIds = signal<Set<number>>(new Set());
  private ultimaChaveAccordion: string | null = null;

  protected readonly loading = computed(() => this.outletData().loading);
  protected readonly mutationLoading = computed(() => this.pagamentosService.loading().mutation);
  protected readonly pagamentosIcon = LucideWalletCards;
  protected readonly emptyInternacoesIcon = LucideReceiptText;
  protected readonly emptyPagamentosIcon = LucideHandCoins;
  protected readonly skeletonPaineis = Array.from({ length: 2 });
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
    const resumosBackend = this.pagamentosService.resumos();
    const resumos = new Map<number, ResumoInternacao>();

    for (const internacao of this.internacoes()) {
      const ativos = (this.pagamentosPorInternacao().get(internacao.id) ?? []).filter(
        (pagamento) => pagamento.status === StatusPagamento.ATIVO,
      );
      const totalPagoLocal = ativos.reduce(
        (total, pagamento) => total + Number(pagamento.valor),
        0,
      );
      const totalPago = resumosBackend[internacao.id]?.totalPago ?? totalPagoLocal;

      resumos.set(internacao.id, {
        totalPago,
        ativos: ativos.length,
        ultimoPagamento: ativos[0]?.dataPagamento ?? null,
      });
    }

    return resumos;
  });

  constructor() {
    effect(() => {
      const chave = this.internacaoIdsChave();
      if (chave === this.ultimaChaveAccordion) return;

      this.ultimaChaveAccordion = chave;
      this.primeiroIndice.set(0);
      this.internacaoAberta.set(null);
      this.pagamentosCarregadosIds.set(new Set());
      this.carregandoPagamentosIds.set(new Set());
      this.erroPagamentosIds.set(new Set());
      this.resumosCarregadosIds.set(new Set());
    });

    effect((onCleanup) => {
      if (this.outletData().loading) return;

      const visiveis = this.internacoesPaginadas();
      const jaCarregados = untracked(() => this.resumosCarregadosIds());
      const idsFaltantes = visiveis
        .map((internacao) => internacao.id)
        .filter((id) => !jaCarregados.has(id));

      if (idsFaltantes.length === 0) return;

      const subscription = forkJoin(
        idsFaltantes.map((internacaoId) =>
          this.pagamentosService.getResumoByInternacaoId(internacaoId),
        ),
      ).subscribe({
        next: () => {
          this.resumosCarregadosIds.update((atuais) => {
            const proximo = new Set(atuais);
            for (const id of idsFaltantes) proximo.add(id);
            return proximo;
          });
        },
        error: () => {},
      });

      onCleanup(() => subscription.unsubscribe());
    });

    effect((onCleanup) => {
      if (this.outletData().loading) return;

      const internacaoId = this.internacaoAberta();
      if (internacaoId === null) return;

      const visivel = this.internacoesPaginadas().some(
        (internacao) => internacao.id === internacaoId,
      );
      if (!visivel) return;

      const jaCarregado = untracked(() => this.pagamentosCarregadosIds().has(internacaoId));
      const emCarregamento = untracked(() => this.carregandoPagamentosIds().has(internacaoId));
      if (jaCarregado || emCarregamento) return;

      this.erroPagamentosIds.update((atuais) => {
        if (!atuais.has(internacaoId)) return atuais;
        const proximo = new Set(atuais);
        proximo.delete(internacaoId);
        return proximo;
      });
      this.carregandoPagamentosIds.update((atuais) => {
        const proximo = new Set(atuais);
        proximo.add(internacaoId);
        return proximo;
      });

      const subscription = this.pagamentosService
        .getPagamentosByInternacaoId(internacaoId)
        .pipe(
          finalize(() => {
            this.carregandoPagamentosIds.update((atuais) => {
              const proximo = new Set(atuais);
              proximo.delete(internacaoId);
              return proximo;
            });
          }),
        )
        .subscribe({
          next: () => {
            this.pagamentosCarregadosIds.update((atuais) => {
              const proximo = new Set(atuais);
              proximo.add(internacaoId);
              return proximo;
            });
          },
          error: () => {
            this.erroPagamentosIds.update((atuais) => {
              const proximo = new Set(atuais);
              proximo.add(internacaoId);
              return proximo;
            });
          },
        });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected carregandoPagamentosDaInternacao(internacaoId: number): boolean {
    if (this.carregandoPagamentosIds().has(internacaoId)) return true;
    if (this.erroPagamentosIds().has(internacaoId)) return false;
    return !this.pagamentosCarregadosIds().has(internacaoId);
  }

  protected onPageChange(event: PaginatorState): void {
    this.primeiroIndice.set(event.first ?? 0);
    this.internacaoAberta.set(null);
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
      ativos: 0,
      ultimoPagamento: null,
    };

    return [
      {
        value: this.formatarMoeda(resumo.totalPago),
        label: 'Total pago',
        icon: LucideBanknoteCheck,
        color: '#00a63e',
      },
      {
        value: resumo.ativos,
        label: 'Pagamentos ativos',
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
        color: '#be222d',
      },
    ];
  }

  protected abrirRegistro(internacao: Internacao): void {
    if (!internacao.convenio.pagamento || !internacao.ativo || this.mutationLoading()) return;

    this.internacaoSelecionada.set(internacao);
    this.registrarPagamentoVisible.set(true);
  }

  protected abrirEstorno(pagamento: Pagamento): void {
    if (this.mutationLoading()) return;

    this.pagamentoSelecionado.set(pagamento);
    this.estornarPagamentoVisible.set(true);
  }

  protected atualizarResumo(internacaoId: number): void {
    this.pagamentosService.getResumoByInternacaoId(internacaoId).subscribe({ error: () => {} });
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
