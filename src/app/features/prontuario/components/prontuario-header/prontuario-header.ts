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
  LucideMail,
  LucidePencil,
  LucidePhone,
  LucidePower,
  LucidePowerOff,
  LucideTrash2,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { BackButton } from '../../../../shared/components/back-button/back-button';
import { Card } from '../../../../shared/components/card/card';
import { IconColor } from '../../../../shared/directives/icon-color';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone-pipe';
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
    SkeletonModule,
    BackButton,
    Card,
    IconColor,
    ProfileColor,
    CpfPipe,
    SiglaNomePipe,
    TelefonePipe,
    LucideDynamicIcon,
    LucideCalendarCheck,
    LucideCalendarDays,
    LucideClock3,
    LucideFileText,
    LucideIdCard,
    LucideLayers,
    LucideLogOut,
    LucideMail,
    LucidePencil,
    LucidePhone,
    LucideTrash2,
  ],
  templateUrl: './prontuario-header.html',
  styleUrl: './prontuario-header.css',
})
export class ProntuarioHeader {
  readonly data = input<ProntuarioHeaderContent | null>(null);
  readonly loading = input(false);
  readonly statusChange = output<void>();
  readonly deleteRequest = output<void>();

  protected readonly actionButtonPt = {
    root: {
      class: 'w-full justify-center sm:w-auto',
    },
  };

  protected readonly estaAtivo = computed(() => this.data()?.ativo ?? false);

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
