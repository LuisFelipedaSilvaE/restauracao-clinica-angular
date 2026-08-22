import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { LucideLayers } from '@lucide/angular';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';

@Component({
  selector: 'new-modalidade-dialog',
  imports: [DialogModule, ButtonModule, InfoCard],
  templateUrl: './new-modalidade-dialog.html',
  styleUrl: './new-modalidade-dialog.css',
})
export class NewModalidadeDialog {
  readonly visible = input.required<boolean>();
  readonly visibleChange = output<boolean>();
  protected readonly dialogPt = {
    header: {
      class: 'bg-brand-primary/5',
    },
  };
  protected readonly headerInfo: InfoCardContent = {
    value: 'Nova Modalidade',
    label: 'Defina o nome a quantidade de vagas.',
    icon: LucideLayers,
    color: 'brand',
  };
}
