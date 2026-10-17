import { Component, input } from '@angular/core';
import { LucideEllipsis, LucidePill } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Card } from '../../../../shared/components/card/card';
import { IconColor } from '../../../../shared/directives/icon-color';
import { Medicamento } from '../../interfaces/medicamento';

@Component({
  selector: 'medicamento-card',
  imports: [ButtonModule, TagModule, Card, IconColor, LucidePill, LucideEllipsis],
  templateUrl: './medicamento-card.html',
  styleUrl: './medicamento-card.css',
})
export class MedicamentoCard {
  protected readonly medicamento = input.required<Medicamento>();
}
