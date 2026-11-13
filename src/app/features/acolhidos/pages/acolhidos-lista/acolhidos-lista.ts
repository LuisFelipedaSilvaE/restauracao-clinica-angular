import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
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
import { AccordionModule } from 'primeng/accordion';
import { DataViewModule } from 'primeng/dataview';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { forkJoin } from 'rxjs';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { AcolhidoCard } from '../../components/acolhido-card/acolhido-card';
import { FilterAcolhidosCard } from '../../components/filter-acolhidos-card/filter-acolhidos-card';
import { AcolhidoCardContent } from '../../interfaces/acolhido-card-content';
import { FilterOption } from '../../interfaces/filter-option';
import { ToggleAcolhidoDto } from '../../interfaces/toggle-acolhido-dto';
import { AcolhidosService } from '../../services/acolhidos-service';
import { InternacoesService } from '../../../internacoes/services/internacoes-service';
import { ResponsaveisLista } from '../../../responsaveis/pages/responsaveis-lista/responsaveis-lista';
import { ResponsaveisService } from '../../../responsaveis/services/responsaveis-service';
import { AuthService } from '../../../../core/services/auth-service';

type AccordionValue = string | number | string[] | number[] | null | undefined;

type AcaoPendente =
  { tipo: 'status'; dados: ToggleAcolhidoDto } | { tipo: 'exclusao'; id: number; nome: string };

@Component({
  selector: 'app-acolhidos-lista',
  host: {
    class: 'flex min-w-0 flex-col gap-8',
  },
  imports: [
    AccordionModule,
    ButtonModule,
    SkeletonModule,
    LucideUserRoundPlus,
    InfoCard,
    PageHeader,
    FilterAcolhidosCard,
    DataViewModule,
    AcolhidoCard,
    ConfirmDialog,
    RouterLink,
    LucidePlus,
    EmptyList,
    LucideFunnelX,
    LucideUsersRound,
    ResponsaveisLista,
  ],
  templateUrl: './acolhidos-lista.html',
  styleUrl: './acolhidos-lista.css',
})
export class AcolhidosLista implements OnInit {
  readonly painel = input<string>();
  protected readonly emptySearchIcon = LucideSearchX;
  protected readonly emptyAcolhidosIcon = LucideUserRoundX;
  private readonly acolhidosService = inject(AcolhidosService);
  private readonly internacoesService = inject(InternacoesService);
  private readonly messageService = inject(MessageService);
  private readonly responsaveisService = inject(ResponsaveisService);
  private readonly authService = inject(AuthService);
  protected readonly isAdmin = this.authService.hasRole('ADMIN');
  protected readonly acolhidos = this.acolhidosService.acolhidos;
  protected readonly loading = computed(
    () => this.acolhidosService.loading().list || this.internacoesService.loading().list,
  );
  protected readonly mutationLoading = computed(() => this.acolhidosService.loading().mutation);
  protected readonly skeletonCards = Array.from({ length: 10 });
  protected readonly acaoPendente = signal<AcaoPendente | null>(null);
  protected readonly busca = signal('');
  protected readonly convenioSelecionado = signal('todos');
  protected readonly situacaoSelecionada = signal('todos');
  protected readonly dialogConfirmVisible = signal(false);
  protected readonly painelResponsaveis = signal<AccordionValue>(null);
  protected readonly totalResponsaveis = computed(
    () => this.responsaveisService.responsaveis().length,
  );

  protected readonly convenios = computed<FilterOption[]>(() => {
    const conveniosUnicos = new Map(
      this.acolhidosCards().flatMap((acolhido) => {
        const convenio = acolhido.internacaoAtual?.convenio;
        return convenio ? [[convenio.id, convenio] as const] : [];
      }),
    );

    return [
      { name: 'Todos os convênios', code: 'todos' },
      ...Array.from(conveniosUnicos.values())
        .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR'))
        .map((convenio) => ({ name: convenio.descricao, code: String(convenio.id) })),
    ];
  });

  private readonly acolhidosCards = computed<AcolhidoCardContent[]>(() =>
    this.acolhidos().map((acolhido) => {
      const internacaoAtual = this.internacoesService.getInternacaoAtualDoAcolhido(acolhido.id);

      return {
        ...acolhido,
        internacaoAtual: internacaoAtual
          ? {
              id: internacaoAtual.id,
              etapaTratamento: internacaoAtual.etapaTratamento,
              convenio: internacaoAtual.convenio,
            }
          : undefined,
      };
    }),
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
    const situacao = this.situacaoSelecionada();
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
      const correspondeSituacao =
        situacao === 'todos' ||
        (situacao === 'inativo' && !acolhido.ativo) ||
        (situacao === 'sem_internacao' && acolhido.ativo && !acolhido.internacaoAtual) ||
        (acolhido.ativo && acolhido.internacaoAtual?.etapaTratamento === situacao);
      const correspondeConvenio =
        convenio === 'todos' || String(acolhido.internacaoAtual?.convenio.id) === convenio;

      return correspondeBusca && correspondeSituacao && correspondeConvenio;
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
    this.situacaoSelecionada.set('todos');
  }

  protected confirmarAcao(): void {
    const acao = this.acaoPendente();
    if (!acao) return;

    if (acao.tipo === 'exclusao') {
      if (!this.isAdmin) return;

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
    if (!this.isAdmin) return;

    this.acaoPendente.set({ tipo: 'exclusao', ...acolhido });
    this.dialogConfirmVisible.set(true);
  }

  ngOnInit(): void {
    if (this.painel() === 'responsaveis') this.painelResponsaveis.set('responsaveis');

    forkJoin({
      acolhidos: this.acolhidosService.getAllAcolhidos(),
      internacoes: this.internacoesService.getAllInternacoes(),
    }).subscribe();
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\W_\u0300-\u036f]/g, '');
  }
}
