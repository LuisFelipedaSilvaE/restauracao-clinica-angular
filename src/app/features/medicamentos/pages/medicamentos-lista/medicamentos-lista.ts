import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePackageOpen, LucidePill, LucidePlus, LucideTriangleAlert } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { forkJoin } from 'rxjs';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import {
  EstoqueMedicamentoFiltro,
  FilterMedicamentosCard,
} from '../../components/filter-medicamentos-card/filter-medicamentos-card';
import { MedicamentoGrid } from '../../components/medicamento-grid/medicamento-grid';
import { Medicamento } from '../../interfaces/medicamento';
import { MedicamentosService } from '../../services/medicamentos-service';

@Component({
  selector: 'app-medicamentos-lista',
  host: {
    class: 'flex flex-col gap-8',
  },
  imports: [
    ButtonModule,
    FilterMedicamentosCard,
    MedicamentoGrid,
    InfoCard,
    PageHeader,
    LucidePlus,
    RouterLink,
    EmptyList,
  ],
  templateUrl: './medicamentos-lista.html',
  styleUrl: './medicamentos-lista.css',
})
export class MedicamentosLista implements OnInit {
  private readonly medicamentosService = inject(MedicamentosService);
  protected readonly medicamentos = this.medicamentosService.medicamentos;
  protected readonly loading = this.medicamentosService.loading;
  protected readonly emptyMedicamentosIcon = LucidePill;
  protected readonly busca = signal('');
  protected readonly estoqueSelecionado = signal<EstoqueMedicamentoFiltro>('todos');

  protected readonly medicamentosFiltrados = computed<Medicamento[]>(() => {
    const busca = this.normalizarTexto(this.busca());
    const estoqueFiltro = this.estoqueSelecionado();

    return this.medicamentos().filter((medicamento) => {
      const correspondeBusca = !busca || this.normalizarTexto(medicamento.nome).includes(busca);
      const estoqueBaixo = this.isEstoqueBaixo(medicamento);
      const correspondeEstoque =
        estoqueFiltro === 'todos' ||
        (estoqueFiltro === 'baixo' ? estoqueBaixo : !estoqueBaixo);

      return correspondeBusca && correspondeEstoque;
    });
  });

  protected readonly infomedicamentos = computed<InfoCardContent[]>(() => {
    const medicamentos = this.medicamentos();
    const itensCadastrados = medicamentos.length;
    const unidadesEmMedicamentos = medicamentos.reduce(
      (total, medicamento) => total + (Number(medicamento.quantidadeEstoque) || 0),
      0,
    );
    const precisamDeAtencao = this.medicamentosService.medicamentosEmAlerta().length;

    return [
      {
        value: itensCadastrados,
        label: 'Itens cadastrados',
        icon: LucidePill,
        color: '#e7000b',
      },
      {
        value: unidadesEmMedicamentos.toLocaleString('pt-BR'),
        label: 'Unidades em estoque',
        icon: LucidePackageOpen,
        color: '#0084d1',
      },
      {
        value: precisamDeAtencao,
        label: 'Precisam de atenção',
        icon: LucideTriangleAlert,
        color: '#e17100',
      },
    ];
  });

  ngOnInit(): void {
    forkJoin({
      medicamentos: this.medicamentosService.getAllMedicamentos(),
      alertas: this.medicamentosService.getMedicamentosEmAlerta(),
    }).subscribe();
  }

  protected clearFilters(): void {
    this.busca.set('');
    this.estoqueSelecionado.set('todos');
  }

  private isEstoqueBaixo(medicamento: Medicamento): boolean {
    const estoque = Number(medicamento.quantidadeEstoque) || 0;
    const minimo = Number(medicamento.quantidadeMinima) || 0;
    return medicamento.status ? medicamento.status === 'ALERTA: ESTOQUE BAIXO' : estoque <= minimo;
  }

  private normalizarTexto(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }
}
