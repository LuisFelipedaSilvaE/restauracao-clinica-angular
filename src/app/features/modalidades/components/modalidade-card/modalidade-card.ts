import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideDoorOpen,
  LucideDynamicIcon,
  LucideUsersRound,
  LucidePencil,
  LucidePower,
  LucidePowerOff,
  LucideLayers,
  LucideIcon,
  LucideEye,
} from '@lucide/angular';
import { IconColor } from '../../../../shared/directives/icon-color';
import { ModalidadeCardContent } from '../../interfaces/modalidade-card-content';
import { BadgeModule } from 'primeng/badge';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleModalidadeDto } from '../../interfaces/toggle-modalidade-dto';
import { CustomProgressbar } from '../../../../shared/directives/custom-progressbar';
import { CustomBadge } from '../../../../shared/directives/custom-badge';
import { TooltipModule } from 'primeng/tooltip';

interface ToggleModalidadeButton {
  tooltipValue: string;
  severity: ButtonSeverity;
  icon: LucideIcon;
}

@Component({
  selector: 'modalidade-card',
  host: {
    class:
      'flex relative flex-col items-center gap-2 bg-surface-card border border-border-default rounded-lg p-4 min-w-sm overflow-hidden',
    '[class]':
      "!modalidade()?.ativo ? `bg-surface-subtle! border-2 border-dashed! border-border-muted! before:content-[''] before:backdrop-blur-[.5px] before:h-full before:w-full before:absolute before:top-0` : ''",
  },
  imports: [
    LucideDynamicIcon,
    IconColor,
    CustomProgressbar,
    CustomBadge,
    BadgeModule,
    InfoCard,
    ButtonModule,
    ProgressBarModule,
    LucidePencil,
    LucideLayers,
    TooltipModule,
    RouterLink,
    LucideEye,
  ],
  templateUrl: './modalidade-card.html',
  styleUrl: './modalidade-card.css',
})
export class ModalidadeCard {
  readonly modalidade = input.required<ModalidadeCardContent>();
  readonly showActions = input(true);
  readonly statusModalidadeChange = output<ToggleModalidadeDto>();
  readonly computedInfoCards = computed<InfoCardContent[]>(() => {
    const card1 = {
      value: this.modalidade().acolhidosAtivos,
      label: 'Acolhidos ativos',
      icon: LucideUsersRound,
      color: '#4a5565',
    };
    const card2 = {
      value: this.modalidade().maxVagas - this.modalidade().acolhidosAtivos,
      label: 'Vagas disponíveis',
      icon: LucideDoorOpen,
      color: '#00a63e',
    };
    return [card1, card2];
  });
  readonly computedOcupacao = computed<number>(() => {
    if (this.modalidade().acolhidosAtivos <= 0) return 0;
    if (this.modalidade().acolhidosAtivos == this.modalidade().maxVagas) return 100;

    const porcentagem = (this.modalidade().acolhidosAtivos / this.modalidade().maxVagas) * 100;
    return Math.ceil(porcentagem);
  });
  readonly computedModalidadeAtivaBtn = computed<ToggleModalidadeButton>(() => {
    const ativo = this.modalidade().ativo;

    return {
      tooltipValue: ativo ? 'Desativar modalidade' : 'Ativar modalidade',
      severity: ativo ? 'warn' : 'success',
      icon: ativo ? LucidePowerOff : LucidePower,
    };
  });

  toggleModalidade(): void {
    const dto: ToggleModalidadeDto = {
      id: this.modalidade().id,
      ativo: !this.modalidade().ativo,
    };

    this.statusModalidadeChange.emit(dto);
  }
}
