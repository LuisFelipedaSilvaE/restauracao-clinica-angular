import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowDownToLine,
  LucideArrowUpFromLine,
  LucideGauge,
  LucideHandCoins,
  LucidePackage,
  LucidePencil,
  LucidePill,
  LucideTrash2,
} from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { BackButton } from '../../../../shared/components/back-button/back-button';
import { Card } from '../../../../shared/components/card/card';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { IconColor } from '../../../../shared/directives/icon-color';
import { DialogMovimentacaoMedicamento } from '../../components/dialog-movimentacao-medicamento/dialog-movimentacao-medicamento';
import { Medicamento } from '../../interfaces/medicamento';
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
    LucideArrowDownToLine,
    LucideArrowUpFromLine,
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
    RouterLink,
    ConfirmDialog,
    SkeletonModule,
  ],
  templateUrl: './medicamento-detalhado.html',
  styleUrl: './medicamento-detalhado.css',
})
export class MedicamentoDetalhado implements OnInit {
  protected readonly id = input<string>();
  private readonly medicamentosService = inject(MedicamentosService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  protected readonly dialogVisible = signal<boolean>(false);
  protected readonly typeMovimentacao = signal<'entrada' | 'saida' | null>(null);
  protected readonly medicamento = signal<Medicamento | null>(null);
  protected readonly carregando = signal(false);
  protected readonly confirmarExclusao = signal(false);
  protected readonly loading = this.medicamentosService.loading;

  ngOnInit(): void {
    this.getMedicamento();
  }

  getMedicamento(): void {
    const id = Number(this.id());
    if (Number.isNaN(id)) {
      this.router.navigate(['/medicamentos']);
      return;
    }

    this.carregando.set(true);

    this.medicamentosService.getMedicamentoById(id).subscribe({
      next: (res) => {
        this.carregando.set(false);
        this.medicamento.set(res);
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
    this.confirmarExclusao.set(true);
  }

  excluirMedicamento(): void {
    const medicamento = this.medicamento();
    if (!medicamento) return;

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
    });
  }

  aumentarQuantidadeEstoque(): void {
    this.movimentar('entrada', this.medicamento()!);
  }

  reduzirQuantidadeEstoque(): void {
    this.movimentar('saida', this.medicamento()!);
  }

  movimentar(mode: 'entrada' | 'saida', medicamento: Medicamento) {
    this.dialogVisible.set(true);
    this.typeMovimentacao.set(mode);
    this.medicamento.set(medicamento);
  }
}
