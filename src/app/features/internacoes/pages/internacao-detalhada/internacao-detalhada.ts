import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideBedSingle,
  LucideCalendarCheck,
  LucideCalendarDays,
  LucideCircleCheckBig,
  LucideClipboardList,
  LucideClock3,
  LucideHandCoins,
  LucideLayers,
  LucideLogOut,
  LucidePencil,
  LucideStethoscope,
} from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { BackButton } from '../../../../shared/components/back-button/back-button';
import { Card } from '../../../../shared/components/card/card';
import { CustomTag } from '../../../../shared/directives/custom-tag';
import { IconColor } from '../../../../shared/directives/icon-color';
import { localDateToDate } from '../../../../shared/utils/local-date';
import { TIPO_ALTA_LABELS } from '../../enums/tipo-alta';
import { DialogRegistrarAltaInternacao } from '../../components/dialog-registrar-alta-internacao/dialog-registrar-alta-internacao';
import { ETAPA_TRATAMENTO_CONFIG } from '../../interfaces/etapa-tratamento-config';
import { Internacao } from '../../interfaces/internacao';
import { InternacoesService } from '../../services/internacoes-service';

@Component({
  selector: 'app-internacao-detalhada',
  host: {
    class: 'flex flex-col gap-6',
  },
  imports: [
    BackButton,
    ButtonModule,
    Card,
    CommonModule,
    CustomTag,
    DialogRegistrarAltaInternacao,
    IconColor,
    LucideBedSingle,
    LucideCalendarCheck,
    LucideCalendarDays,
    LucideCircleCheckBig,
    LucideClipboardList,
    LucideClock3,
    LucideHandCoins,
    LucideLayers,
    LucideLogOut,
    LucidePencil,
    LucideStethoscope,
    RouterLink,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './internacao-detalhada.html',
  styleUrl: './internacao-detalhada.css',
})
export class InternacaoDetalhada implements OnInit {
  readonly id = input<string>();

  private readonly internacoesService = inject(InternacoesService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  protected readonly internacao = signal<Internacao | null>(null);
  protected readonly registrarAltaVisible = signal(false);
  protected readonly carregando = computed(() => this.internacoesService.loading().detail);
  protected readonly etapaConfig = computed(() => {
    const internacao = this.internacao();
    return internacao ? ETAPA_TRATAMENTO_CONFIG[internacao.etapaTratamento] : null;
  });
  protected readonly dataEntrada = computed(() => {
    const data = this.internacao()?.dataEntrada;
    return data ? localDateToDate(data) : null;
  });
  protected readonly dataSaidaPrevista = computed(() => {
    const data = this.internacao()?.dataSaidaPrevista;
    return data ? localDateToDate(data) : null;
  });
  protected readonly dataSaida = computed(() => {
    const data = this.internacao()?.dataSaida;
    return data ? localDateToDate(data) : null;
  });
  protected readonly tempoInternado = computed(() => {
    const internacao = this.internacao();
    return internacao
      ? this.internacoesService.calcularTempoInternado(internacao.dataEntrada, internacao.dataSaida)
      : '';
  });
  protected readonly tipoAltaLabel = computed(() => {
    const alta = this.internacao()?.alta;
    return alta ? TIPO_ALTA_LABELS[alta] : null;
  });
  protected readonly actionButtonPt = {
    root: {
      class: 'w-full justify-center sm:w-auto',
    },
  };

  ngOnInit(): void {
    this.getInternacao();
  }

  private getInternacao(): void {
    const id = Number(this.id());

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.registroNaoEncontrado();
      return;
    }

    this.internacoesService.getInternacaoById(id).subscribe({
      next: (internacao) => {
        this.internacao.set(internacao);
      },
      error: () => {
        this.router.navigate(['/internacoes']);
      },
    });
  }

  protected onAltaRegistrada(internacao: Internacao): void {
    this.internacao.set(internacao);
  }

  private registroNaoEncontrado(
    detalhe = 'O registro solicitado não existe ou foi removido.',
  ): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Internação não encontrada',
      detail: detalhe,
      life: 4000,
    });
    this.router.navigate(['/internacoes']);
  }
}
