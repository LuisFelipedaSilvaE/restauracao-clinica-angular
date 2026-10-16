import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideFunnelX,
  LucidePlus,
  LucideSearchX,
  LucideUserRoundCheck,
  LucideUserRoundPlus,
  LucideUserRoundX,
  LucideUsersRound,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { AcolhidoCard } from '../../components/acolhido-card/acolhido-card';
import { FilterAcolhidosCard } from '../../components/filter-acolhidos-card/filter-acolhidos-card';
import { AcolhidoCardContent } from '../../interfaces/acolhido-card-content';
import { FilterOption } from '../../interfaces/filter-option';
import { ToggleAcolhidoDto } from '../../interfaces/toggle-acolhido-dto';
import { AcolhidosService } from '../../services/acolhidos-service';

type AcaoPendente =
  | { tipo: 'status'; dados: ToggleAcolhidoDto }
  | { tipo: 'exclusao'; id: number; nome: string };

@Component({
  selector: 'app-acolhidos-lista',
  host: {
    class: 'flex min-w-0 flex-col gap-8',
  },
  imports: [
    ButtonModule,
    SkeletonModule,
    LucideUserRoundPlus,
    InfoCard,
    FilterAcolhidosCard,
    DataViewModule,
    AcolhidoCard,
    ConfirmDialog,
    RouterLink,
    LucidePlus,
    EmptyList,
    LucideFunnelX,
  ],
  templateUrl: './acolhidos-lista.html',
  styleUrl: './acolhidos-lista.css',
})
export class AcolhidosLista implements OnInit {
  protected readonly emptySearchIcon = LucideSearchX;
  protected readonly emptyAcolhidosIcon = LucideUserRoundX;
  private readonly acolhidosService = inject(AcolhidosService);
  private readonly messageService = inject(MessageService);
  protected readonly acolhidos = this.acolhidosService.acolhidos;
  protected readonly loading = computed(() => this.acolhidosService.loading().list);
  protected readonly mutationLoading = computed(() => this.acolhidosService.loading().mutation);
  protected readonly skeletonCards = Array.from({ length: 10 });
  protected readonly acaoPendente = signal<AcaoPendente | null>(null);
  protected readonly busca = signal('');
  protected readonly convenioSelecionado = signal('todos');
  protected readonly statusSelecionado = signal('todos');
  protected readonly dialogConfirmVisible = signal(false);

  protected readonly convenios = computed<FilterOption[]>(() => [
    { name: 'Todos os convênios', code: 'todos' },
  ]);

  private readonly acolhidosCards = computed<AcolhidoCardContent[]>(() =>
    this.acolhidos().map((acolhido) => ({ ...acolhido })),
  );

  protected readonly infoAcolhidos = computed<InfoCardContent[]>(() => {
    const acolhidos = this.acolhidos();
    const ativos = acolhidos.filter((acolhido) => acolhido.ativo).length;

    return [
      {
        value: acolhidos.length,
        label: 'Acolhidos cadastrados',
        icon: LucideUsersRound,
        color: '#155dfc',
      },
      {
        value: ativos,
        label: 'Acolhidos ativos',
        icon: LucideUserRoundCheck,
        color: '#00a63e',
      },
      {
        value: acolhidos.length - ativos,
        label: 'Acolhidos inativos',
        icon: LucideUserRoundX,
        color: '#6b7280',
      },
    ];
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

  protected readonly acolhidosCardsFiltrados = computed<AcolhidoCardContent[]>(() => {
    const busca = this.normalizarTexto(this.busca());
    const buscaNumerica = this.busca().replace(/\D/g, '');
    const status = this.statusSelecionado();
    const convenio = this.convenioSelecionado();

    return this.acolhidosCards().filter((acolhido) => {
      const correspondeBusca =
        !busca ||
        this.normalizarTexto(acolhido.nome).includes(busca) ||
        this.normalizarTexto(acolhido.email).includes(busca) ||
        this.normalizarTexto(acolhido.endereco.cidade).includes(busca) ||
        (!!buscaNumerica &&
          (acolhido.cpf.replace(/\D/g, '').includes(buscaNumerica) ||
            acolhido.telefone.replace(/\D/g, '').includes(buscaNumerica)));
      const correspondeStatus =
        status === 'todos' || (status === 'ativo' ? acolhido.ativo : !acolhido.ativo);
      const correspondeConvenio =
        convenio === 'todos' || acolhido.internacaoAtual?.convenio.descricao === convenio;

      return correspondeBusca && correspondeStatus && correspondeConvenio;
    });
  });

  protected readonly confirmTitle = computed(() => {
    const acao = this.acaoPendente();
    if (acao?.tipo === 'exclusao') return 'Excluir acolhido';
    return acao?.dados.ativo ? 'Ativar acolhido' : 'Desativar acolhido';
  });

  protected readonly confirmMessage = computed(() => {
    const acao = this.acaoPendente();

    if (acao?.tipo === 'exclusao') {
      return `Deseja excluir ${acao.nome}? Esta ação não poderá ser desfeita.`;
    }

    return acao?.dados.ativo
      ? 'Deseja ativar este acolhido? Ele voltará a ficar disponível.'
      : 'Deseja desativar este acolhido? Ele deixará de ficar disponível.';
  });

  protected readonly confirmLabel = computed(() => {
    const acao = this.acaoPendente();
    if (acao?.tipo === 'exclusao') return 'Excluir';
    return acao?.dados.ativo ? 'Ativar' : 'Desativar';
  });

  protected readonly confirmSeverity = computed<'success' | 'danger'>(() => {
    const acao = this.acaoPendente();
    return acao?.tipo === 'status' && acao.dados.ativo ? 'success' : 'danger';
  });

  protected clearFilters(): void {
    this.busca.set('');
    this.convenioSelecionado.set('todos');
    this.statusSelecionado.set('todos');
  }

  protected confirmarAcao(): void {
    const acao = this.acaoPendente();
    if (!acao) return;

    if (acao.tipo === 'exclusao') {
      this.acolhidosService.deleteAcolhido(acao.id).subscribe({
        next: () => {
          this.dialogConfirmVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Acolhido excluído!',
            detail: 'O acolhido foi excluído com sucesso.',
            life: 3000,
          });
        },
      });
      return;
    }

    const acao$ = acao.dados.ativo
      ? this.acolhidosService.activateAcolhido(acao.dados.id)
      : this.acolhidosService.deactivateAcolhido(acao.dados.id);

    acao$.subscribe({
      next: () => this.dialogConfirmVisible.set(false),
    });
  }

  protected toggleAcolhido(dto: ToggleAcolhidoDto): void {
    this.acaoPendente.set({ tipo: 'status', dados: dto });
    this.dialogConfirmVisible.set(true);
  }

  protected solicitarExclusao(acolhido: { id: number; nome: string }): void {
    this.acaoPendente.set({ tipo: 'exclusao', ...acolhido });
    this.dialogConfirmVisible.set(true);
  }

  ngOnInit(): void {
    this.acolhidosService.getAllAcolhidos().subscribe();
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\W_\u0300-\u036f]/g, '');
  }
}
