import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideHandCoins, LucideSearch, LucideSlidersHorizontal } from '@lucide/angular';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

export type SituacaoConvenioFiltro = 'todos' | 'ativos' | 'inativos';
export type PagamentoConvenioFiltro = 'todos' | 'obrigatorio' | 'nao_obrigatorio';

@Component({
  selector: 'filter-convenios-card',
  imports: [
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    LucideHandCoins,
    LucideSearch,
    LucideSlidersHorizontal,
  ],
  templateUrl: './filter-convenios-card.html',
  styleUrl: './filter-convenios-card.css',
})
export class FilterConveniosCard {
  readonly situacoes: { name: string; code: SituacaoConvenioFiltro }[] = [
    { name: 'Todas', code: 'todos' },
    { name: 'Ativos', code: 'ativos' },
    { name: 'Inativos', code: 'inativos' },
  ];

  readonly pagamentos: { name: string; code: PagamentoConvenioFiltro }[] = [
    { name: 'Todos', code: 'todos' },
    { name: 'Obrigatório', code: 'obrigatorio' },
    { name: 'Não obrigatório', code: 'nao_obrigatorio' },
  ];

  readonly busca = input<string>('');
  readonly situacaoSelecionada = input<SituacaoConvenioFiltro>('todos');
  readonly pagamentoSelecionado = input<PagamentoConvenioFiltro>('todos');

  protected readonly buscaChange = output<string>();
  protected readonly situacaoSelecionadaChange = output<SituacaoConvenioFiltro>();
  protected readonly pagamentoSelecionadoChange = output<PagamentoConvenioFiltro>();
}
