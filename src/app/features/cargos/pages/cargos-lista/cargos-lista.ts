import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Card } from '../../../../shared/components/card/card';
import { LucideBriefcase, LucidePlus, LucideSearchX } from '@lucide/angular';
import { IconColor } from '../../../../shared/directives/icon-color';
import { ButtonModule } from 'primeng/button';
import { CargosService } from '../../services/cargos-service';
import { CargoCard } from '../../components/cargo-card/cargo-card';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToggleCargoDto } from '../../interfaces/toggle-cargo-dto';
import { CargoForm } from '../cargo-form/cargo-form';
import { Cargo } from '../../interfaces/cargo';
import { DataViewModule } from 'primeng/dataview';

@Component({
  selector: 'cargos-lista',
  imports: [
    ButtonModule,
    Card,
    CargoCard,
    LucideBriefcase,
    LucideSearchX,
    LucidePlus,
    IconColor,
    ConfirmDialog,
    CargoForm,
    DataViewModule,
  ],
  templateUrl: './cargos-lista.html',
  styleUrl: './cargos-lista.css',
})
export class CargosLista implements OnInit {
  private readonly cargosService = inject(CargosService);
  protected readonly cargos = this.cargosService.cargos;
  protected readonly loading = this.cargosService.loading;
  protected readonly dialogConfirmVisible = signal<boolean>(false);
  protected readonly acaoPendente = signal<ToggleCargoDto | null>(null);

  protected readonly updateDialogVisible = signal<boolean>(false);
  protected readonly cargoToUpdate = signal<Cargo | null>(null);
  protected readonly dataviewPt = {
    root: {
      class: 'flex! flex-col gap-2',
    },
    content: {
      class: 'bg-transparent!',
    },
    pcPaginator: {
      root: {
        class: 'border! border-border-default bg-surface-subtle/20!',
      },
    },
  };

  protected readonly confirmTitle = computed(() => {
    return this.acaoPendente()?.ativo ? 'Ativar cargo' : 'Desativar cargo';
  });

  protected readonly confirmMessage = computed(() => {
    return this.acaoPendente()?.ativo
      ? 'Deseja ativar este cargo? Ele voltará a ficar disponível.'
      : 'Deseja desativar este cargo? Ele deixará de ficar disponível.';
  });

  protected readonly confirmLabel = computed(() => {
    return this.acaoPendente()?.ativo ? 'Ativar' : 'Desativar';
  });

  protected readonly confirmSeverity = computed<'success' | 'danger'>(() => {
    return this.acaoPendente()?.ativo ? 'success' : 'danger';
  });

  ngOnInit(): void {
    this.cargosService.getAllCargos().subscribe();
  }

  confirmarAlteracaoStatus(): void {
    const dto = this.acaoPendente();

    if (!dto) return;

    const acao$ = dto.ativo
      ? this.cargosService.activateCargo(dto.id)
      : this.cargosService.deactivateCargo(dto.id);

    acao$.subscribe({
      next: () => this.dialogConfirmVisible.set(false),
    });
  }

  toggleCargo(dto: ToggleCargoDto): void {
    this.acaoPendente.set(dto);
    this.dialogConfirmVisible.set(true);
  }

  editCargo(cargo: Cargo): void {
    this.updateDialogVisible.set(true);
    this.cargoToUpdate.set(cargo);
  }

  registerCargo(): void {
    this.updateDialogVisible.set(true);
    this.cargoToUpdate.set(null);
  }
}
