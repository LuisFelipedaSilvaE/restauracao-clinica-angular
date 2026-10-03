import { Component, computed, inject, input, OnInit, output } from '@angular/core';
import { Card } from '../../../../shared/components/card/card';
import { LucideDynamicIcon, LucidePencil, LucidePower, LucidePowerOff } from '@lucide/angular';
import { Cargo } from '../../interfaces/cargo';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FuncionariosService } from '../../../funcionarios/services/funcionarios-service';
import { ToggleCargoDto } from '../../interfaces/toggle-cargo-dto';

@Component({
  selector: 'cargo-card',
  imports: [ButtonModule, Card, TagModule, TooltipModule, LucideDynamicIcon, LucidePencil],
  templateUrl: './cargo-card.html',
  styleUrl: './cargo-card.css',
})
export class CargoCard {
  protected readonly cargo = input.required<Cargo>();
  protected readonly statusCargoChange = output<ToggleCargoDto>();
  protected readonly onEditCargo = output<Cargo>();
  private readonly funcionariosService = inject(FuncionariosService);
  protected readonly funcionarios = this.funcionariosService.funcionarios;
  protected readonly totalColaboradores = computed(() => {
    const total = this.funcionarios()?.filter((c) => c.id === this.cargo().id).length;
    return total == 1 ? `${total} Colaborador` : `${total} Colaboradores`;
  });
  protected readonly buttonConfig = computed(() => {
    return {
      severity: this.cargo()?.ativo ? 'warn' : 'success',
      icon: this.cargo()?.ativo ? LucidePowerOff : LucidePower,
      tooltipValue: this.cargo()?.ativo ? 'Inativar cargo' : 'Ativar cargo',
    };
  });
  protected readonly tagConfig = computed(() => {
    return {
      severity: this.cargo()?.ativo ? 'success' : 'secondary',
      label: this.cargo()?.ativo ? 'Ativo' : 'Inativo',
    };
  });

  toggleCargo(): void {
    const dto: ToggleCargoDto = {
      id: this.cargo().id,
      ativo: !this.cargo().ativo,
    };

    this.statusCargoChange.emit(dto);
  }
}
