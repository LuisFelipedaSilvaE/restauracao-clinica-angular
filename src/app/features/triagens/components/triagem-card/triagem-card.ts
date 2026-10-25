import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideCircleCheckBig,
  LucideEllipsisVertical,
  LucideEye,
  LucidePencil,
} from '@lucide/angular';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { Card } from '../../../../shared/components/card/card';
import { CustomTag } from '../../../../shared/directives/custom-tag';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { AcaoMenu } from '../../../../shared/interfaces/acao-menu';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { Triagem } from '../../interfaces/triagem';
import { StatusTriagem } from '../../enums/status-triagem';

@Component({
  selector: 'triagem-card',
  imports: [
    LucideDynamicIcon,
    TagModule,
    CommonModule,
    ProfileColor,
    SiglaNomePipe,
    MenuModule,
    LucideEllipsisVertical,
    Card,
    CustomTag,
  ],
  templateUrl: './triagem-card.html',
  styleUrl: './triagem-card.css',
})
export class TriagemCard {
  readonly triagem = input.required<Triagem>();
  readonly concluirTriagem = output<{ id: number; nome: string }>();
  private readonly router = inject(Router);
  protected readonly acoes = computed<AcaoMenu[]>(() => {
    return [
      {
        label: 'Ver detalhes',
        lucideIcon: LucideEye,
        iconClass: 'h-4.5 w-4.5 text-action-info',
        command: () => this.router.navigate(['/triagens', this.triagem().id]),
      },
      {
        label: 'Editar dados',
        lucideIcon: LucidePencil,
        iconClass: 'h-4 w-4 text-action-secondary-text',
        command: () => this.router.navigate(['/triagens', this.triagem().id, 'editar']),
      },
      {
        label: 'Concluir triagem',
        visible:
          this.triagem().status === StatusTriagem.AGENDADA ||
          this.triagem().status === StatusTriagem.ATRASADA,
        lucideIcon: LucideCircleCheckBig,
        iconClass: 'h-4 w-4 text-action-success',
        command: () =>
          this.concluirTriagem.emit({
            id: this.triagem().id,
            nome: this.triagem().nomePossivelAcolhido,
          }),
      },
    ];
  });
}
