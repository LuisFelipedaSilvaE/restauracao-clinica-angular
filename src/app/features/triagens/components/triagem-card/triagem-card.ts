import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideCalendarClock,
  LucideCircleCheckBig,
  LucideEye,
  LucidePencil,
  LucidePower,
  LucidePowerOff,
  LucideRotateCcwClock,
  LucideTrash2,
} from '@lucide/angular';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../../core/services/auth-service';
import { ActionMenu } from '../../../../shared/components/action-menu/action-menu';
import { Card } from '../../../../shared/components/card/card';
import { CustomTag } from '../../../../shared/directives/custom-tag';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { AcaoMenu } from '../../../../shared/interfaces/acao-menu';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { isSameLocalDate } from '../../../../shared/utils/local-date-time';
import { Triagem } from '../../interfaces/triagem';
import { StatusTriagem } from '../../enums/status-triagem';
import { ToggleTriagemDto } from '../../interfaces/toggle-triagem-dto';

@Component({
  selector: 'triagem-card',
  imports: [ActionMenu, TagModule, CommonModule, ProfileColor, SiglaNomePipe, Card, CustomTag],
  templateUrl: './triagem-card.html',
  styleUrl: './triagem-card.css',
})
export class TriagemCard {
  readonly triagem = input.required<Triagem>();
  readonly dataReferencia = input.required<Date>();
  readonly concluirTriagem = output<{ id: number; nome: string }>();
  readonly reabrirTriagem = output<{ id: number; nome: string }>();
  readonly reagendarTriagem = output<Triagem>();
  readonly excluirTriagem = output<{ id: number; nome: string }>();
  readonly statusTriagemChange = output<ToggleTriagemDto>();
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  protected readonly isAdmin = this.authService.hasRole('ADMIN');
  protected readonly agendadaHoje = computed(
    () =>
      this.triagem().triagemStatus !== StatusTriagem.CONCLUIDA &&
      this.triagem().ativo &&
      isSameLocalDate(this.triagem().dataAgendada, this.dataReferencia()),
  );
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
        visible: this.triagem().ativo && this.triagem().triagemStatus !== StatusTriagem.CONCLUIDA,
        lucideIcon: LucidePencil,
        iconClass: 'h-4 w-4 text-action-secondary-text',
        command: () => this.router.navigate(['/triagens', this.triagem().id, 'editar']),
      },
      {
        label: 'Reagendar triagem',
        visible:
          this.triagem().ativo &&
          (this.triagem().triagemStatus === StatusTriagem.AGENDADA ||
            this.triagem().triagemStatus === StatusTriagem.ATRASADA),
        lucideIcon: LucideCalendarClock,
        iconClass: 'h-4 w-4 text-action-info',
        command: () => this.reagendarTriagem.emit(this.triagem()),
      },
      {
        label: 'Concluir triagem',
        visible:
          this.triagem().ativo &&
          (this.triagem().triagemStatus === StatusTriagem.AGENDADA ||
            this.triagem().triagemStatus === StatusTriagem.ATRASADA),
        lucideIcon: LucideCircleCheckBig,
        iconClass: 'h-4 w-4 text-action-success',
        command: () =>
          this.concluirTriagem.emit({
            id: this.triagem().id,
            nome: this.triagem().nomePossivelAcolhido,
          }),
      },
      {
        label: 'Reabrir triagem',
        visible: this.triagem().ativo && this.triagem().triagemStatus === StatusTriagem.CONCLUIDA,
        lucideIcon: LucideRotateCcwClock,
        iconClass: 'h-4 w-4 text-action-warning',
        command: () =>
          this.reabrirTriagem.emit({
            id: this.triagem().id,
            nome: this.triagem().nomePossivelAcolhido,
          }),
      },
      {
        label: this.triagem().ativo ? 'Inativar' : 'Ativar',
        lucideIcon: this.triagem().ativo ? LucidePowerOff : LucidePower,
        iconClass: this.triagem().ativo
          ? 'h-4 w-4 text-action-warning'
          : 'h-4 w-4 text-action-success',
        command: () =>
          this.statusTriagemChange.emit({
            id: this.triagem().id,
            ativo: !this.triagem().ativo,
          }),
      },
      {
        label: 'Excluir',
        visible: this.isAdmin,
        lucideIcon: LucideTrash2,
        iconClass: 'h-4 w-4 text-action-destructive -mt-[3.5px]',
        command: () =>
          this.excluirTriagem.emit({
            id: this.triagem().id,
            nome: this.triagem().nomePossivelAcolhido,
          }),
      },
    ];
  });
}
