import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePackageOpen, LucidePill, LucidePlus, LucideTriangleAlert } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { MedicamentoGrid } from '../../components/medicamento-grid/medicamento-grid';
import { MedicamentosService } from '../../services/medicamentos-service';

@Component({
  selector: 'app-medicamentos-lista',
  host: {
    class: 'flex flex-col gap-8',
  },
  imports: [ButtonModule, MedicamentoGrid, InfoCard, LucidePlus, RouterLink],
  templateUrl: './medicamentos-lista.html',
  styleUrl: './medicamentos-lista.css',
})
export class MedicamentosLista implements OnInit {
  private readonly medicamentosService = inject(MedicamentosService);
  protected readonly medicamentos = this.medicamentosService.medicamentos;
  protected readonly loading = this.medicamentosService.loading;
  protected readonly infomedicamentos = computed<InfoCardContent[]>(() => {
    const medicamentos = this.medicamentos();
    return [
      {
        value: medicamentos.length,
        label: 'Itens cadastrados',
        icon: LucidePill,
        color: '#e7000b',
      },
      {
        value: medicamentos.length,
        label: 'Unidades em medicamentos',
        icon: LucidePackageOpen,
        color: '#0084d1',
      },
      {
        value: medicamentos.length,
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
