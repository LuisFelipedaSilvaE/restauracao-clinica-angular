import { Component, input, output } from '@angular/core';
import { LucideSearchX } from '@lucide/angular';
import { DataViewModule } from 'primeng/dataview';
import { Medicamento } from '../../interfaces/medicamento';
import { MedicamentoCard } from '../medicamento-card/medicamento-card';

@Component({
  selector: 'medicamento-grid',
  imports: [DataViewModule, MedicamentoCard],
  templateUrl: './medicamento-grid.html',
  styleUrl: './medicamento-grid.css',
})
export class MedicamentoGrid {
  readonly medicamentos = input.required<Medicamento[]>();
  readonly loading = input(false);
  readonly limparFiltros = output<void>();
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
