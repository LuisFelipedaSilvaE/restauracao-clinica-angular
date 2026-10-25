import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCalendarPlus,
  LucideCalendarX2,
  LucideCheck,
  LucideDynamicIcon,
  LucideRotateCcwClock,
} from '@lucide/angular';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { Card } from '../../../../shared/components/card/card';
import { FilterTriagensCard } from '../../components/filter-triagens-card/filter-triagens-card';
import { TriagemGrid } from '../../components/triagem-grid/triagem-grid';
import { Triagem } from '../../interfaces/triagem';
import { TriagensService } from '../../services/triagens-service';

@Component({
  selector: 'app-triagens-lista',
  host: {
    class: 'flex flex-col gap-6',
  },
  imports: [
    TabsModule,
    Card,
    LucideDynamicIcon,
    LucideCalendarPlus,
    RouterLink,
    BadgeModule,
    ButtonModule,
    FilterTriagensCard,
    TriagemGrid,
  ],
  templateUrl: './triagens-lista.html',
  styleUrl: './triagens-lista.css',
})
export class TriagensLista implements OnInit {
  protected readonly triagensService = inject(TriagensService);
  protected readonly triagens = this.triagensService.triagens;
  protected readonly loading = this.triagensService.loading;
  protected readonly statusSelecionado = signal('AGENDADA');
  protected readonly tabs = computed(() => {
    const triagens = this.triagens();

    return [
      {
        label: 'Agendadas',
        status: 'AGENDADA',
        icon: LucideCheck,
        total: triagens.filter((t) => t.status === 'AGENDADA').length,
      },
      {
        label: 'Atrasadas',
        status: 'ATRASADA',
        icon: LucideCalendarX2,
        total: triagens.filter((t) => t.status === 'ATRASADA').length,
      },
      {
        label: 'Concluídas',
        status: 'CONCLUIDA',
        icon: LucideRotateCcwClock,
        total: triagens.filter((t) => t.status === 'CONCLUIDA').length,
      },
    ];
  });
  protected readonly busca = signal('');
  protected readonly convenioSelecionado = signal('todos');
  protected readonly rangeDataSelecionado = signal('todos');
  protected readonly triagensFiltradas = computed<Triagem[]>(() => {
    const busca = (this.busca() || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\W_\u0300-\u036f]/g, '');

    const convenioFiltro = this.convenioSelecionado();
    const rangeDataFiltro = this.rangeDataSelecionado();
    const statusFiltro = this.statusSelecionado();

    const triagensFiltradas: Triagem[] = this.triagens().filter((triagem) => {
      const nome =
        triagem.nomePossivelAcolhido
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\W_\u0300-\u036f]/g, '') || '';

      const telefone = triagem.telefone.replace(/\D/g, '') || '';

      const convenioDesc =
        triagem.convenio.descricao
          .normalize('NFD')
          .toLowerCase()
          .replace(/[\W_\u0300-\u036f]/g, '') || '';

      const validBusca =
        !busca || nome.includes(busca) || telefone.includes(busca) || convenioDesc.includes(busca);

      const convenioValido =
        convenioFiltro === 'todos' || triagem.convenio.id === Number(convenioFiltro);

      let validRangeData = true;
      if (rangeDataFiltro !== 'todos' && triagem.dataAgendada) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dias = Number(rangeDataFiltro);
        const limite = new Date(hoje);
        limite.setDate(limite.getDate() + dias);
        limite.setHours(23, 59, 59, 999);

        const dataTriagem = new Date(triagem.dataAgendada);
        validRangeData = dataTriagem >= hoje && dataTriagem <= limite;
      }

      const validStatus = triagem.status === statusFiltro;

      return validBusca && validStatus && convenioValido && validRangeData;
    });

    return triagensFiltradas;
  });
  ngOnInit(): void {
    this.triagensService.getAllTriagens().subscribe();
  }

  clearFilters(): void {
    this.busca.set('');
    this.convenioSelecionado.set('todos');
    this.rangeDataSelecionado.set('todos');
  }
}
