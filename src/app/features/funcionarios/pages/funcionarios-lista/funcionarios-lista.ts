import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FuncionarioCardContent } from '../../interfaces/funcionario-card-content';
import {
  LucideBriefcase,
  LucideUserRoundPlus,
  LucideUsersRound,
  LucideFunnelX,
  LucideSearchX,
} from '@lucide/angular';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { Funcionario } from '../../interfaces/funcionario';
import { FuncionarioCard } from '../../components/funcionario-card/funcionario-card';
import { FilterFuncionariosCard } from '../../components/filter-funcionarios-card/filter-funcionarios-card';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { FuncionariosService } from '../../services/funcionarios-service';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth-service';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToggleFuncionarioDto } from '../../interfaces/toggle-funcionario-dto';
import { CargosLista } from '../../../cargos/pages/cargos-lista/cargos-lista';
import { CargosService } from '../../../cargos/services/cargos-service';
import { localDateToDate } from '../../../../shared/utils/local-date';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { AccordionModule } from 'primeng/accordion';

type AccordionValue = string | number | string[] | number[] | null | undefined;

type AcaoPendente =
  | { tipo: 'status'; dados: ToggleFuncionarioDto }
  | { tipo: 'exclusao'; id: number; nome: string };

@Component({
  selector: 'app-funcionarios-lista',
  host: {
    class: 'flex gap-8 flex-col',
  },
  imports: [
    AccordionModule,
    InfoCard,
    PageHeader,
    ButtonModule,
    LucideBriefcase,
    LucideUserRoundPlus,
    DataViewModule,
    SkeletonModule,
    FuncionarioCard,
    FilterFuncionariosCard,
    LucideFunnelX,
    EmptyList,
    RouterLink,
    ConfirmDialog,
    CargosLista,
  ],
  templateUrl: './funcionarios-lista.html',
  styleUrl: './funcionarios-lista.css',
})
export class FuncionariosLista implements OnInit {
  protected readonly emptySearchIcon = LucideSearchX;
  protected readonly emptyFuncionariosIcon = LucideUsersRound;
  protected readonly funcionariosService = inject(FuncionariosService);
  private readonly cargosService = inject(CargosService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  protected readonly isAdmin = this.authService.hasRole('ADMIN');
  protected readonly funcionarios = this.funcionariosService.funcionarios;
  protected readonly painelCargos = signal<AccordionValue>(null);
  protected readonly totalCargos = computed(() => this.cargosService.cargos().length);
  protected readonly funcionariosCardsFiltrados = computed<FuncionarioCardContent[]>(() => {
    const busca = this.normalizarTexto(this.busca());
    const buscaNumerica = /[a-z]/i.test(busca) ? '' : busca.replace(/\D/g, '');
    const statusFiltro = this.statusSelecionado();
    const mesFiltro = this.mesSelecionado() === 'todos' ? null : Number(this.mesSelecionado());
    const cargoFiltro =
      this.cargoSelecionado() === 'todos'
        ? null
        : this.normalizarTexto(this.cargoSelecionado());

    const funcionariosFiltrados: Funcionario[] = this.funcionarios().filter((funcionario) => {
      const nome = this.normalizarTexto(funcionario.nome);
      const cpf = funcionario.cpf.replace(/\D/g, '');
      const email = this.normalizarTexto(funcionario.email);
      const mesAniversario = localDateToDate(funcionario.dataNascimento);

      const validBusca =
        !busca ||
        nome.includes(busca) ||
        (Boolean(buscaNumerica) && cpf.includes(buscaNumerica)) ||
        email.includes(busca);
      const validStatus =
        statusFiltro === 'todos' ||
        (statusFiltro === 'ativo' ? funcionario.ativo : !funcionario.ativo);
      const validMes = mesFiltro === null || mesAniversario.getMonth() === mesFiltro;
      const validCargo =
        cargoFiltro === null ||
        this.normalizarTexto(funcionario.cargo?.nome).includes(cargoFiltro);

      return validBusca && validStatus && validMes && validCargo;
    });

    return funcionariosFiltrados.map((funcionario) => {
      return { ...funcionario, severity: 'warn' };
    });
  });
  protected readonly infoFuncionarios = computed<InfoCardContent[]>(() => {
    const funcionarios = this.funcionarios();
    const total = funcionarios.length;
    const ativos = funcionarios.filter((f) => f.ativo).length;
    const inativos = funcionarios.filter((f) => !f.ativo).length;

    return [
      {
        value: total,
        label: 'Total de funcionários',
        icon: LucideUsersRound,
        color: '#e7000b',
      },
      {
        value: ativos,
        label: 'Ativos',
        icon: LucideBriefcase,
        color: '#00a63e',
      },
      {
        value: inativos,
        label: 'Inativos',
        icon: LucideUsersRound,
        color: '#4a5565',
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
  protected readonly busca = signal('');
  protected readonly cargoSelecionado = signal('todos');
  protected readonly statusSelecionado = signal('todos');
  protected readonly mesSelecionado = signal('todos');
  protected readonly first = signal(0);
  protected readonly dialogConfirmVisible = signal<boolean>(false);
  protected readonly acaoPendente = signal<AcaoPendente | null>(null);
  protected readonly loading = this.funcionariosService.loading;
  protected readonly skeletonCards = Array.from({ length: 10 });

  constructor() {
    effect(() => {
      this.busca();
      this.cargoSelecionado();
      this.statusSelecionado();
      this.mesSelecionado();
      this.first.set(0);
    });
  }

  ngOnInit(): void {
    this.funcionariosService.getAllFuncionarios().subscribe();
  }

  limparAcaoPendente(): void {
    this.acaoPendente.set(null);
  }

  toggleFuncionario(dto: ToggleFuncionarioDto): void {
    this.acaoPendente.set({ tipo: 'status', dados: dto });
    this.dialogConfirmVisible.set(true);
  }

  solicitarExclusao(funcionario: { id: number; nome: string }): void {
    if (!this.isAdmin) return;

    this.acaoPendente.set({ tipo: 'exclusao', ...funcionario });
    this.dialogConfirmVisible.set(true);
  }

  protected readonly confirmTitle = computed(() => {
    const acao = this.acaoPendente();
    if (acao?.tipo === 'exclusao') return 'Excluir funcionário';
    return acao?.dados.ativo ? 'Ativar funcionário' : 'Desativar funcionário';
  });

  protected readonly confirmMessage = computed(() => {
    const acao = this.acaoPendente();
    if (acao?.tipo === 'exclusao') {
      return `Deseja excluir ${acao.nome}? Esta ação não poderá ser desfeita.`;
    }
    return acao?.dados.ativo
      ? 'Deseja ativar este funcionário? Ele voltará a ficar disponível.'
      : 'Deseja desativar este funcionário? Ele deixará de ficar disponível.';
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

  confirmarAcao(): void {
    const acao = this.acaoPendente();

    if (!acao) return;

    if (acao.tipo === 'exclusao') {
      if (!this.isAdmin) return;

      this.funcionariosService.deleteFuncionario(acao.id).subscribe({
        next: () => {
          this.dialogConfirmVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Funcionário excluído!',
            detail: 'O funcionário foi excluído com sucesso.',
            life: 3000,
          });
        },
      });
      return;
    }

    const acao$ = acao.dados.ativo
      ? this.funcionariosService.activateFuncionario(acao.dados.id)
      : this.funcionariosService.deactivateFuncionario(acao.dados.id);

    acao$.subscribe({
      next: () => this.dialogConfirmVisible.set(false),
      error: () => {},
    });
  }

  clearFilters(): void {
    this.busca.set('');
    this.cargoSelecionado.set('todos');
    this.statusSelecionado.set('todos');
    this.mesSelecionado.set('todos');
  }

  private normalizarTexto(valor?: string | null): string {
    return (valor ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }
}
