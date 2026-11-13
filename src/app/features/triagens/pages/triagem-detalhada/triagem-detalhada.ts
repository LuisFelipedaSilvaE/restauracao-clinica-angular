import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  LucideCalendar,
  LucideCalendarCheck,
  LucideCalendarClock,
  LucideCalendarX2,
  LucideCircleCheckBig,
  LucideHandshake,
  LucidePencil,
  LucidePhone,
  LucideRotateCcwClock,
  LucideTrash2,
} from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { interval, map } from 'rxjs';
import { BackButton } from '../../../../shared/components/back-button/back-button';
import { Card } from '../../../../shared/components/card/card';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { DetailInfoField } from '../../../../shared/components/detail-info-field/detail-info-field';
import { CustomTag } from '../../../../shared/directives/custom-tag';
import { IconColor } from '../../../../shared/directives/icon-color';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone-pipe';
import { TriagemReagendamentoForm } from '../../components/triagem-reagendamento-form/triagem-reagendamento-form';
import { Triagem } from '../../interfaces/triagem';
import { TriagensService } from '../../services/triagens-service';
import { AuthService } from '../../../../core/services/auth-service';

type AcaoTriagem = 'concluir' | 'reabrir' | 'cancelar' | 'descancelar' | 'excluir';

@Component({
  selector: 'app-triagem-detalhada',
  host: {
    class: 'flex flex-col gap-6',
  },
  imports: [
    Card,
    LucidePencil,
    LucideTrash2,
    ButtonModule,
    TagModule,
    RouterLink,
    SiglaNomePipe,
    TelefonePipe,
    ProfileColor,
    CustomTag,
    IconColor,
    CommonModule,
    DividerModule,
    SkeletonModule,
    LucideHandshake,
    LucidePhone,
    LucideCalendar,
    LucideCalendarCheck,
    LucideCalendarClock,
    LucideCalendarX2,
    LucideCircleCheckBig,
    LucideRotateCcwClock,
    BackButton,
    ConfirmDialog,
    DetailInfoField,
    TriagemReagendamentoForm,
  ],
  templateUrl: './triagem-detalhada.html',
  styleUrl: './triagem-detalhada.css',
})
export class TriagemDetalhada {
  protected readonly actionButtonPt = {
    root: {
      class: 'w-full justify-center sm:w-auto',
    },
  };
  protected readonly id = input<string>();
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  protected readonly isAdmin = this.authService.hasRole('ADMIN');
  protected readonly triagem = signal<Triagem | undefined>(undefined);
  protected readonly carregando = signal(false);
  protected readonly dialogConfirmVisible = signal(false);
  protected readonly acaoPendente = signal<AcaoTriagem | null>(null);
  protected readonly reagendamentoDialogVisible = signal(false);
  private readonly triagensService = inject(TriagensService);
  protected readonly loading = this.triagensService.loading;
  protected readonly agora = toSignal(interval(60_000).pipe(map(() => new Date())), {
    initialValue: new Date(),
  });
  protected readonly mutationLoading = computed(() => this.loading().mutation);
  protected readonly podeAlterar = computed(() => {
    const status = this.triagem()?.status;
    return status === 'AGENDADA' || status === 'ATRASADA';
  });
  protected readonly podeConcluir = computed(() => {
    const triagem = this.triagem();
    return !!triagem && this.podeAlterar() && new Date(triagem.dataAgendada) <= this.agora();
  });
  protected readonly podeReabrir = computed(() => this.triagem()?.status === 'CONCLUIDA');
  protected readonly podeDescancelar = computed(() => this.triagem()?.status === 'CANCELADA');
  protected readonly confirmTitle = computed(() => {
    const acao = this.acaoPendente();

    if (acao === 'reabrir') return 'Reabrir triagem';
    if (acao === 'cancelar') return 'Cancelar triagem';
    if (acao === 'descancelar') return 'Descancelar triagem';
    if (acao === 'excluir') return 'Excluir triagem';
    return 'Concluir triagem';
  });
  protected readonly confirmMessage = computed(() => {
    const triagem = this.triagem();
    const acao = this.acaoPendente();
    if (!triagem || !acao) return '';

    if (acao === 'concluir') {
      return `Deseja concluir a triagem de ${triagem.nomePossivelAcolhido}? A data de conclusão será registrada automaticamente.`;
    }

    if (acao === 'reabrir') {
      return `Deseja reabrir a triagem de ${triagem.nomePossivelAcolhido}? Ela voltará para agendada ou atrasada conforme a data do agendamento.`;
    }

    if (acao === 'cancelar') {
      return `Deseja cancelar a triagem de ${triagem.nomePossivelAcolhido}? Ela poderá ser descancelada posteriormente.`;
    }

    if (acao === 'descancelar') {
      return `Deseja descancelar a triagem de ${triagem.nomePossivelAcolhido}? A situação será recalculada conforme a data agendada.`;
    }

    return `Deseja excluir a triagem de ${triagem.nomePossivelAcolhido}? Esta ação não poderá ser desfeita.`;
  });
  protected readonly confirmLabel = computed(() => {
    const acao = this.acaoPendente();
    if (acao === 'reabrir') return 'Reabrir';
    if (acao === 'cancelar') return 'Cancelar';
    if (acao === 'descancelar') return 'Descancelar';
    if (acao === 'excluir') return 'Excluir';
    return 'Concluir';
  });
  protected readonly confirmSeverity = computed<'success' | 'primary' | 'danger'>(() => {
    const acao = this.acaoPendente();
    if (acao === 'reabrir') return 'primary';
    if (acao === 'descancelar') return 'primary';
    if (acao === 'excluir' || acao === 'cancelar') return 'danger';
    return 'success';
  });
  protected readonly statusTagSeverity = computed(() => {
    const triagem = this.triagem();

    if (!triagem) return '';

    const config: Record<string, string> = {
      agendada: 'info',
      pendente: 'warn',
      atrasada: 'error',
      concluida: 'success',
      cancelada: 'secondary',
    };

    return config[triagem.status.toLowerCase()];
  });
  protected readonly statusTagLabel = computed(() => {
    const status = this.triagem()?.status;
    if (!status) return '';

    const labels: Record<string, string> = {
      AGENDADA: 'Agendada',
      ATRASADA: 'Atrasada',
      CONCLUIDA: 'Concluída',
      CANCELADA: 'Cancelada',
    };

    return labels[status] ?? status;
  });

  constructor() {
    effect((onCleanup) => {
      const id = Number(this.id());

      if (!Number.isSafeInteger(id) || id <= 0) {
        this.router.navigate(['/triagens']);
        return;
      }

      this.triagem.set(undefined);
      this.carregando.set(true);
      this.dialogConfirmVisible.set(false);
      this.reagendamentoDialogVisible.set(false);
      this.acaoPendente.set(null);

      const subscription = this.triagensService.getTriagemById(id).subscribe({
        next: (triagem) => {
          this.carregando.set(false);
          this.triagem.set(triagem);
        },
        error: () => {
          this.carregando.set(false);
          this.router.navigate(['/triagens']);
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected solicitarConclusao(): void {
    if (!this.podeConcluir()) return;

    this.acaoPendente.set('concluir');
    this.dialogConfirmVisible.set(true);
  }

  protected solicitarReabertura(): void {
    if (!this.podeReabrir()) return;

    this.acaoPendente.set('reabrir');
    this.dialogConfirmVisible.set(true);
  }

  protected solicitarReagendamento(): void {
    if (!this.podeAlterar()) return;

    this.reagendamentoDialogVisible.set(true);
  }

  protected solicitarExclusao(): void {
    if (!this.triagem() || !this.isAdmin) return;

    this.acaoPendente.set('excluir');
    this.dialogConfirmVisible.set(true);
  }

  protected solicitarCancelamento(): void {
    if (!this.podeAlterar()) return;
    this.acaoPendente.set('cancelar');
    this.dialogConfirmVisible.set(true);
  }

  protected solicitarDescancelamento(): void {
    if (!this.podeDescancelar()) return;
    this.acaoPendente.set('descancelar');
    this.dialogConfirmVisible.set(true);
  }

  protected confirmarAcao(): void {
    const triagem = this.triagem();
    const acao = this.acaoPendente();
    if (!triagem || !acao) return;

    if (acao === 'excluir') {
      if (!this.isAdmin) return;

      this.triagensService.deleteTriagem(triagem.id).subscribe({
        next: () => {
          this.dialogConfirmVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Triagem excluída!',
            detail: 'A triagem foi excluída com sucesso.',
            life: 3000,
          });
          this.router.navigate(['/triagens']);
        },
      });
      return;
    }

    if (acao === 'cancelar' || acao === 'descancelar') {
      const acao$ =
        acao === 'cancelar'
          ? this.triagensService.cancelarTriagem(triagem.id)
          : this.triagensService.descancelarTriagem(triagem.id);

      acao$.subscribe({
        next: (triagemAtualizada) => {
          this.triagem.set(triagemAtualizada);
          this.dialogConfirmVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: acao === 'cancelar' ? 'Triagem cancelada!' : 'Triagem descancelada!',
            detail:
              acao === 'cancelar'
                ? 'A triagem foi cancelada com sucesso.'
                : 'A triagem foi descancelada com sucesso.',
            life: 3000,
          });
        },
      });
      return;
    }

    if (acao === 'concluir' && !this.podeConcluir()) return;
    if (acao === 'reabrir' && !this.podeReabrir()) return;

    const acao$ =
      acao === 'concluir'
        ? this.triagensService.concluirTriagem(triagem.id)
        : this.triagensService.reabrirTriagem(triagem.id);

    acao$.subscribe({
      next: (triagemAtualizada) => {
        this.triagem.set(triagemAtualizada);
        this.dialogConfirmVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: acao === 'concluir' ? 'Triagem concluída!' : 'Triagem reaberta!',
          detail:
            acao === 'concluir'
              ? 'A triagem foi concluída com sucesso.'
              : 'A triagem foi reaberta com sucesso.',
          life: 3000,
        });
      },
    });
  }
}
