import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePackageOpen, LucidePill, LucidePlus, LucideTriangleAlert } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { MedicamentoGrid } from '../../components/medicamento-grid/medicamento-grid';
import { MedicamentosService } from '../../services/medicamentos-service';

@Component({
  selector: 'app-medicamentos-lista',
  host: {
    class: 'flex flex-col gap-8',
  },
  imports: [ButtonModule, MedicamentoGrid, InfoCard, LucidePlus, RouterLink, EmptyList],
  templateUrl: './medicamentos-lista.html',
  styleUrl: './medicamentos-lista.css',
})
export class MedicamentosLista implements OnInit {
  private readonly medicamentosService = inject(MedicamentosService);
  protected readonly medicamentos = this.medicamentosService.medicamentos;
  protected readonly loading = this.medicamentosService.loading;
  protected readonly emptyMedicamentosIcon = LucidePill;
  protected readonly infomedicamentos = computed<InfoCardContent[]>(() => {
    const medicamentos = this.medicamentos();
    const itensCadastrados = medicamentos.length;
    const unidadesEmMedicamentos = medicamentos.reduce(
      (total, medicamento) => total + (Number(medicamento.quantidadeEstoque) || 0),
      0,
    );
    const precisamDeAtencao = medicamentos.filter(
      (medicamento) =>
        Number(medicamento.quantidadeEstoque) <= Number(medicamento.quantidadeMinima),
    ).length;

    return [
      {
        value: itensCadastrados,
        label: 'Itens cadastrados',
        icon: LucidePill,
        color: '#e7000b',
      },
      {
        value: unidadesEmMedicamentos,
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
    this.medicamentosService.getAllMedicamentos().subscribe();
  }
}
