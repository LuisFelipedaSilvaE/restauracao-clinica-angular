import { Location } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import {
  LucideArrowLeft,
  LucideHouse,
  LucideLogOut,
  LucideMapPinXInside,
  LucideShieldX,
} from '@lucide/angular';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth-service';

type ErrorStatus = 403 | 404;

@Component({
  selector: 'app-error-page',
  imports: [
    ButtonModule,
    RouterLink,
    LucideArrowLeft,
    LucideHouse,
    LucideLogOut,
    LucideMapPinXInside,
    LucideShieldX,
  ],
  host: {
    class: 'flex min-h-screen items-center justify-center p-8',
  },
  templateUrl: './error-page.html',
  styleUrl: './error-page.css',
})
export class ErrorPage {
  readonly status = input<ErrorStatus>(404);

  protected readonly location = inject(Location);
  protected readonly authService = inject(AuthService);

  private readonly errorContent: Record<ErrorStatus, { title: string; description: string }> = {
    403: {
      title: 'Você não tem acesso a esta página',
      description:
        'Sua conta não possui permissão para acessar este conteúdo. Volte à página anterior ou entre com outra conta.',
    },
    404: {
      title: 'Não encontramos esse endereço',
      description:
        'A página que você tentou acessar não existe ou foi movida. Confira o link ou volte para uma área conhecida do sistema.',
    },
  };

  protected readonly content = computed(() => this.errorContent[this.status()]);
}
