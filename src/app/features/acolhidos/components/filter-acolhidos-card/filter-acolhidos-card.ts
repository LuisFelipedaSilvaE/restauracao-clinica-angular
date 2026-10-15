import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideLayers, LucideSearch, LucideSlidersHorizontal } from '@lucide/angular';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FilterOption } from '../../interfaces/filter-option';

@Component({
  selector: 'filter-acolhidos-card',
  imports: [
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    FormsModule,
    LucideSlidersHorizontal,
    LucideSearch,
    LucideLayers,
  ],
  templateUrl: './filter-acolhidos-card.html',
  styleUrl: './filter-acolhidos-card.css',
})
export class FilterAcolhidosCard {
  readonly convenios = input.required<FilterOption[]>();
  readonly status = [
    { name: 'Todos', code: 'todos' },
    { name: 'Ativo', code: 'ativo' },
    { name: 'Inativo', code: 'inativo' },
  ];
  readonly busca = input<string>();
  readonly convenioSelecionado = input<string>();
  readonly statusSelecionado = input<string>();
  protected readonly buscaChange = output<string>();
  protected readonly convenioSelecionadoChange = output<string>();
  protected readonly statusSelecionadoChange = output<string>();
}
