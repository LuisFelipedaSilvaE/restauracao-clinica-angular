import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideBedSingle,
  LucideCalendarCheck,
  LucideCalendarDays,
  LucideClipboardList,
  LucideClock3,
  LucideLayers,
  LucidePencil,
  LucideStethoscope,
} from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { BackButton } from '../../../../shared/components/back-button/back-button';
import { Card } from '../../../../shared/components/card/card';
import { CustomTag } from '../../../../shared/directives/custom-tag';
import { IconColor } from '../../../../shared/directives/icon-color';
import { AcolhidosService } from '../../../acolhidos/services/acolhidos-service';
import { InternacaoDetalhadaMock } from '../../interfaces/internacao-detalhada-mock';
import { InternacoesMockService } from '../../services/internacoes-mock-service';

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
    DividerModule,
    IconColor,
    LucideBedSingle,
    LucideCalendarCheck,
    LucideCalendarDays,
    LucideClipboardList,
    LucideClock3,
    LucideLayers,
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

  private readonly acolhidosService = inject(AcolhidosService);
  private readonly internacoesService = inject(InternacoesMockService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  protected readonly carregando = signal(true);
  protected readonly detalhes = signal<InternacaoDetalhadaMock | null>(null);
  protected readonly actionButtonPt = {
    root: {
      class: 'w-full justify-center sm:w-auto',
    },
  };

  ngOnInit(): void {
    const id = Number(this.id());

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.registroNaoEncontrado();
      return;
    }

    const internacao = this.internacoesService.buscar(id);
    const convenio = internacao
      ? this.internacoesService.convenios.find((item) => item.id === internacao.idConvenio)
      : undefined;

    if (!internacao || !convenio) {
      this.registroNaoEncontrado();
      return;
    }

    this.acolhidosService.getAllAcolhidos().subscribe({
      next: (acolhidos) => {
        const acolhido = acolhidos.find((item) => item.id === internacao.idAcolhido);

        if (!acolhido) {
          this.registroNaoEncontrado('O acolhido vinculado à internação não foi encontrado.');
          return;
        }

        this.detalhes.set({
          ...internacao,
          acolhido,
          convenio,
          tempoInternado: this.internacoesService.calcularTempoInternado(internacao.dataAdmissao),
          encerrada: ['Alta concedida', 'Desligado'].includes(internacao.etapaTratamento),
          severity: this.internacoesService.obterSeverity(internacao.etapaTratamento),
        });
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.router.navigate(['/internacoes']);
      },
    });
  }

  private registroNaoEncontrado(
    detalhe = 'O registro solicitado não existe ou foi removido.',
  ): void {
    this.carregando.set(false);
    this.messageService.add({
      severity: 'warn',
      summary: 'Internação não encontrada',
      detail: detalhe,
      life: 4000,
    });
    this.router.navigate(['/internacoes']);
  }
}
