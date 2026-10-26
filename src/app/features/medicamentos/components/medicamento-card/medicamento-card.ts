import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideArrowDownToLine,
  LucideArrowUpFromLine,
  LucideDynamicIcon,
  LucideEllipsisVertical,
  LucideEye,
  LucidePencil,
  LucidePill,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { Card } from '../../../../shared/components/card/card';
import { IconColor } from '../../../../shared/directives/icon-color';
import { AcaoMenu } from '../../../../shared/interfaces/acao-menu';
import { Medicamento } from '../../interfaces/medicamento';

@Component({
  selector: 'medicamento-card',
  imports: [
    ButtonModule,
    TagModule,
    MenuModule,
    Card,
    IconColor,
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
  private readonly router = inject(Router);
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
    },
    {
      label: 'Registrar saída',
      lucideIcon: LucideArrowUpFromLine,
      iconClass: 'h-4 w-4 text-action-secondary-text',
    },
  ];
}
