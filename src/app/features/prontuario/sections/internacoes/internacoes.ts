import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import {
  LucideBedSingle,
  LucideCalendarCheck,
  LucideCalendarDays,
  LucideCircleCheckBig,
  LucideClock3,
  LucideEye,
  LucideHandCoins,
  LucideHistory,
  LucideLogOut,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { DetailInfoField } from '../../../../shared/components/detail-info-field/detail-info-field';
import { CustomTag } from '../../../../shared/directives/custom-tag';
import { IconColor } from '../../../../shared/directives/icon-color';
import { TIPO_ALTA_LABELS } from '../../../internacoes/enums/tipo-alta';
import { Internacao } from '../../../internacoes/interfaces/internacao';
import { ETAPA_TRATAMENTO_CONFIG } from '../../../internacoes/interfaces/etapa-tratamento-config';
import { InternacoesService } from '../../../internacoes/services/internacoes-service';
import { ProntuarioSectionCard } from '../../components/prontuario-section-card/prontuario-section-card';
import { ProntuarioOutletData } from '../../interfaces/prontuario-outlet-data';

@Component({
  selector: 'prontuario-internacoes',
  host: {
    class: 'block min-w-0',
  },
  imports: [
    ButtonModule,
    CommonModule,
    CustomTag,
    IconColor,
    LucideBedSingle,
    LucideCalendarCheck,
    LucideCalendarDays,
    LucideCircleCheckBig,
    LucideClock3,
    LucideEye,
    LucideHandCoins,
    LucideHistory,
    LucideLogOut,
    DetailInfoField,
    ProntuarioSectionCard,
    RouterLink,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './internacoes.html',
  styleUrl: './internacoes.css',
})
export class Internacoes {
  private readonly outletData = inject(ROUTER_OUTLET_DATA) as Signal<ProntuarioOutletData>;
  private readonly internacoesService = inject(InternacoesService);

  protected readonly acolhido = computed(() => this.outletData().acolhido);
  protected readonly internacoes = computed(() => this.outletData().internacoes);
  protected readonly loading = computed(() => this.outletData().loading);
  protected readonly internacaoIcon = LucideBedSingle;
  protected readonly historicoIcon = LucideHistory;
  protected readonly internacaoAtual = computed(() =>
    this.internacoes().find((internacao) => internacao.ativo),
  );
  protected readonly historico = computed(() =>
    this.internacoes().filter((internacao) => !internacao.ativo),
  );
  protected readonly skeletonHistorico = Array.from({ length: 3 });

  protected etapaConfig(internacao: Internacao) {
    return ETAPA_TRATAMENTO_CONFIG[internacao.etapaTratamento];
  }

  protected tipoAltaLabel(internacao: Internacao): string {
    return internacao.alta ? TIPO_ALTA_LABELS[internacao.alta] : 'Não informada';
  }

  protected tempoInternado(internacao: Internacao): string {
    return this.internacoesService.calcularTempoInternado(
      internacao.dataEntrada,
      internacao.dataSaida,
    );
  }
}
