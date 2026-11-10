import { CommonModule } from '@angular/common';
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
import { EtapaTratamento } from '../internacoes/enums/etapa-tratamento';
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
  private readonly conveniosService = inject(ConveniosService);
  private readonly internacoesService = inject(InternacoesService);
  private readonly triagensService = inject(TriagensService);

  protected readonly carregando = signal(true);
  protected readonly falhaCarregamento = signal(false);
  protected readonly skeletonIndicadores = Array.from({ length: 5 });

  protected readonly indicadores = computed<InfoCardContent[]>(() => {
    const internacoesAtivas = this.internacoesService
      .internacoes()
      .filter((internacao) => internacao.ativo);
    const vagasDisponiveis = this.conveniosService
      .convenios()
      .filter((convenio) => convenio.ativo)
      .reduce((total, convenio) => {
        const ocupadas = internacoesAtivas.filter(
          (internacao) => internacao.convenio.id === convenio.id,
        ).length;
        return total + Math.max(0, convenio.maxVagas - ocupadas);
      }, 0);
    const triagensPendentes = this.triagensService
      .triagens()
      .filter((triagem) => triagem.triagemStatus !== StatusTriagem.CONCLUIDA).length;
    const proximasDaAlta = internacoesAtivas.filter(
      (internacao) => internacao.etapaTratamento === EtapaTratamento.PROXIMO_ALTA,
    ).length;
    const altasVencidas = internacoesAtivas.filter(
      (internacao) => internacao.etapaTratamento === EtapaTratamento.ALTA_VENCIDA,
    ).length;

    return [
      {
        value: internacoesAtivas.length,
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

  protected readonly ocupacaoConvenios = computed<OcupacaoConvenio[]>(() => {
    const internacoesAtivas = this.internacoesService
      .internacoes()
      .filter((internacao) => internacao.ativo);

    return this.conveniosService
      .convenios()
      .filter((convenio) => convenio.ativo)
      .map((convenio) => {
        const ocupadas = internacoesAtivas.filter(
          (internacao) => internacao.convenio.id === convenio.id,
        ).length;

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
    }).subscribe({
      next: () => this.carregando.set(false),
      error: () => {
        this.carregando.set(false);
        this.falhaCarregamento.set(true);
      },
    });
  }
}
