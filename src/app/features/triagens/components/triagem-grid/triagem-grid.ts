import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCalendarClock,
  LucideCalendarPlus,
  LucideCalendarX2,
  LucideCircleCheckBig,
  LucideFunnelX,
  LucideSearchX,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { Triagem } from '../../interfaces/triagem';
import { TriagemCard } from '../triagem-card/triagem-card';

@Component({
  selector: 'triagem-grid',
  imports: [
    DataViewModule,
    SkeletonModule,
    TriagemCard,
    EmptyList,
    ButtonModule,
    LucideFunnelX,
    LucideCalendarPlus,
    RouterLink,
  ],
  templateUrl: './triagem-grid.html',
  styleUrl: './triagem-grid.css',
})
export class TriagemGrid {
  readonly triagens = input.required<Triagem[]>();
  readonly dataReferencia = input.required<Date>();
  readonly loading = input(false);
  readonly filtrosAtivos = input(false);
  readonly temTriagensNoStatus = input(false);
  readonly statusSelecionado = input.required<string>();
  readonly limparFiltros = output<void>();
  readonly concluirTriagem = output<{ id: number; nome: string }>();
  readonly reabrirTriagem = output<{ id: number; nome: string }>();
  readonly reagendarTriagem = output<Triagem>();
  readonly excluirTriagem = output<{ id: number; nome: string }>();
  protected readonly emptySearchIcon = LucideSearchX;
  protected readonly emptyStatusContent = computed(() => {
    const config = {
      AGENDADA: {
        icon: LucideCalendarClock,
        title: 'Nenhuma triagem agendada',
        description: 'Não há triagens agendadas no momento.',
      },
      ATRASADA: {
        icon: LucideCalendarX2,
        title: 'Nenhuma triagem atrasada',
        description: 'Não há triagens atrasadas no momento.',
      },
      CONCLUIDA: {
        icon: LucideCircleCheckBig,
        title: 'Nenhuma triagem concluída',
        description: 'Não há triagens concluídas no momento.',
      },
    };

    return config[this.statusSelecionado() as keyof typeof config] ?? config.AGENDADA;
  });
  protected readonly skeletonCards = Array.from({ length: 10 });
  protected readonly dataviewPt = {
    root: {
      class: 'flex! flex-col gap-2',
    },
    content: {
      class: 'bg-transparent!',
    },
    pcPaginator: {
      root: {
        class: 'border! border-border-default',
      },
    },
  };
}
