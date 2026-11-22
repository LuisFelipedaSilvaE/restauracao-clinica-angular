import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { LucideArrowDownToLine, LucideArrowUpFromLine, LucideDynamicIcon } from '@lucide/angular';
import { TagModule } from 'primeng/tag';
import { IconColor } from '../../../../shared/directives/icon-color';
import { TIPO_MOVIMENTACAO_LABELS, TipoMovimentacao } from '../../enums/tipo-movimentacao';
import { MovimentacaoEstoque } from '../../interfaces/movimentacao-estoque';

@Component({
  selector: 'movimentacao-card',
  host: {
    class:
      'grid min-w-0 grid-cols-1 items-center gap-x-3 gap-y-3 rounded-xl border border-border-default bg-surface-card p-3 sm:grid-cols-[minmax(0,1fr)_repeat(4,minmax(0,1fr))] xl:gap-4 xl:p-4',
  },
  imports: [CommonModule, IconColor, LucideDynamicIcon, TagModule],
  templateUrl: './movimentacao-card.html',
  styleUrl: './movimentacao-card.css',
})
export class MovimentacaoCard {
  readonly movimentacao = input.required<MovimentacaoEstoque>();

  protected readonly ehEntrada = computed(
    () => this.movimentacao().tipo === TipoMovimentacao.ENTRADA,
  );

  protected readonly tipoConfig = computed(() => {
    const entrada = this.ehEntrada();

    return {
      label: TIPO_MOVIMENTACAO_LABELS[this.movimentacao().tipo] ?? this.movimentacao().tipo,
      severity: entrada ? ('success' as const) : ('warn' as const),
      icon: entrada ? LucideArrowDownToLine : LucideArrowUpFromLine,
      iconColor: entrada ? '#00a63e' : '#e17100',
      sinal: entrada ? '+' : '-',
      quantidadeClass: entrada ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400',
    };
  });
}
