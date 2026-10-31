import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideBedSingle,
  LucideDynamicIcon,
  LucideEllipsisVertical,
  LucideEye,
  LucideLogOut,
  LucidePencil,
  LucidePowerOff,
} from '@lucide/angular';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { IconColor } from '../../../../shared/directives/icon-color';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { localDateToDate } from '../../../../shared/utils/local-date';
import { AcaoMenuInternacao } from '../../interfaces/acao-menu-internacao';
import { ETAPA_TRATAMENTO_CONFIG } from '../../interfaces/etapa-tratamento-config';
import { InternacaoCardContent } from '../../interfaces/internacao-card-content';

@Component({
  selector: 'app-internacao-card',
  host: {
    class:
      'group relative grid min-w-0 grid-cols-[minmax(0,1fr)_36px] items-center gap-2 rounded-xl border border-l-4 border-border-default bg-surface-card p-3 transition-colors sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)_36px] md:grid-cols-[minmax(0,240px)_repeat(4,minmax(0,1fr))_36px] xl:gap-3 2xl:grid-cols-[minmax(0,240px)_repeat(4,minmax(0,1fr))_40px] 2xl:gap-4 2xl:p-4',
    '[class]':
      "!internacao().ativo ? `bg-surface-subtle! border-2 border-dashed! border-border-muted! before:pointer-events-none before:content-[''] before:backdrop-blur-[.5px] before:h-full before:w-full before:absolute before:left-0 before:top-0` : ''",
    '[style.border-left-color]': 'internacao().convenio.cor',
  },
  imports: [
    CommonModule,
    MenuModule,
    TagModule,
    IconColor,
    CpfPipe,
    LucideBedSingle,
    LucideDynamicIcon,
    LucideEllipsisVertical,
  ],
  templateUrl: './internacao-card.html',
  styleUrl: './internacao-card.css',
})
export class InternacaoCard {
  private readonly router = inject(Router);
  readonly internacao = input.required<InternacaoCardContent>();
  protected readonly etapaConfig = computed(
    () => ETAPA_TRATAMENTO_CONFIG[this.internacao().etapaTratamento],
  );
  protected readonly dataEntrada = computed(() => localDateToDate(this.internacao().dataEntrada));
  protected readonly dataSaidaPrevista = computed(() =>
    localDateToDate(this.internacao().dataSaidaPrevista),
  );

  protected readonly acoes = computed<AcaoMenuInternacao[]>(() => [
    {
      label: 'Visualizar internação',
      lucideIcon: LucideEye,
      iconClass: 'h-4.5 w-4.5 text-action-info',
      command: () => this.router.navigate(['/internacoes', this.internacao().id]),
    },
    {
      label: 'Editar internação',
      visible: this.internacao().ativo,
      lucideIcon: LucidePencil,
      iconClass: 'h-4 w-4 text-action-secondary-text',
      command: () => this.router.navigate(['/internacoes', this.internacao().id, 'editar']),
    },
    {
      label: 'Registrar alta',
      visible: this.internacao().ativo,
      lucideIcon: LucideLogOut,
      iconClass: 'h-4 w-4 text-action-success',
    },
    {
      label: 'Inativar internação',
      visible: this.internacao().ativo,
      lucideIcon: LucidePowerOff,
      iconClass: 'h-4 w-4 text-action-warning',
    },
  ]);
}
