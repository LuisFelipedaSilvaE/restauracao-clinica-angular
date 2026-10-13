import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideCalendarRange,
  LucideLayers,
  LucideSearch,
  LucideStethoscope,
} from '@lucide/angular';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

interface FilterOption {
  name: string;
  code: string;
}

@Component({
  selector: 'app-filter-internacoes-card',
  imports: [
    DatePickerModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    LucideCalendarRange,
    LucideLayers,
    LucideSearch,
    LucideStethoscope,
  ],
  templateUrl: './filter-internacoes-card.html',
  styleUrl: './filter-internacoes-card.css',
})
export class FilterInternacoesCard {
  readonly modalidades = input.required<FilterOption[]>();
  readonly etapasTratamento = input.required<FilterOption[]>();

  readonly busca = input<string>();
  readonly modalidadeSelecionada = input<string>();
  readonly etapaTratamentoSelecionada = input<string>();
  readonly periodoEntradaSelecionado = input<Date[] | null>();

  protected readonly buscaChange = output<string>();
  protected readonly modalidadeSelecionadaChange = output<string>();
  protected readonly etapaTratamentoSelecionadaChange = output<string>();
  protected readonly periodoEntradaSelecionadoChange = output<Date[] | null>();
}
