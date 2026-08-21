import { Component, computed, input, output } from '@angular/core';
import {
  LucideDoorOpen,
  LucideDynamicIcon,
  LucideUsersRound,
  LucidePencil,
  LucidePower,
  LucideTrash2,
  LucidePowerOff,
  LucideLayers,
  LucideIcon,
} from '@lucide/angular';
import { IconColor } from '../../../../shared/directives/icon-color';
import { ModalidadeCardContent } from '../../interfaces/modalidade-card-content';
import { BadgeModule } from 'primeng/badge';
import { CustomBadge } from '../../../../shared/directives/custom-badge';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { CustomProgressbar } from '../../../../shared/directives/custom-progressbar';
import { ToggleModalidadeDto } from '../../interfaces/toggle-modalidade-dto';

interface ToggleModalidadeButton {
  severity: ButtonSeverity;
  icon: LucideIcon;
}

@Component({
  selector: 'modalidade-card',
  host: {
    class:
      'flex flex-col items-center gap-2 bg-surface-card border border-border-default rounded-lg p-4 min-w-sm',
    '[class]':
      "!data().ativa ? 'bg-muted! bg-surface-subtle! border-dashed! border-border-muted! bg-surface-subtle!' : ''",
  },
  imports: [
    LucideDynamicIcon,
    IconColor,
    BadgeModule,
    CustomBadge,
    CustomProgressbar,
    InfoCard,
    ButtonModule,
    ProgressBarModule,
    LucidePencil,
    LucideLayers,
    LucideTrash2,
  ],
  templateUrl: './modalidade-card.html',
  styleUrl: './modalidade-card.css',
})
export class ModalidadeCard {
  readonly data = input.required<ModalidadeCardContent>();
  readonly statusModalidadeChange = output<ToggleModalidadeDto>();

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
  readonly computedOcupacao = computed<string>(() => {
    if (this.data().acolhidosAtivos <= 0) return '0%';
    if (this.data().acolhidosAtivos == this.data().totalVagas) return '100%';

    const porcentagem = (this.data().acolhidosAtivos / this.data().totalVagas) * 100;
    return `${Math.ceil(porcentagem).toString()}%`;
  });
  readonly computedAtivaIcon = computed<ToggleModalidadeButton>(() => {
    return {
      severity: this.data().ativa ? 'warn' : 'success',
      icon: this.data().ativa ? LucidePowerOff : LucidePower,
    };
  });

  toggleModalidade(): void {
    const dto: ToggleModalidadeDto = {
      id: this.data().id,
      ativa: !this.data().ativa,
    };

    this.statusModalidadeChange.emit(dto);
  }
}
