import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { LucideReceiptText, LucideRotateCcw } from '@lucide/angular';
import { TagModule } from 'primeng/tag';
import { ActionMenu } from '../../../../shared/components/action-menu/action-menu';
import { IconColor } from '../../../../shared/directives/icon-color';
import { AcaoMenu } from '../../../../shared/interfaces/acao-menu';
import { localDateToDate } from '../../../../shared/utils/local-date';
import { Pagamento } from '../../interfaces/pagamento';

@Component({
  selector: 'pagamento-card',
  host: {
    class:
      'grid min-w-0 grid-cols-[minmax(0,1fr)_36px] items-center gap-x-3 gap-y-3 rounded-xl border border-border-default bg-surface-card p-3 sm:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))_36px] xl:gap-4 xl:p-4',
    '[class]': "pagamento().status === 'ESTORNADO' ? 'border-dashed! bg-surface-subtle!' : ''",
  },
  imports: [ActionMenu, CommonModule, IconColor, LucideReceiptText, TagModule],
  templateUrl: './pagamento-card.html',
  styleUrl: './pagamento-card.css',
})
export class PagamentoCard {
  readonly pagamento = input.required<Pagamento>();
  readonly estornar = output<Pagamento>();

  protected readonly dataCompetencia = computed(() =>
    localDateToDate(`${this.pagamento().competencia}-01`),
  );
  protected readonly dataPagamento = computed(() =>
    localDateToDate(this.pagamento().dataPagamento),
  );
  protected readonly estornado = computed(() => this.pagamento().status === 'ESTORNADO');
  protected readonly status = computed(() => ({
    label: this.estornado() ? 'Estornado' : 'Confirmado',
    severity: this.estornado() ? ('danger' as const) : ('success' as const),
  }));

  protected readonly acoes = computed<AcaoMenu[]>(() => [
    {
      label: 'Estornar pagamento',
      visible: !this.estornado(),
      lucideIcon: LucideRotateCcw,
      iconClass: 'h-4 w-4 text-action-destructive',
      command: () => this.estornar.emit(this.pagamento()),
    },
  ]);
}
