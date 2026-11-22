import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBedSingle,
  LucideCalendarPlus,
  LucideClipboardList,
  LucideDoorOpen,
  LucideDynamicIcon,
  LucideIcon,
  LucideLogIn,
  LucideLogOut,
  LucideStethoscope,
  LucideTriangleAlert,
  LucideUserRoundPlus,
} from '@lucide/angular';
import type { ChartData, ChartOptions } from 'chart.js';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { Card } from '../../shared/components/card/card';
import { InfoCard } from '../../shared/components/info-card/info-card';
import { InfoCardContent } from '../../shared/interfaces/info-card-content';
import { ConveniosService } from '../convenios/services/convenios-service';
import { Internacao } from '../internacoes/interfaces/internacao';
import { InternacoesService } from '../internacoes/services/internacoes-service';
import { StatusTriagem } from '../triagens/enums/status-triagem';
import { TriagensService } from '../triagens/services/triagens-service';

interface MesMovimentacao {
  chave: string;
  label: string;
  entradas: number;
  saidas: number;
}

interface OcupacaoConvenio {
  id: number;
  descricao: string;
  cor: string;
  ocupadas: number;
  total: number;
  disponiveis: number;
  percentual: number;
}

interface MovimentacaoRecente {
  chave: string;
  tipo: 'Entrada' | 'Saída';
  data: string;
  internacao: Internacao;
  icon: LucideIcon;
}

interface EtapaConvenioResumo {
  convenioId: number;
  descricao: string;
  cor: string;
  emTratamento: number;
  proximoAlta: number;
  altaVencida: number;
  altaConcedida: number;
  total: number;
}

@Component({
  selector: 'app-dashboard',
  host: {
    class: 'flex min-w-0 flex-col gap-8',
  },
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ChartModule,
    MessageModule,
    ProgressBarModule,
    SkeletonModule,
    TagModule,
    Card,
    InfoCard,
    LucideArrowRight,
    LucideBedSingle,
    LucideCalendarPlus,
    LucideDynamicIcon,
    LucideUserRoundPlus,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly conveniosService = inject(ConveniosService);
  private readonly internacoesService = inject(InternacoesService);
  private readonly triagensService = inject(TriagensService);

  protected readonly carregando = signal(true);
  protected readonly falhaCarregamento = signal(false);
  protected readonly skeletonIndicadores = Array.from({ length: 5 });

  private readonly ativasPorConvenioMap = computed(
    () =>
      new Map(
        this.internacoesService
          .relatorioAtivasPorConvenio()
          .map((item) => [item.convenioId, Number(item.quantidadeAtivas) || 0]),
      ),
  );

  protected readonly indicadores = computed<InfoCardContent[]>(() => {
    const relatorioAtivas = this.internacoesService.relatorioAtivasPorConvenio();
    const relatorioEtapas = this.internacoesService.relatorioEtapasPorConvenio();
    const ativasPorConvenio = this.ativasPorConvenioMap();

    const totalInternacoesAtivas = relatorioAtivas.reduce(
      (total, item) => total + (Number(item.quantidadeAtivas) || 0),
      0,
    );
    const vagasDisponiveis = this.conveniosService
      .convenios()
      .filter((convenio) => convenio.ativo)
      .reduce((total, convenio) => {
        const ocupadas = ativasPorConvenio.get(convenio.id) ?? 0;
        return total + Math.max(0, convenio.maxVagas - ocupadas);
      }, 0);
    const triagensPendentes = this.triagensService
      .triagens()
      .filter(
        (triagem) =>
          triagem.status === StatusTriagem.AGENDADA || triagem.status === StatusTriagem.ATRASADA,
      ).length;
    const proximasDaAlta = relatorioEtapas.reduce(
      (total, item) => total + (Number(item.quantidadeProximoAlta) || 0),
      0,
    );
    const altasVencidas = relatorioEtapas.reduce(
      (total, item) => total + (Number(item.quantidadeAltaVencida) || 0),
      0,
    );

    return [
      {
        value: totalInternacoesAtivas,
        label: 'Internações ativas',
        icon: LucideBedSingle,
        color: '#be222d',
      },
      {
        value: vagasDisponiveis,
        label: 'Vagas disponíveis',
        icon: LucideDoorOpen,
        color: '#00a63e',
      },
      {
        value: triagensPendentes,
        label: 'Triagens pendentes',
        icon: LucideClipboardList,
        color: '#155dfc',
      },
      {
        value: proximasDaAlta,
        label: 'Próximas da alta',
        icon: LucideStethoscope,
        color: '#f97316',
      },
      {
        value: altasVencidas,
        label: 'Altas vencidas',
        icon: LucideTriangleAlert,
        color: '#dc2626',
      },
    ];
  });

  protected readonly mesesMovimentacao = computed<MesMovimentacao[]>(() => {
    const internacoes = this.internacoesService.internacoes();
    const hoje = new Date();
    const meses = Array.from({ length: 6 }, (_, indice) => {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - indice), 1);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

      return {
        chave,
        label: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(data).replace('.', ''),
        entradas: internacoes.filter((internacao) => internacao.dataEntrada.startsWith(chave))
          .length,
        saidas: internacoes.filter((internacao) => internacao.dataSaida?.startsWith(chave)).length,
      };
    });
    return meses;
  });

  protected readonly dadosGrafico = computed<ChartData<'bar'>>(() => ({
    labels: this.mesesMovimentacao().map((mes) => mes.label),
    datasets: [
      {
        label: 'Entradas',
        data: this.mesesMovimentacao().map((mes) => mes.entradas),
        backgroundColor: '#be222d',
        hoverBackgroundColor: '#a91e29',
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 36,
      },
      {
        label: 'Saídas',
        data: this.mesesMovimentacao().map((mes) => mes.saidas),
        backgroundColor: '#a3a8b1',
        hoverBackgroundColor: '#858b95',
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 36,
      },
    ],
  }));

  protected readonly opcoesGrafico: ChartOptions<'bar'> = {
    animation: this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? false
      : undefined,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.12)',
        },
        ticks: {
          color: '#6b7280',
          precision: 0,
          stepSize: 1,
        },
      },
    },
  };

  protected readonly possuiMovimentacoes = computed(() =>
    this.mesesMovimentacao().some((mes) => mes.entradas > 0 || mes.saidas > 0),
  );

  protected readonly resumoGrafico = computed(() => {
    const meses = this.mesesMovimentacao();
    const entradas = meses.reduce((total, mes) => total + mes.entradas, 0);
    const saidas = meses.reduce((total, mes) => total + mes.saidas, 0);
    return `Nos últimos seis meses foram registradas ${entradas} entradas e ${saidas} saídas. Os valores de cada mês estão na tabela a seguir.`;
  });

  protected readonly ocupacaoConvenios = computed<OcupacaoConvenio[]>(() => {
    const ativasPorConvenio = this.ativasPorConvenioMap();

    return this.conveniosService
      .convenios()
      .filter((convenio) => convenio.ativo)
      .map((convenio) => {
        const ocupadas = ativasPorConvenio.get(convenio.id) ?? 0;

        return {
          id: convenio.id,
          descricao: convenio.descricao,
          cor: convenio.cor,
          ocupadas,
          total: convenio.maxVagas,
          disponiveis: Math.max(0, convenio.maxVagas - ocupadas),
          percentual:
            convenio.maxVagas === 0
              ? 0
              : Math.min(100, Math.round((ocupadas / convenio.maxVagas) * 100)),
        };
      })
      .sort(
        (a, b) => b.percentual - a.percentual || a.descricao.localeCompare(b.descricao, 'pt-BR'),
      );
  });

  protected readonly etapasPorConvenio = computed<EtapaConvenioResumo[]>(() => {
    const conveniosPorId = new Map(
      this.conveniosService.convenios().map((convenio) => [convenio.id, convenio]),
    );

    return this.internacoesService
      .relatorioEtapasPorConvenio()
      .map((item) => ({
        convenioId: item.convenioId,
        descricao: item.descricao,
        cor: conveniosPorId.get(item.convenioId)?.cor ?? '#94a3b8',
        emTratamento: Number(item.quantidadeEmTratamento) || 0,
        proximoAlta: Number(item.quantidadeProximoAlta) || 0,
        altaVencida: Number(item.quantidadeAltaVencida) || 0,
        altaConcedida: Number(item.quantidadeAltaConcedida) || 0,
        total: Number(item.total) || 0,
      }))
      .sort((a, b) => b.total - a.total || a.descricao.localeCompare(b.descricao, 'pt-BR'));
  });

  protected readonly movimentacoesRecentes = computed<MovimentacaoRecente[]>(() =>
    this.internacoesService
      .internacoes()
      .flatMap((internacao): MovimentacaoRecente[] => {
        const movimentacoes: MovimentacaoRecente[] = [
          {
            chave: `${internacao.id}-entrada`,
            tipo: 'Entrada',
            data: internacao.dataEntrada,
            internacao,
            icon: LucideLogIn,
          },
        ];

        if (internacao.dataSaida) {
          movimentacoes.push({
            chave: `${internacao.id}-saida`,
            tipo: 'Saída',
            data: internacao.dataSaida,
            internacao,
            icon: LucideLogOut,
          });
        }

        return movimentacoes;
      })
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 6),
  );

  ngOnInit(): void {
    this.carregarDados();
  }

  protected carregarDados(forcarAtualizacao = false): void {
    this.carregando.set(true);
    this.falhaCarregamento.set(false);

    forkJoin({
      convenios: this.conveniosService.getAllConvenios(forcarAtualizacao),
      internacoes: this.internacoesService.getAllInternacoes(forcarAtualizacao),
      triagens: this.triagensService.getAllTriagens(forcarAtualizacao),
      ativasPorConvenio: this.internacoesService.getRelatorioAtivasPorConvenio(),
      etapasPorConvenio: this.internacoesService.getRelatorioEtapasPorConvenio(),
    }).subscribe({
      next: () => this.carregando.set(false),
      error: () => {
        this.carregando.set(false);
        this.falhaCarregamento.set(true);
      },
    });
  }
}
