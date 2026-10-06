import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideEllipsisVertical,
  LucideEye,
  LucideLogOut,
  LucidePencil,
  LucidePower,
  LucidePowerOff,
} from '@lucide/angular';
import { TagModule } from 'primeng/tag';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { AcolhidoCardContent } from '../../interfaces/acolhido-card-content';
import { MenuModule } from 'primeng/menu';
import { AcaoMenu } from '../../interfaces/acao-menu';
import { ToggleAcolhidoDto } from '../../interfaces/toggle-acolhido-dto';

@Component({
  selector: 'acolhido-card',
  host: {
    class:
      'border-y border-l-4 border-l-sky-500 group relative grid min-w-0 grid-cols-[minmax(0,1fr)_36px] items-center gap-2 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)_36px] md:grid-cols-[minmax(0,240px)_repeat(2,minmax(0,1fr))_36px] xl:grid-cols-[minmax(0,240px)_repeat(3,minmax(0,1fr))_36px] 2xl:grid-cols-[minmax(0,240px)_repeat(4,minmax(0,1fr))_40px] xl:gap-3 2xl:gap-4 rounded-xl border border-border-default bg-surface-card p-3 2xl:p-4 transition-colors',
    '[class]':
      "acolhido().status == 'Inativo' ? `bg-surface-subtle! border-2 border-dashed! border-border-muted! before:pointer-events-none before:content-[''] before:backdrop-blur-[.5px] before:h-full before:w-full before:absolute before:left-0 before:top-0` : ''",
    '[style.border-left-color]': 'acolhido().modalidade.cor',
  },
  imports: [
    TagModule,
    CommonModule,
    LucideDynamicIcon,
    ProfileColor,
    SiglaNomePipe,
    MenuModule,
    LucideEllipsisVertical,
  ],
  templateUrl: './acolhido-card.html',
  styleUrl: './acolhido-card.css',
})
export class AcolhidoCard {
  private readonly router = inject(Router);
  readonly acolhido = input.required<AcolhidoCardContent>();
  readonly statusAcolhidoChange = output<ToggleAcolhidoDto>();
  protected readonly acoes = computed<AcaoMenu[]>(() => {
    const estaAtivo = this.acolhido().status === 'Ativo';

    return [
      {
        label: 'Ver prontuário',
        lucideIcon: LucideEye,
        iconClass: 'h-4.5 w-4.5 text-action-info',
      },
      {
        label: 'Editar dados',
        visible: estaAtivo,
        lucideIcon: LucidePencil,
        iconClass: 'h-4 w-4 text-action-secondary-text',
        command: () => this.router.navigate(['/acolhidos', this.acolhido().id, 'editar']),
      },
      {
        label: 'Registrar alta',
        lucideIcon: LucideLogOut,
        iconClass: 'h-4 w-4 text-action-success',
      },
      {
        label: estaAtivo ? 'Inativar' : 'Ativar',
        lucideIcon: estaAtivo ? LucidePowerOff : LucidePower,
        iconClass: estaAtivo ? 'h-4 w-4 text-action-warning' : 'h-4 w-4 text-action-success',
        command: () => this.toggleAcolhido(),
      },
    ];
  });

  toggleAcolhido(): void {
    const dto: ToggleAcolhidoDto = {
      id: this.acolhido().id,
      ativo: this.acolhido().status === 'Ativo' ? 'Inativo' : 'Ativo',
    };

    this.statusAcolhidoChange.emit(dto);
  }
}
