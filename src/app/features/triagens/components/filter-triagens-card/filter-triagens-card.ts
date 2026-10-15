import { Component, computed, inject, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideCalendar, LucideLayers, LucideSearch } from '@lucide/angular';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Card } from '../../../../shared/components/card/card';
import { ConveniosService } from '../../../convenios/services/convenios-service';

@Component({
  selector: 'filter-triagens-card',
  imports: [
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    FormsModule,
    LucideCalendar,
    LucideLayers,
    LucideSearch,
    Card,
  ],
  templateUrl: './filter-triagens-card.html',
  styleUrl: './filter-triagens-card.css',
})
export class FilterTriagensCard implements OnInit {
  private readonly conveniosService = inject(ConveniosService);

  protected readonly convenios = computed(() => {
    const todos = { name: 'Todos', code: 'todos' };
    const convenios = this.conveniosService
      .convenios()
      .map((convenio) => ({ name: convenio.descricao, code: String(convenio.id) }));

    return [todos, ...convenios];
  });

  protected readonly datas = [
    { name: 'Todas as datas', code: 'todos' },
    { name: 'Próximos 7 dias', code: '7' },
    { name: 'Próximos 15 dias', code: '15' },
    { name: 'Próximos 30 dias', code: '30' },
  ];

  readonly busca = input<string>();
  readonly convenioSelecionado = input<string>();
  readonly rangeDataSelecionado = input<string>();
  protected readonly buscaChange = output<string>();
  protected readonly convenioSelecionadoChange = output<string>();
  protected readonly rangeDataSelecionadoChange = output<string>();

  ngOnInit(): void {
    this.conveniosService.getAllConvenios().subscribe();
  }
}
