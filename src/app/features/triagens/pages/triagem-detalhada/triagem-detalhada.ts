import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideCalendar,
  LucideCircleCheckBig,
  LucideHandshake,
  LucidePencil,
  LucidePhone,
  LucideTrash2,
} from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { BackButton } from '../../../../shared/components/back-button/back-button';
import { Card } from '../../../../shared/components/card/card';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { CustomTag } from '../../../../shared/directives/custom-tag';
import { IconColor } from '../../../../shared/directives/icon-color';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { Triagem } from '../../interfaces/triagem';
import { TriagensService } from '../../services/triagens-service';

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
    ProfileColor,
    CustomTag,
    IconColor,
    CommonModule,
    DividerModule,
    SkeletonModule,
    LucideHandshake,
    LucidePhone,
    LucideCalendar,
    LucideCircleCheckBig,
    BackButton,
    ConfirmDialog,
  ],
  templateUrl: './triagem-detalhada.html',
  styleUrl: './triagem-detalhada.css',
})
export class TriagemDetalhada {
  protected readonly id = input<string>();
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  protected readonly triagem = signal<Triagem | undefined>(undefined);
  protected readonly carregando = signal(false);
  protected readonly dialogConfirmVisible = signal(false);
  private readonly triagensService = inject(TriagensService);
  protected readonly loading = this.triagensService.loading;
  protected readonly mutationLoading = computed(() => this.loading().mutation);
  protected readonly podeConcluir = computed(() => {
    const status = this.triagem()?.status;
    return status === 'AGENDADA' || status === 'ATRASADA';
  });
  protected readonly confirmMessage = computed(() => {
    const triagem = this.triagem();
    return triagem
      ? `Deseja concluir a triagem de ${triagem.nomePossivelAcolhido}? A data de conclusão será registrada automaticamente.`
      : '';
  });
  protected readonly statusTagSeverity = computed(() => {
    const triagem = this.triagem();

    if (!triagem) return '';

    const config: Record<string, string> = {
      agendada: 'info',
      pendente: 'warn',
      atrasada: 'error',
      concluida: 'success',
    };

    return config[triagem.status.toLowerCase()];
  });

  ngOnInit(): void {
    this.getTriagem();
  }
  // protected alterarStatus(): void {
  //   const triagem = this.triagem();
  //   if (!triagem) return;

  //   const proximoStatus = !triagem.ativo;
  //   const acao$ = proximoStatus
  //     ? this.triagensService.activatetriagem(triagem.id)
  //     : this.triagensService.deactivatetriagem(triagem.id);

  //   acao$.subscribe({
  //     next: () => {
  //       this.triagem.update((atual) => (atual ? { ...atual, ativo: proximoStatus } : undefined));
  //       this.confirmarAlteracao.set(false);
  //     },
  //   });
  // }

  getTriagem(): void {
    const id = Number(this.id());

    if (Number.isNaN(id)) {
      this.router.navigate(['/triagens']);
      return;
    }

    this.carregando.set(true);

    this.triagensService.getTriagemById(id).subscribe({
      next: (res) => {
        this.carregando.set(false);
        this.triagem.set(res);
      },
      error: () => {
        this.carregando.set(false);
        this.router.navigate(['/triagens']);
      },
    });
  }

  protected solicitarConclusao(): void {
    if (!this.podeConcluir()) return;

    this.dialogConfirmVisible.set(true);
  }

  protected confirmarConclusao(): void {
    const triagem = this.triagem();
    if (!triagem || !this.podeConcluir()) return;

    this.triagensService.concluirTriagem(triagem.id).subscribe({
      next: (triagemAtualizada) => {
        this.triagem.set(triagemAtualizada);
        this.dialogConfirmVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Triagem concluída!',
          detail: 'A triagem foi concluída com sucesso.',
          life: 3000,
        });
      },
    });
  }
}
