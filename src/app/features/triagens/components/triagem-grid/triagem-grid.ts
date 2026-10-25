import { Component, input, output } from '@angular/core';
import { LucideFunnelX, LucideSearchX } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { Triagem } from '../../interfaces/triagem';
import { TriagemCard } from '../triagem-card/triagem-card';

@Component({
  selector: 'triagem-grid',
  imports: [DataViewModule, SkeletonModule, TriagemCard, EmptyList, ButtonModule, LucideFunnelX],
  templateUrl: './triagem-grid.html',
  styleUrl: './triagem-grid.css',
})
export class TriagemGrid {
  readonly triagens = input.required<Triagem[]>();
  readonly loading = input(false);
  readonly limparFiltros = output<void>();
  readonly concluirTriagem = output<{ id: number; nome: string }>();
  protected readonly emptySearchIcon = LucideSearchX;
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
