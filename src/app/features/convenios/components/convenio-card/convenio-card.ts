import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideDoorOpen,
  LucideEye,
  LucideLayers,
  LucidePencil,
  LucidePower,
  LucidePowerOff,
  LucideTrash2,
  LucideUsersRound,
} from '@lucide/angular';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { AuthService } from '../../../../core/services/auth-service';
import { ActionMenu } from '../../../../shared/components/action-menu/action-menu';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { CustomBadge } from '../../../../shared/directives/custom-badge';
import { CustomProgressbar } from '../../../../shared/directives/custom-progressbar';
import { IconColor } from '../../../../shared/directives/icon-color';
import { AcaoMenu } from '../../../../shared/interfaces/acao-menu';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { ConvenioCardContent } from '../../interfaces/convenio-card-content';
import { ToggleConvenioDto } from '../../interfaces/toggle-convenio-dto';

@Component({
  selector: 'convenio-card',
  host: {
    class:
      'relative flex w-full min-w-0 flex-col items-center gap-3 overflow-hidden rounded-lg border border-border-default bg-surface-card p-3 sm:p-4',
    '[class]':
      "!convenio()?.ativo ? `bg-surface-subtle! border-2 border-dashed! border-border-muted! before:pointer-events-none before:content-[''] before:backdrop-blur-[.5px] before:h-full before:w-full before:absolute before:left-0 before:top-0` : ''",
  },
  imports: [
    ActionMenu,
    IconColor,
    CustomProgressbar,
    CustomBadge,
    BadgeModule,
    InfoCard,
    ProgressBarModule,
    LucideLayers,
  ],
  templateUrl: './convenio-card.html',
  styleUrl: './convenio-card.css',
})
export class ConvenioCard {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  protected readonly isAdmin = this.authService.hasRole('ADMIN');

  readonly convenio = input.required<ConvenioCardContent>();
  readonly showActions = input(true);
  readonly statusConvenioChange = output<ToggleConvenioDto>();
  readonly excluirConvenio = output<{ id: number; nome: string }>();
  readonly computedInfoCards = computed<InfoCardContent[]>(() => {
    const card1 = {
      value: this.convenio().acolhidosAtivos,
      label: 'Acolhidos ativos',
      icon: LucideUsersRound,
      color: '#4a5565',
    };
    const card2 = {
      value: Math.max(0, this.convenio().maxVagas - this.convenio().acolhidosAtivos),
      label: 'Vagas disponíveis',
      icon: LucideDoorOpen,
      color: '#00a63e',
    };
    return [card1, card2];
  });
  readonly computedOcupacao = computed<number>(() => {
    if (this.convenio().maxVagas <= 0) return 0;
    if (this.convenio().acolhidosAtivos <= 0) return 0;
    if (this.convenio().acolhidosAtivos >= this.convenio().maxVagas) return 100;

    const porcentagem = (this.convenio().acolhidosAtivos / this.convenio().maxVagas) * 100;
    return Math.ceil(porcentagem);
  });

  protected readonly acoes = computed<AcaoMenu[]>(() => {
    const convenio = this.convenio();

    return [
      {
        label: 'Visualizar convênio',
        lucideIcon: LucideEye,
        iconClass: 'h-4.5 w-4.5 text-action-info',
        command: () => this.router.navigate(['/convenios', convenio.id]),
      },
      {
        label: 'Editar convênio',
        visible: convenio.ativo,
        lucideIcon: LucidePencil,
        iconClass: 'h-4 w-4 text-action-secondary-text',
        command: () => this.router.navigate(['/convenios', convenio.id, 'editar']),
      },
      {
        label: convenio.ativo ? 'Desativar convênio' : 'Ativar convênio',
        visible: this.isAdmin,
        lucideIcon: convenio.ativo ? LucidePowerOff : LucidePower,
        iconClass: convenio.ativo
          ? 'h-4 w-4 text-action-warning'
          : 'h-4 w-4 text-action-success',
        command: () => this.toggleConvenio(),
      },
      {
        label: 'Excluir convênio',
        visible: this.isAdmin,
        lucideIcon: LucideTrash2,
        iconClass: 'h-4 w-4 text-action-destructive mt-[-3.5px]',
        command: () => this.solicitarExclusao(),
      },
    ];
  });

  toggleConvenio(): void {
    if (!this.isAdmin) return;

    const dto: ToggleConvenioDto = {
      id: this.convenio().id,
      ativo: !this.convenio().ativo,
    };

    this.statusConvenioChange.emit(dto);
  }

  solicitarExclusao(): void {
    if (!this.isAdmin) return;

    this.excluirConvenio.emit({
      id: this.convenio().id,
      nome: this.convenio().descricao,
    });
  }
}
