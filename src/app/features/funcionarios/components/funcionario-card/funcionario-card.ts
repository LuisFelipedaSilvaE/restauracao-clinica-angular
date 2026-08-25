import { Component, computed, input } from '@angular/core';
import { FuncionarioCardContent } from '../../interfaces/funcionario-card-content';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { LucideCake, LucideMail, LucidePencil, LucidePhone, LucidePowerOff } from '@lucide/angular';
import { ProfileColor } from '../../../../shared/directives/profile-color';

@Component({
  selector: 'funcionario-card',
  host: {
    class:
      'group flex flex-col gap-3 rounded-xl border border-border-default bg-surface-card p-4 transition-colors hover:border-brand-primary/40 sm:flex-row sm:items-center',
  },
  imports: [
    ButtonModule,
    TagModule,
    CommonModule,
    LucideMail,
    LucidePhone,
    LucideCake,
    LucidePencil,
    LucidePowerOff,
    ProfileColor,
  ],
  templateUrl: './funcionario-card.html',
  styleUrl: './funcionario-card.css',
})
export class FuncionarioCard {
  readonly data = input.required<FuncionarioCardContent>();
  protected readonly activeConfig = computed<{
    severity: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined;
    label: string;
  }>(() => {
    return {
      severity: this.data().ativo ? 'success' : 'secondary',
      label: this.data().ativo ? 'Ativo' : 'Inativo',
    };
  });
}
