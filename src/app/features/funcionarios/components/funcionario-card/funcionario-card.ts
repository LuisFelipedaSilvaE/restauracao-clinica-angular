import { Component, computed, inject, input, output } from '@angular/core';
import { FuncionarioCardContent } from '../../interfaces/funcionario-card-content';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import {
  LucideDynamicIcon,
  LucideEllipsisVertical,
  LucideEye,
  LucidePencil,
  LucidePower,
  LucidePowerOff,
} from '@lucide/angular';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { Router } from '@angular/router';
import { ToggleFuncionarioDto } from '../../interfaces/toggle-funcionario-dto';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone-pipe';
import { MenuModule } from 'primeng/menu';
import { AcaoMenu } from '../../../../shared/interfaces/acao-menu';
import { localDateToDate } from '../../../../shared/utils/local-date';

@Component({
  selector: 'funcionario-card',
  host: {
    class:
      'group relative grid min-w-0 grid-cols-[minmax(0,1fr)_36px] items-center gap-2 rounded-xl border border-border-default bg-surface-card p-3 transition-colors sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)_36px] md:grid-cols-[minmax(0,240px)_repeat(2,minmax(0,1fr))_36px] xl:grid-cols-[minmax(0,240px)_repeat(3,minmax(0,1fr))_40px] xl:gap-3 2xl:gap-4 2xl:p-4',
    '[class]':
      "!funcionario().ativo ? `bg-surface-subtle! border-2 border-dashed! border-border-muted! before:pointer-events-none before:content-[''] before:backdrop-blur-[.5px] before:h-full before:w-full before:absolute before:left-0 before:top-0` : ''",
  },
  imports: [
    TagModule,
    CommonModule,
    LucideDynamicIcon,
    ProfileColor,
    SiglaNomePipe,
    CpfPipe,
    TelefonePipe,
    MenuModule,
    LucideEllipsisVertical,
  ],
  templateUrl: './funcionario-card.html',
  styleUrl: './funcionario-card.css',
})
export class FuncionarioCard {
  private readonly router = inject(Router);
  readonly funcionario = input.required<FuncionarioCardContent>();
  readonly statusFuncionarioChange = output<ToggleFuncionarioDto>();
  protected readonly idade = computed(() => {
    const hoje = new Date();
    const nascimento = localDateToDate(this.funcionario().dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const aniversarioAindaNaoOcorreu =
      hoje.getMonth() < nascimento.getMonth() ||
      (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

    if (aniversarioAindaNaoOcorreu) idade--;
    return idade;
  });
  protected readonly acoes = computed<AcaoMenu[]>(() => {
    const estaAtivo = this.funcionario().ativo;

    return [
      {
        label: 'Ver detalhes',
        lucideIcon: LucideEye,
        iconClass: 'h-4.5 w-4.5 text-action-info',
        command: () => this.router.navigate(['/funcionarios', this.funcionario().id]),
      },
      {
        label: 'Editar dados',
        visible: estaAtivo,
        lucideIcon: LucidePencil,
        iconClass: 'h-4 w-4 text-action-secondary-text',
        command: () => this.router.navigate(['/funcionarios', this.funcionario().id, 'editar']),
      },
      {
        label: estaAtivo ? 'Inativar' : 'Ativar',
        lucideIcon: estaAtivo ? LucidePowerOff : LucidePower,
        iconClass: estaAtivo ? 'h-4 w-4 text-action-warning' : 'h-4 w-4 text-action-success',
        command: () => this.toggleFuncionario(),
      },
    ];
  });

  toggleFuncionario(): void {
    const dto: ToggleFuncionarioDto = {
      id: this.funcionario().id,
      ativo: !this.funcionario().ativo,
    };

    this.statusFuncionarioChange.emit(dto);
  }
}
