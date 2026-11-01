import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideLayers, LucideSearch, LucideSlidersHorizontal } from '@lucide/angular';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { EtapaTratamento } from '../../../internacoes/enums/etapa-tratamento';
import { ETAPA_TRATAMENTO_CONFIG } from '../../../internacoes/interfaces/etapa-tratamento-config';
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
  readonly situacoes: FilterOption[] = [
    { name: 'Todas as situações', code: 'todos' },
    {
      name: ETAPA_TRATAMENTO_CONFIG[EtapaTratamento.EM_TRATAMENTO].label,
      code: EtapaTratamento.EM_TRATAMENTO,
    },
    {
      name: ETAPA_TRATAMENTO_CONFIG[EtapaTratamento.PROXIMO_ALTA].label,
      code: EtapaTratamento.PROXIMO_ALTA,
    },
    {
      name: ETAPA_TRATAMENTO_CONFIG[EtapaTratamento.ALTA_VENCIDA].label,
      code: EtapaTratamento.ALTA_VENCIDA,
    },
    { name: 'Sem internação', code: 'sem_internacao' },
    { name: 'Inativo', code: 'inativo' },
  ];
  readonly busca = input<string>();
  readonly convenioSelecionado = input<string>();
  readonly situacaoSelecionada = input<string>();
  protected readonly buscaChange = output<string>();
  protected readonly convenioSelecionadoChange = output<string>();
  protected readonly situacaoSelecionadaChange = output<string>();
}
