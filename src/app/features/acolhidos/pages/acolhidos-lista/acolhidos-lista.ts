import { Component, computed, inject, signal } from '@angular/core';
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
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { InternacoesMockService } from '../../../internacoes/services/internacoes-mock-service';
import { AcolhidoCard } from '../../components/acolhido-card/acolhido-card';
import { FilterAcolhidosCard } from '../../components/filter-acolhidos-card/filter-acolhidos-card';
import { AcolhidoCardContent } from '../../interfaces/acolhido-card-content';
import { FilterOption } from '../../interfaces/filter-option';
import { ToggleAcolhidoDto } from '../../interfaces/toggle-acolhido-dto';
import { AcolhidosMockService } from '../../services/acolhidos-mock-service';

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
export class AcolhidosLista {
  protected readonly emptySearchIcon = LucideSearchX;
  protected readonly emptyAcolhidosIcon = LucideUserRoundX;
  private readonly acolhidosService = inject(AcolhidosMockService);
  private readonly internacoesService = inject(InternacoesMockService);
  protected readonly acolhidos = this.acolhidosService.acolhidos;
  protected readonly loading = signal(false);
  protected readonly skeletonCards = Array.from({ length: 10 });
  protected readonly acaoPendente = signal<ToggleAcolhidoDto | null>(null);
  protected readonly busca = signal('');
  protected readonly convenioSelecionado = signal('todos');
  protected readonly statusSelecionado = signal('todos');
  protected readonly dialogConfirmVisible = signal(false);

  protected readonly convenios = computed<FilterOption[]>(() => [
    { name: 'Todos os convênios', code: 'todos' },
    ...this.internacoesService.convenios.map((convenio) => ({
      name: convenio.descricao,
      code: convenio.descricao,
    })),
  ]);

  private readonly acolhidosCards = computed<AcolhidoCardContent[]>(() =>
    this.acolhidos().map((acolhido) => {
      const internacao = this.internacoesService.buscarAtualPorAcolhido(acolhido.id);
      const convenio = internacao
        ? this.internacoesService.convenios.find((item) => item.id === internacao.idConvenio)
        : undefined;

      return {
        ...acolhido,
        internacaoAtual:
          internacao && convenio
            ? {
                id: internacao.id,
                etapaTratamento: internacao.etapaTratamento,
                convenio,
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

  protected readonly confirmTitle = computed(() =>
    this.acaoPendente()?.ativo ? 'Ativar acolhido' : 'Desativar acolhido',
  );
  protected readonly confirmMessage = computed(() =>
    this.acaoPendente()?.ativo
      ? 'Deseja ativar este acolhido? Ele voltará a ficar disponível.'
      : 'Deseja desativar este acolhido? Ele deixará de ficar disponível.',
  );
  protected readonly confirmLabel = computed(() =>
    this.acaoPendente()?.ativo ? 'Ativar' : 'Desativar',
  );
  protected readonly confirmSeverity = computed<'success' | 'danger'>(() =>
    this.acaoPendente()?.ativo ? 'success' : 'danger',
  );

  protected clearFilters(): void {
    this.busca.set('');
    this.convenioSelecionado.set('todos');
    this.statusSelecionado.set('todos');
  }

  protected confirmarAlteracaoStatus(): void {
    const dto = this.acaoPendente();
    if (!dto) return;
    this.acolhidosService.alterarStatus(dto.id, dto.ativo);
    this.dialogConfirmVisible.set(false);
  }

  protected toggleAcolhido(dto: ToggleAcolhidoDto): void {
    this.acaoPendente.set(dto);
    this.dialogConfirmVisible.set(true);
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\W_\u0300-\u036f]/g, '');
  }
}
