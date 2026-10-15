import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  LucideCheck,
  LucideDoorOpen,
  LucideLayers,
  LucidePencil,
  LucidePower,
  LucidePowerOff,
  LucideHandCoins,
  LucidePaintBucket,
  LucideSquareDashedText,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

import { Card } from '../../../../shared/components/card/card';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { IconColor } from '../../../../shared/directives/icon-color';
import { Convenio } from '../../interfaces/convenio';
import { ConveniosService } from '../../services/convenios-service';
import { BadgeModule } from 'primeng/badge';
import { CustomBadge } from '../../../../shared/directives/custom-badge';
import { TagModule } from 'primeng/tag';
import { BackButton } from '../../../../shared/components/back-button/back-button';

const ACOLHIDOS_ATIVOS_MOCK = 10;

@Component({
  selector: 'app-convenio-detalhado',
  host: {
    class: 'mx-auto flex w-full flex-col gap-6',
  },
  imports: [
    ButtonModule,
    SkeletonModule,
    Card,
    ConfirmDialog,
    IconColor,
    RouterLink,
    LucideCheck,
    LucideDoorOpen,
    LucideLayers,
    LucidePencil,
    LucidePower,
    LucidePowerOff,
    LucideHandCoins,
    LucideSquareDashedText,
    LucidePaintBucket,
    BadgeModule,
    TagModule,
    CustomBadge,
    BackButton,
  ],
  templateUrl: './convenio-detalhado.html',
  styleUrl: './convenio-detalhado.css',
})
export class ConvenioDetalhado implements OnInit {
  readonly id = input<string>();

  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly conveniosService = inject(ConveniosService);

  protected readonly convenio = signal<Convenio | null>(null);
  protected readonly carregando = signal(false);
  protected readonly confirmarAlteracao = signal(false);
  protected readonly loading = this.conveniosService.loading;

  protected readonly statusLabel = computed(() => (this.convenio()?.ativo ? 'Ativo' : 'Inativo'));
  protected readonly pagamentoLabel = computed(() =>
    this.convenio()?.pagamento ? 'Obrigatório' : 'Não obrigatório',
  );
  protected readonly toggleLabel = computed(() =>
    this.convenio()?.ativo ? 'Inativar' : 'Ativar',
  );
  protected readonly toggleSeverity = computed<'danger' | 'success'>(() =>
    this.convenio()?.ativo ? 'danger' : 'success',
  );
  protected readonly tagSeverity = computed<'secondary' | 'success'>(() =>
    this.convenio()?.ativo ? 'success' : 'secondary',
  );
  protected readonly toggleMessage = computed(() =>
    this.convenio()?.ativo
      ? 'Deseja inativar este convênio? Ele deixará de ficar disponível.'
      : 'Deseja ativar este convênio? Ele voltará a ficar disponível.',
  );
  protected readonly acolhidosAtivos = computed(() => {
    const maxVagas = this.convenio()?.maxVagas ?? 0;
    return Math.min(ACOLHIDOS_ATIVOS_MOCK, maxVagas);
  });
  protected readonly vagasDisponiveis = computed(() =>
    Math.max(0, (this.convenio()?.maxVagas ?? 0) - this.acolhidosAtivos()),
  );

  ngOnInit(): void {
    const idNumerico = Number(this.id());

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      this.voltarParaLista();
      return;
    }

    this.carregando.set(true);

    this.conveniosService
      .getAllConvenios()
      .pipe(map((lista) => lista.find((convenio) => convenio.id === idNumerico)))
      .subscribe({
        next: (convenio) => {
          this.carregando.set(false);

          if (!convenio) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Convênio não encontrado',
              detail: 'O registro solicitado não existe ou foi removido.',
              life: 4000,
            });

            this.voltarParaLista();
            return;
          }

          this.convenio.set(convenio);
        },
        error: () => {
          this.carregando.set(false);
          this.voltarParaLista();
        },
      });
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/convenios']);
  }

  protected alterarStatus(): void {
    const convenio = this.convenio();
    if (!convenio) return;

    const proximoStatus = !convenio.ativo;
    const acao$ = proximoStatus
      ? this.conveniosService.activateConvenio(convenio.id)
      : this.conveniosService.deactivateConvenio(convenio.id);

    acao$.subscribe({
      next: () => {
        this.convenio.update((atual) => (atual ? { ...atual, ativo: proximoStatus } : null));
        this.confirmarAlteracao.set(false);
      },
    });
  }

  protected formatarCnpj(cnpj: string | null): string {
    if (!cnpj) return 'Não informado';

    const valor = cnpj.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (valor.length !== 14) return valor;

    return `${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5, 8)}/${valor.slice(8, 12)}-${valor.slice(12)}`;
  }
}
