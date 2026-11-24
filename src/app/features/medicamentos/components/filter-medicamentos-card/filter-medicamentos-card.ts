import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideSearch, LucideSlidersHorizontal } from '@lucide/angular';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

export type EstoqueMedicamentoFiltro = 'todos' | 'baixo' | 'normal';

@Component({
  selector: 'filter-medicamentos-card',
  imports: [
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    LucideSearch,
    LucideSlidersHorizontal,
  ],
  templateUrl: './filter-medicamentos-card.html',
  styleUrl: './filter-medicamentos-card.css',
})
export class FilterMedicamentosCard {
  readonly opcoesEstoque: { name: string; code: EstoqueMedicamentoFiltro }[] = [
    { name: 'Todos', code: 'todos' },
    { name: 'Estoque baixo', code: 'baixo' },
    { name: 'Estoque normal', code: 'normal' },
  ];

  readonly busca = input<string>('');
  readonly estoqueSelecionado = input<EstoqueMedicamentoFiltro>('todos');

  protected readonly buscaChange = output<string>();
  protected readonly estoqueSelecionadoChange = output<EstoqueMedicamentoFiltro>();
}
