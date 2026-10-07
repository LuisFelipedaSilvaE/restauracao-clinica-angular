import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCalendarCheck,
  LucideCalendarDays,
  LucideClock3,
  LucideDynamicIcon,
  LucideFileText,
  LucideIdCard,
  LucideLayers,
  LucideLogOut,
  LucidePencil,
  LucidePower,
  LucidePowerOff,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BackButton } from '../../../../shared/components/back-button/back-button';
import { Card } from '../../../../shared/components/card/card';
import { IconColor } from '../../../../shared/directives/icon-color';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { ProntuarioHeaderContent } from '../../interfaces/prontuario-header-content';

@Component({
  selector: 'prontuario-header',
  host: {
    class: 'flex min-w-0 flex-col gap-4',
  },
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TagModule,
    BackButton,
    Card,
    IconColor,
    ProfileColor,
    CpfPipe,
    SiglaNomePipe,
    LucideDynamicIcon,
    LucideCalendarCheck,
    LucideCalendarDays,
    LucideClock3,
    LucideFileText,
    LucideIdCard,
    LucideLayers,
    LucideLogOut,
    LucidePencil,
  ],
  templateUrl: './prontuario-header.html',
  styleUrl: './prontuario-header.css',
})
export class ProntuarioHeader {
  readonly data = input.required<ProntuarioHeaderContent>();
  readonly statusChange = output<void>();

  protected readonly actionButtonPt = {
    root: {
      class: 'w-full justify-center sm:w-auto',
    },
  };

  protected readonly estaAtivo = computed(() => this.data().status === 'Ativo');

  protected readonly toggleConfig = computed(() =>
    this.estaAtivo()
      ? {
          label: 'Inativar',
          severity: 'warn' as const,
          icon: LucidePowerOff,
        }
      : {
          label: 'Ativar',
          severity: 'success' as const,
          icon: LucidePower,
        },
  );
}
