import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  LucideArrowLeft,
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
import { Modalidade } from '../../interfaces/modalidade';
import { ModalidadesService } from '../../services/modalidades-service';

const ACOLHIDOS_ATIVOS_MOCK = 10;

@Component({
  selector: 'app-modalidade-detalhada',
  host: {
    class: 'mx-auto flex w-full max-w-2xl flex-col gap-6',
  },
  imports: [
    ButtonModule,
    SkeletonModule,
    Card,
    ConfirmDialog,
    IconColor,
    RouterLink,
    LucideArrowLeft,
    LucideCheck,
    LucideDoorOpen,
    LucideLayers,
    LucidePencil,
    LucidePower,
    LucidePowerOff,
    LucideHandCoins,
    LucideSquareDashedText,
    LucidePaintBucket,
  ],
  templateUrl: './modalidade-detalhada.html',
  styleUrl: './modalidade-detalhada.css',
})
export class ModalidadeDetalhada implements OnInit {
  readonly id = input<string>();

  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly modalidadesService = inject(ModalidadesService);

  protected readonly modalidade = signal<Modalidade | null>(null);
  protected readonly carregando = signal(false);
  protected readonly confirmarAlteracao = signal(false);
  protected readonly loading = this.modalidadesService.loading;

  protected readonly statusLabel = computed(() => (this.modalidade()?.ativo ? 'Ativa' : 'Inativa'));
  protected readonly pagamentoLabel = computed(() =>
    this.modalidade()?.pagamento ? 'Obrigatório' : 'Não obrigatório',
  );
  protected readonly toggleLabel = computed(() =>
    this.modalidade()?.ativo ? 'Inativar' : 'Ativar',
  );
  protected readonly toggleSeverity = computed<'danger' | 'success'>(() =>
    this.modalidade()?.ativo ? 'danger' : 'success',
  );
  protected readonly toggleMessage = computed(() =>
    this.modalidade()?.ativo
      ? 'Deseja inativar esta modalidade? Ela deixará de ficar disponível.'
      : 'Deseja ativar esta modalidade? Ela voltará a ficar disponível.',
  );
  protected readonly acolhidosAtivos = computed(() => {
    const maxVagas = this.modalidade()?.maxVagas ?? 0;
    return Math.min(ACOLHIDOS_ATIVOS_MOCK, maxVagas);
  });
  protected readonly vagasDisponiveis = computed(() =>
    Math.max(0, (this.modalidade()?.maxVagas ?? 0) - this.acolhidosAtivos()),
  );

  ngOnInit(): void {
    const idNumerico = Number(this.id());

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      this.voltarParaLista();
      return;
    }

    this.carregando.set(true);

    this.modalidadesService
      .getAllModalidades()
      .pipe(map((lista) => lista.find((modalidade) => modalidade.id === idNumerico)))
      .subscribe({
        next: (modalidade) => {
          this.carregando.set(false);

          if (!modalidade) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Modalidade não encontrada',
              detail: 'O registro solicitado não existe ou foi removido.',
              life: 4000,
            });

            this.voltarParaLista();
            return;
          }

          this.modalidade.set(modalidade);
        },
        error: () => {
          this.carregando.set(false);
          this.voltarParaLista();
        },
      });
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/modalidades']);
  }

  protected abrirConfirmacao(): void {
    this.confirmarAlteracao.set(true);
  }

  protected fecharConfirmacao(visivel: boolean): void {
    this.confirmarAlteracao.set(visivel);
  }

  protected alterarStatus(): void {
    const modalidade = this.modalidade();
    if (!modalidade) return;

    const proximoStatus = !modalidade.ativo;
    const acao$ = proximoStatus
      ? this.modalidadesService.activateModalidade(modalidade.id)
      : this.modalidadesService.deactivateModalidade(modalidade.id);

    acao$.subscribe({
      next: () => {
        this.modalidade.update((atual) => (atual ? { ...atual, ativo: proximoStatus } : null));
        this.fecharConfirmacao(false);
      },
      error: () => {},
    });
  }

  protected formatarCnpj(cnpj: string | null): string {
    if (!cnpj) return 'Não informado';

    const valor = cnpj.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (valor.length !== 14) return valor;

    return `${valor.slice(0, 2)}.${valor.slice(2, 5)}.${valor.slice(5, 8)}/${valor.slice(8, 12)}-${valor.slice(12)}`;
  }
}
