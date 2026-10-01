import { Component, computed, inject, input, output } from '@angular/core';
import { FuncionarioCardContent } from '../../interfaces/funcionario-card-content';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import {
  LucideCake,
  LucideDynamicIcon,
  LucideEye,
  LucideMail,
  LucidePencil,
  LucidePhone,
  LucidePower,
  LucidePowerOff,
} from '@lucide/angular';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { FuncionarioActiveConfig } from '../../interfaces/funcionario-active-config';
import { FuncionariosService } from '../../services/funcionarios-service';
import { TooltipModule } from 'primeng/tooltip';
import { Router, RouterLink } from '@angular/router';
import { ToggleFuncionarioDto } from '../../interfaces/toggle-funcionario-dto';

@Component({
  selector: 'funcionario-card',
  host: {
    class:
      'group flex flex-col gap-3 rounded-xl border border-border-default bg-surface-card p-4 transition-colors sm:flex-row sm:items-center relative',
    '[class]':
      "!funcionario().ativo ? `bg-muted! bg-surface-subtle! border-2 border-dashed! border-border-muted! bg-surface-subtle! before:content-[''] before:backdrop-blur-[.5px] before:h-full before:w-full before:absolute before:left-0 before:top-0` : ''",
  },
  imports: [
    ButtonModule,
    TagModule,
    TooltipModule,
    CommonModule,
    LucideDynamicIcon,
    LucideMail,
    LucidePhone,
    LucideCake,
    LucidePencil,
    LucideEye,
    ProfileColor,
    SiglaNomePipe,
    RouterLink,
  ],
  templateUrl: './funcionario-card.html',
  styleUrl: './funcionario-card.css',
})
export class FuncionarioCard {
  private readonly funcionariosService = inject(FuncionariosService);
  private readonly router = inject(Router);
  readonly funcionario = input.required<FuncionarioCardContent>();
  readonly statusFuncionarioChange = output<ToggleFuncionarioDto>();
  protected activeConfig = computed<FuncionarioActiveConfig>(() => {
    return {
      button: {
        severity: this.funcionario()!.ativo ? 'warn' : 'success',
        icon: this.funcionario()!.ativo ? LucidePowerOff : LucidePower,
      },
      severity: this.funcionario()!.ativo ? 'success' : 'secondary',
      label: this.funcionario()!.ativo ? 'Ativo' : 'Inativo',
      tooltipValue: this.funcionario()!.ativo ? 'Inativar Funcionário' : 'Ativar Funcionário',
    };
  });

  toggleFuncionario(): void {
    const dto: ToggleFuncionarioDto = {
      id: this.funcionario().id,
      ativo: !this.funcionario().ativo,
    };

    this.statusFuncionarioChange.emit(dto);
  }

  seeDetails(): void {
    this.router.navigate(['/funcionarios', this.funcionario().id]);
  }
}
