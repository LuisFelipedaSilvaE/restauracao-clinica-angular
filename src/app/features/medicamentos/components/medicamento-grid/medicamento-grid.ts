import { Component, inject, input, output, signal } from '@angular/core';
import { LucideSearchX } from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { DataViewModule } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { Medicamento } from '../../interfaces/medicamento';
import { MedicamentosService } from '../../services/medicamentos-service';
import { DialogMovimentacaoMedicamento } from '../dialog-movimentacao-medicamento/dialog-movimentacao-medicamento';
import { MedicamentoCard } from '../medicamento-card/medicamento-card';

@Component({
  selector: 'medicamento-grid',
  imports: [
    DataViewModule,
    MedicamentoCard,
    DialogMovimentacaoMedicamento,
    ConfirmDialog,
    EmptyList,
    SkeletonModule,
  ],
  templateUrl: './medicamento-grid.html',
  styleUrl: './medicamento-grid.css',
})
export class MedicamentoGrid {
  readonly medicamentos = input.required<Medicamento[]>();
  readonly medicamentosService = inject(MedicamentosService);
  readonly messageService = inject(MessageService);
  readonly loading = input(false);
  readonly limparFiltros = output<void>();
  protected readonly dialogVisible = signal<boolean>(false);
  protected readonly confirmarExclusao = signal<boolean>(false);
  protected readonly typeMovimentacao = signal<'entrada' | 'saida' | null>(null);
  protected readonly medicamentoMovimentacao = signal<Medicamento | null>(null);
  protected readonly emptySearchIcon = LucideSearchX;
  protected readonly skeletonCards = Array.from({ length: 10 });
  protected readonly dataviewPt = {
    root: {
      class: 'flex! flex-col gap-2',
    },
    content: {
      class: 'bg-transparent!',
    },
    pcPaginator: {
      root: {
        class: 'border! border-border-default',
      },
    },
  };

  aumentarQuantidadeEstoque(medicamento: Medicamento): void {
    this.movimentar('entrada', medicamento);
  }

  reduzirQuantidadeEstoque(medicamento: Medicamento): void {
    this.movimentar('saida', medicamento);
  }

  enableConfirmDialog(medicamento: Medicamento): void {
    this.medicamentoMovimentacao.set(medicamento);
    this.confirmarExclusao.set(true);
  }

  excluirMedicamento(): void {
    this.medicamentosService.deleteMedicamento(this.medicamentoMovimentacao()!.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Medicamento removido!',
          detail: 'O medicamento foi removido com sucesso.',
          life: 3000,
        });
      },
    });

    this.confirmarExclusao.set(false);
  }

  movimentar(mode: 'entrada' | 'saida', medicamento: Medicamento) {
    this.dialogVisible.set(true);
    this.typeMovimentacao.set(mode);
    this.medicamentoMovimentacao.set(medicamento);
  }
}
