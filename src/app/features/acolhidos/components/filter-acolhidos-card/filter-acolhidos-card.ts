import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideLayers,
  LucideSearch,
  LucideSlidersHorizontal,
  LucideStethoscope,
} from '@lucide/angular';
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
    LucideStethoscope,
  ],
  templateUrl: './filter-acolhidos-card.html',
  styleUrl: './filter-acolhidos-card.css',
})
export class FilterAcolhidosCard {
  readonly modalidades = input.required<FilterOption[]>();
  readonly etapasTratamento = input.required<FilterOption[]>();

  readonly status = [
    { name: 'Todos', code: 'todos' },
    { name: 'Ativo', code: 'ativo' },
    { name: 'Inativo', code: 'inativo' },
  ];
  readonly busca = input<string>();
  readonly modalidadeSelecionada = input<string>();
  readonly statusSelecionado = input<string>();
  readonly etapasTratamentoSelecionado = input<string>();
  protected readonly buscaChange = output<string>();
  protected readonly modalidadeSelecionadaChange = output<string>();
  protected readonly statusSelecionadoChange = output<string>();
  protected readonly etapasTratamentoSelecionadoChange = output<string>();
}
