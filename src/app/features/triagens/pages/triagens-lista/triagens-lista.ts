import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  LucideCalendarPlus,
  LucideCalendarX2,
  LucideCheck,
  LucideDynamicIcon,
  LucideRotateCcwClock,
} from '@lucide/angular';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { interval, map, switchMap, timer } from 'rxjs';
import { Card } from '../../../../shared/components/card/card';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { isSameLocalDate } from '../../../../shared/utils/local-date-time';
import { FilterTriagensCard } from '../../components/filter-triagens-card/filter-triagens-card';
import { TriagemGrid } from '../../components/triagem-grid/triagem-grid';
import { TriagemReagendamentoForm } from '../../components/triagem-reagendamento-form/triagem-reagendamento-form';
import { Triagem } from '../../interfaces/triagem';
import { TriagensService } from '../../services/triagens-service';

type AcaoTriagem = 'concluir' | 'reabrir' | 'excluir';

@Component({
  selector: 'app-triagens-lista',
  host: {
    class: 'flex flex-col gap-6',
  },
  imports: [
    TabsModule,
    Card,
    LucideDynamicIcon,
    LucideCalendarPlus,
    RouterLink,
    BadgeModule,
    ButtonModule,
    FilterTriagensCard,
    TriagemGrid,
    ConfirmDialog,
    TriagemReagendamentoForm,
  ],
  templateUrl: './triagens-lista.html',
  styleUrl: './triagens-lista.css',
})
export class TriagensLista implements OnInit {
  protected readonly triagensService = inject(TriagensService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly triagens = this.triagensService.triagens;
  protected readonly loading = this.triagensService.loading;
  protected readonly agora = toSignal(interval(60_000).pipe(map(() => new Date())), {
    initialValue: new Date(),
  });
  private dataReferenciaAtual = this.agora();
  protected readonly statusSelecionado = signal('AGENDADA');
  protected readonly tabs = computed(() => {
    const triagens = this.triagens();

    return [
      {
        label: 'Agendadas',
        status: 'AGENDADA',
        icon: LucideCheck,
        total: triagens.filter((t) => t.status === 'AGENDADA').length,
      },
      {
        label: 'Atrasadas',
        status: 'ATRASADA',
        icon: LucideCalendarX2,
        total: triagens.filter((t) => t.status === 'ATRASADA').length,
      },
      {
        label: 'Concluídas',
        status: 'CONCLUIDA',
        icon: LucideRotateCcwClock,
        total: triagens.filter((t) => t.status === 'CONCLUIDA').length,
      },
    ];
  });
  protected readonly busca = signal('');
  protected readonly convenioSelecionado = signal('todos');
  protected readonly rangeDataSelecionado = signal('todos');
  protected readonly dialogConfirmVisible = signal(false);
  protected readonly triagemPendente = signal<{ id: number; nome: string } | null>(null);
  protected readonly acaoPendente = signal<AcaoTriagem | null>(null);
  protected readonly reagendamentoDialogVisible = signal(false);
  protected readonly triagemParaReagendar = signal<Triagem | null>(null);
  protected readonly filtrosAtivos = computed(
    () =>
      !!this.busca().trim() ||
      this.convenioSelecionado() !== 'todos' ||
      this.rangeDataSelecionado() !== 'todos',
  );
  protected readonly temTriagensNoStatus = computed(() =>
    this.triagens().some((triagem) => triagem.status === this.statusSelecionado()),
  );
  protected readonly mutationLoading = computed(() => this.loading().mutation);
  protected readonly confirmTitle = computed(() => {
    const acao = this.acaoPendente();

    if (acao === 'reabrir') return 'Reabrir triagem';
    if (acao === 'excluir') return 'Excluir triagem';
    return 'Concluir triagem';
  });
  protected readonly confirmMessage = computed(() => {
    const triagem = this.triagemPendente();
    const acao = this.acaoPendente();
    if (!triagem || !acao) return '';

    if (acao === 'concluir') {
      return `Deseja concluir a triagem de ${triagem.nome}? A data de conclusão será registrada automaticamente.`;
    }

    if (acao === 'reabrir') {
      return `Deseja reabrir a triagem de ${triagem.nome}? Ela voltará para agendada ou atrasada conforme a data do agendamento.`;
    }

    return `Deseja excluir a triagem de ${triagem.nome}? Esta ação não poderá ser desfeita.`;
  });
  protected readonly confirmLabel = computed(() => {
    const acao = this.acaoPendente();
    if (acao === 'reabrir') return 'Reabrir';
    if (acao === 'excluir') return 'Excluir';
    return 'Concluir';
  });
  protected readonly confirmSeverity = computed<'success' | 'primary' | 'danger'>(() => {
    const acao = this.acaoPendente();
    if (acao === 'reabrir') return 'primary';
    if (acao === 'excluir') return 'danger';
    return 'success';
  });
  protected readonly triagensFiltradas = computed<Triagem[]>(() => {
    const busca = (this.busca() || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\W_\u0300-\u036f]/g, '');

    const convenioFiltro = this.convenioSelecionado();
    const rangeDataFiltro = this.rangeDataSelecionado();
    const statusFiltro = this.statusSelecionado();

    const triagensFiltradas: Triagem[] = this.triagens().filter((triagem) => {
      const nome =
        triagem.nomePossivelAcolhido
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\W_\u0300-\u036f]/g, '') || '';

      const telefone = triagem.telefone.replace(/\D/g, '') || '';

      const convenioDesc =
        triagem.convenio.descricao
          .normalize('NFD')
          .toLowerCase()
          .replace(/[\W_\u0300-\u036f]/g, '') || '';

      const validBusca =
        !busca || nome.includes(busca) || telefone.includes(busca) || convenioDesc.includes(busca);

      const convenioValido =
        convenioFiltro === 'todos' || triagem.convenio.id === Number(convenioFiltro);

      let validRangeData = true;
      if (rangeDataFiltro !== 'todos' && triagem.dataAgendada) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dias = Number(rangeDataFiltro);
        const limite = new Date(hoje);
        limite.setDate(limite.getDate() + dias);
        limite.setHours(23, 59, 59, 999);

        const dataTriagem = new Date(triagem.dataAgendada);
        validRangeData = dataTriagem >= hoje && dataTriagem <= limite;
      }

      const validStatus = triagem.status === statusFiltro;

      return validBusca && validStatus && convenioValido && validRangeData;
    });

    const agora = this.agora();

    return triagensFiltradas.sort((a, b) => {
      const aEhHoje = a.status !== 'CONCLUIDA' && isSameLocalDate(a.dataAgendada, agora);
      const bEhHoje = b.status !== 'CONCLUIDA' && isSameLocalDate(b.dataAgendada, agora);

      if (aEhHoje !== bEhHoje) return aEhHoje ? -1 : 1;
      if (aEhHoje && bEhHoje) {
        return new Date(a.dataAgendada).getTime() - new Date(b.dataAgendada).getTime();
      }

      return 0;
    });
  });

  constructor() {
    effect(() => {
      const novaDataReferencia = this.agora();

      if (isSameLocalDate(novaDataReferencia, this.dataReferenciaAtual)) return;

      this.dataReferenciaAtual = novaDataReferencia;

      timer(5_000)
        .pipe(
          switchMap(() => this.triagensService.getAllTriagens(true)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe();
    });
  }

  ngOnInit(): void {
    this.triagensService.getAllTriagens().subscribe();
  }

  clearFilters(): void {
    this.busca.set('');
    this.convenioSelecionado.set('todos');
    this.rangeDataSelecionado.set('todos');
  }

  protected solicitarConclusao(triagem: { id: number; nome: string }): void {
    this.triagemPendente.set(triagem);
    this.acaoPendente.set('concluir');
    this.dialogConfirmVisible.set(true);
  }

  protected solicitarReabertura(triagem: { id: number; nome: string }): void {
    this.triagemPendente.set(triagem);
    this.acaoPendente.set('reabrir');
    this.dialogConfirmVisible.set(true);
  }

  protected solicitarReagendamento(triagem: Triagem): void {
    this.triagemParaReagendar.set(triagem);
    this.reagendamentoDialogVisible.set(true);
  }

  protected solicitarExclusao(triagem: { id: number; nome: string }): void {
    this.triagemPendente.set(triagem);
    this.acaoPendente.set('excluir');
    this.dialogConfirmVisible.set(true);
  }

  protected confirmarAcao(): void {
    const triagem = this.triagemPendente();
    const acao = this.acaoPendente();
    if (!triagem || !acao) return;

    if (acao === 'excluir') {
      this.triagensService.deleteTriagem(triagem.id).subscribe({
        next: () => {
          this.dialogConfirmVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Triagem excluída!',
            detail: 'A triagem foi excluída com sucesso.',
            life: 3000,
          });
        },
      });
      return;
    }

    const acao$ =
      acao === 'concluir'
        ? this.triagensService.concluirTriagem(triagem.id)
        : this.triagensService.reabrirTriagem(triagem.id);

    acao$.subscribe({
      next: () => {
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
