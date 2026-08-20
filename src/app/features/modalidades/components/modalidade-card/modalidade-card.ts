import { Component, computed, input } from '@angular/core';
import { LucideDoorOpen, LucideDynamicIcon, LucideUsersRound } from '@lucide/angular';
import { IconColor } from '../../../../shared/directives/icon-color';
import { ModalidadeCardContent } from '../../interfaces/modalidade-card-content';
import { BadgeModule } from 'primeng/badge';
import { CustomBadge } from '../../../../shared/directives/custom-badge';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { InfoCard } from '../../../../shared/components/info-card/info-card';

@Component({
  selector: 'modalidade-card',
  host: {
    class:
      'flex flex-col w-sm grow items-center gap-2 bg-surface-card border border-border-default rounded-lg p-4',
  },
  imports: [LucideDynamicIcon, IconColor, BadgeModule, CustomBadge, InfoCard],
  templateUrl: './modalidade-card.html',
  styleUrl: './modalidade-card.css',
})
export class ModalidadeCard {
  readonly data = input.required<ModalidadeCardContent>();
  readonly computedInfoCards = computed<InfoCardContent[]>(() => {
    const card1 = {
      value: this.data().acolhidosAtivos,
      label: 'Acolhidos ativos',
      icon: LucideUsersRound,
      color: 'gray',
    };
    const card2 = {
      value: this.data().totalVagas - this.data().acolhidosAtivos,
      label: 'Vagas disponíveis',
      icon: LucideDoorOpen,
      color: 'sky',
    };
    return [card1, card2];
  });
}
