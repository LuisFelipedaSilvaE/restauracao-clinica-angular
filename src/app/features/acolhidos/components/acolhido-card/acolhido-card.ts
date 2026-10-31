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
  LucideTrash2,
} from '@lucide/angular';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { AcaoMenu } from '../../../../shared/interfaces/acao-menu';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone-pipe';
import { AcolhidoCardContent } from '../../interfaces/acolhido-card-content';
import { ToggleAcolhidoDto } from '../../interfaces/toggle-acolhido-dto';

@Component({
  selector: 'acolhido-card',
  host: {
    class:
      'border-y border-l-4 group relative grid min-w-0 grid-cols-[minmax(0,1fr)_36px] items-center gap-2 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)_36px] md:grid-cols-[minmax(0,240px)_repeat(2,minmax(0,1fr))_36px] xl:grid-cols-[minmax(0,240px)_repeat(3,minmax(0,1fr))_40px] xl:gap-3 2xl:gap-4 rounded-xl border border-border-default bg-surface-card p-3 2xl:p-4 transition-colors',
    '[class]':
      "!acolhido().ativo ? `bg-surface-subtle! border-2 border-dashed! border-border-muted! before:pointer-events-none before:content-[''] before:backdrop-blur-[.5px] before:h-full before:w-full before:absolute before:left-0 before:top-0` : ''",
    '[style.border-left-color]': "acolhido().internacaoAtual?.convenio?.cor ?? '#94a3b8'",
  },
  imports: [
    TagModule,
    CommonModule,
    LucideDynamicIcon,
    ProfileColor,
    SiglaNomePipe,
    MenuModule,
    LucideEllipsisVertical,
    CpfPipe,
    TelefonePipe,
  ],
  templateUrl: './acolhido-card.html',
  styleUrl: './acolhido-card.css',
})
export class AcolhidoCard {
  private readonly router = inject(Router);
  readonly acolhido = input.required<AcolhidoCardContent>();
  readonly statusAcolhidoChange = output<ToggleAcolhidoDto>();
  readonly excluirAcolhido = output<{ id: number; nome: string }>();
  protected readonly acoes = computed<AcaoMenu[]>(() => {
    const estaAtivo = this.acolhido().ativo;

    return [
      {
        label: 'Ver prontuário',
        lucideIcon: LucideEye,
        iconClass: 'h-4.5 w-4.5 text-action-info',
        command: () =>
          this.router.navigate(['/prontuarios', this.acolhido().id], {
            queryParams: { origem: 'acolhidos' },
          }),
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
        visible: estaAtivo && !!this.acolhido().internacaoAtual,
        lucideIcon: LucideLogOut,
        iconClass: 'h-4 w-4 text-action-success',
      },
      {
        label: estaAtivo ? 'Inativar' : 'Ativar',
        lucideIcon: estaAtivo ? LucidePowerOff : LucidePower,
        iconClass: estaAtivo ? 'h-4 w-4 text-action-warning' : 'h-4 w-4 text-action-success',
        command: () => this.toggleAcolhido(),
      },
      {
        label: 'Excluir',
        lucideIcon: LucideTrash2,
        iconClass: 'h-4 w-4 text-action-destructive -mt-[3.5px]',
        command: () =>
          this.excluirAcolhido.emit({
            id: this.acolhido().id,
            nome: this.acolhido().nome,
          }),
      },
    ];
  });

  toggleAcolhido(): void {
    const dto: ToggleAcolhidoDto = {
      id: this.acolhido().id,
      ativo: !this.acolhido().ativo,
    };

    this.statusAcolhidoChange.emit(dto);
  }
}
