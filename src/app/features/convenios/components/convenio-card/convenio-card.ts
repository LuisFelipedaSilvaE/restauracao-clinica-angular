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
import { ConvenioCardContent } from '../../interfaces/convenio-card-content';
import { BadgeModule } from 'primeng/badge';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleConvenioDto } from '../../interfaces/toggle-convenio-dto';
import { CustomProgressbar } from '../../../../shared/directives/custom-progressbar';
import { CustomBadge } from '../../../../shared/directives/custom-badge';
import { TooltipModule } from 'primeng/tooltip';

interface ToggleConvenioButton {
  tooltipValue: string;
  severity: ButtonSeverity;
  icon: LucideIcon;
}

@Component({
  selector: 'convenio-card',
  host: {
    class:
      'flex relative flex-col items-center gap-2 bg-surface-card border border-border-default rounded-lg p-4 min-w-sm overflow-hidden',
    '[class]':
      "!convenio()?.ativo ? `bg-surface-subtle! border-2 border-dashed! border-border-muted! before:content-[''] before:backdrop-blur-[.5px] before:h-full before:w-full before:absolute before:top-0` : ''",
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
  templateUrl: './convenio-card.html',
  styleUrl: './convenio-card.css',
})
export class ConvenioCard {
  readonly convenio = input.required<ConvenioCardContent>();
  readonly showActions = input(true);
  readonly statusConvenioChange = output<ToggleConvenioDto>();
  readonly computedInfoCards = computed<InfoCardContent[]>(() => {
    const card1 = {
      value: this.convenio().acolhidosAtivos,
      label: 'Acolhidos ativos',
      icon: LucideUsersRound,
      color: '#4a5565',
    };
    const card2 = {
      value: this.convenio().maxVagas - this.convenio().acolhidosAtivos,
      label: 'Vagas disponíveis',
      icon: LucideDoorOpen,
      color: '#00a63e',
    };
    return [card1, card2];
  });
  readonly computedOcupacao = computed<number>(() => {
    if (this.convenio().acolhidosAtivos <= 0) return 0;
    if (this.convenio().acolhidosAtivos == this.convenio().maxVagas) return 100;

    const porcentagem = (this.convenio().acolhidosAtivos / this.convenio().maxVagas) * 100;
    return Math.ceil(porcentagem);
  });
  readonly computedConvenioAtivoBtn = computed<ToggleConvenioButton>(() => {
    const ativo = this.convenio().ativo;

    return {
      tooltipValue: ativo ? 'Desativar convênio' : 'Ativar convênio',
      severity: ativo ? 'warn' : 'success',
      icon: ativo ? LucidePowerOff : LucidePower,
    };
  });

  toggleConvenio(): void {
    const dto: ToggleConvenioDto = {
      id: this.convenio().id,
      ativo: !this.convenio().ativo,
    };

    this.statusConvenioChange.emit(dto);
  }
}
