import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowDownToLine,
  LucideArrowUpFromLine,
  LucideGauge,
  LucideHandCoins,
  LucideHistory,
  LucidePackage,
  LucidePencil,
  LucidePill,
  LucideTrash2,
} from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/services/auth-service';
import { BackButton } from '../../../../shared/components/back-button/back-button';
import { Card } from '../../../../shared/components/card/card';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { DetailInfoField } from '../../../../shared/components/detail-info-field/detail-info-field';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { IconColor } from '../../../../shared/directives/icon-color';
import { DialogMovimentacaoMedicamento } from '../../components/dialog-movimentacao-medicamento/dialog-movimentacao-medicamento';
import { MovimentacaoCard } from '../../components/movimentacao-card/movimentacao-card';
import { Medicamento } from '../../interfaces/medicamento';
import { MovimentacaoEstoque } from '../../interfaces/movimentacao-estoque';
import { MedicamentosService } from '../../services/medicamentos-service';

@Component({
  selector: 'app-medicamento-detalhado',
  host: {
    class: 'flex flex-col gap-4',
  },
  imports: [
    ButtonModule,
    BackButton,
    Card,
    DataViewModule,
    EmptyList,
    LucideArrowDownToLine,
    LucideArrowUpFromLine,
    LucideHistory,
    LucidePencil,
    LucideTrash2,
    LucidePill,
    IconColor,
    LucideHandCoins,
    LucidePackage,
    LucideGauge,
    CommonModule,
    CurrencyPipe,
    DialogMovimentacaoMedicamento,
    MovimentacaoCard,
    RouterLink,
    ConfirmDialog,
    DetailInfoField,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './medicamento-detalhado.html',
  styleUrl: './medicamento-detalhado.css',
})
export class MedicamentoDetalhado implements OnInit {
  protected readonly id = input<string>();
  private readonly medicamentosService = inject(MedicamentosService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  protected readonly isAdmin = this.authService.hasRole('ADMIN');
  protected readonly dialogVisible = signal<boolean>(false);
  protected readonly typeMovimentacao = signal<'entrada' | 'saida' | null>(null);
  protected readonly medicamento = signal<Medicamento | null>(null);
  protected readonly movimentacoes = signal<MovimentacaoEstoque[]>([]);
  protected readonly carregando = signal(false);
  protected readonly confirmarExclusao = signal(false);
  protected readonly loading = this.medicamentosService.loading;
  protected readonly emptyMovimentacoesIcon = LucideHistory;

  protected readonly statusTag = computed(() => {
    const med = this.medicamento();
    if (!med) return null;

    const estoqueBaixo = med.status
      ? med.status === 'ALERTA: ESTOQUE BAIXO'
      : med.quantidadeEstoque <= med.quantidadeMinima;

    return {
      severity: estoqueBaixo ? ('danger' as const) : ('success' as const),
      label: estoqueBaixo ? 'Estoque baixo' : 'Estoque normal',
    };
  });

  protected readonly dataviewPt = {
    root: {
      class: 'flex! min-w-0 flex-col gap-2',
    },
    content: {
      class: 'min-w-0 overflow-hidden bg-transparent!',
    },
    pcPaginator: {
      root: {
        class: 'border! border-border-default',
      },
    },
  };

  ngOnInit(): void {
    this.getMedicamento();
  }

  getMedicamento(): void {
    const id = Number(this.id());
    if (!Number.isInteger(id) || id <= 0) {
      this.router.navigate(['/medicamentos']);
      return;
    }

    this.carregando.set(true);

    forkJoin({
      medicamento: this.medicamentosService.getMedicamentoById(id),
      movimentacoes: this.medicamentosService.getMovimentacoesByMedicamentoId(id),
    }).subscribe({
      next: ({ medicamento, movimentacoes }) => {
        this.carregando.set(false);
        if (!medicamento) {
          this.router.navigate(['/medicamentos']);
          return;
        }
        this.medicamento.set(medicamento);
        this.movimentacoes.set(movimentacoes);
      },
      error: () => {
        this.carregando.set(false);
        this.router.navigate(['/medicamentos']);
      },
    });
  }

  editarMedicamento(): void {
    const medicamento = this.medicamento();
    if (!medicamento) return;
    this.router.navigate(['/medicamentos', medicamento.id, 'editar']);
  }

  confirmarExclusaoMedicamento(): void {
    if (!this.isAdmin) return;
    this.confirmarExclusao.set(true);
  }

  excluirMedicamento(): void {
    const medicamento = this.medicamento();
    if (!medicamento || !this.isAdmin) return;

    this.medicamentosService.deleteMedicamento(medicamento.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Medicamento removido!',
          detail: 'O medicamento foi removido com sucesso.',
          life: 3000,
        });
        this.confirmarExclusao.set(false);
        this.router.navigate(['/medicamentos']);
      },
      error: () => {
        this.confirmarExclusao.set(false);
      },
    });
  }

  aumentarQuantidadeEstoque(): void {
    const medicamento = this.medicamento();
    if (!medicamento) return;
    this.movimentar('entrada', medicamento);
  }

  reduzirQuantidadeEstoque(): void {
    const medicamento = this.medicamento();
    if (!medicamento || medicamento.quantidadeEstoque <= 0) return;
    this.movimentar('saida', medicamento);
  }

  movimentar(mode: 'entrada' | 'saida', medicamento: Medicamento) {
    this.dialogVisible.set(true);
    this.typeMovimentacao.set(mode);
    this.medicamento.set(medicamento);
  }

  protected onMovimentacaoRegistrada(movimentacao: MovimentacaoEstoque): void {
    this.medicamento.update((atual) => {
      if (!atual) return null;

      return {
        ...atual,
        quantidadeEstoque: movimentacao.saldoPosterior,
        status:
          movimentacao.saldoPosterior <= atual.quantidadeMinima
            ? 'ALERTA: ESTOQUE BAIXO'
            : 'ESTOQUE OK',
      };
    });
    this.movimentacoes.update((lista) => [movimentacao, ...lista]);
  }
}
