import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideArrowDownToLine,
  LucideArrowUpFromLine,
  LucideDynamicIcon,
  LucideEllipsisVertical,
  LucideEye,
  LucidePencil,
  LucidePill,
  LucideTrash2,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { Card } from '../../../../shared/components/card/card';
import { CustomProgressbar } from '../../../../shared/directives/custom-progressbar';
import { IconColor } from '../../../../shared/directives/icon-color';
import { AcaoMenu } from '../../../../shared/interfaces/acao-menu';
import { Medicamento } from '../../interfaces/medicamento';

@Component({
  selector: 'medicamento-card',
  imports: [
    ButtonModule,
    TagModule,
    MenuModule,
    ProgressBarModule,
    Card,
    IconColor,
    CustomProgressbar,
    LucidePill,
    LucideEllipsisVertical,
    LucideDynamicIcon,
    CommonModule,
  ],
  templateUrl: './medicamento-card.html',
  styleUrl: './medicamento-card.css',
})
export class MedicamentoCard {
  protected readonly medicamento = input.required<Medicamento>();
  protected readonly porcentagemEstoque = computed(() => {
    const estoque = Number(this.medicamento().quantidadeEstoque) || 0;
    const minimo = Number(this.medicamento().quantidadeMinima) || 0;

    if (estoque <= 0) return 0;
    if (minimo <= 0) return 100;

    const porcentagem = (estoque / minimo) * 100;
    if (!Number.isFinite(porcentagem)) return 0;
    return Math.min(Math.ceil(porcentagem), 100);
  });
  private readonly router = inject(Router);
  readonly onEntrada = output<Medicamento>();
  readonly onSaida = output<Medicamento>();
  readonly onDelete = output<Medicamento>();
  protected readonly statusMedicamento = computed(() => {
    const medicamento = this.medicamento();
    const estoque = Number(medicamento.quantidadeEstoque) || 0;
    const minimo = Number(medicamento.quantidadeMinima) || 0;
    const estoqueBaixo = estoque <= minimo;

    return {
      pb: {
        severity: estoqueBaixo ? '#e7000b' : '#00a63e',
      },

      tag: {
        severity: estoqueBaixo ? 'danger' : 'success',
        label: estoqueBaixo ? 'Estoque baixo' : 'Estoque normal',
      },
    };
  });

  protected readonly acoes: AcaoMenu[] = [
    {
      label: 'Ver medicamento',
      lucideIcon: LucideEye,
      iconClass: 'h-4.5 w-4.5 text-action-info',
      command: () => this.router.navigate(['/medicamentos', this.medicamento().id]),
    },
    {
      label: 'Editar medicamento',
      lucideIcon: LucidePencil,
      iconClass: 'h-4 w-4 text-action-secondary-text',
      command: () => this.router.navigate(['/medicamentos', this.medicamento().id, 'editar']),
    },
    {
      label: 'Registrar entrada',
      lucideIcon: LucideArrowDownToLine,
      iconClass: 'h-4 w-4 text-action-secondary-text',
      command: () => this.onEntrada.emit(this.medicamento()),
    },
    {
      label: 'Registrar saída',
      lucideIcon: LucideArrowUpFromLine,
      iconClass: 'h-4 w-4 text-action-secondary-text',
      command: () => this.onSaida.emit(this.medicamento()),
    },
    {
      label: 'Excluir',
      lucideIcon: LucideTrash2,
      iconClass: 'h-4 w-4 text-action-destructive',
      command: () => this.onDelete.emit(this.medicamento()),
    },
  ];
}
