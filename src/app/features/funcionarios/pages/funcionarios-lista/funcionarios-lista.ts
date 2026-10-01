import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { Funcionario } from '../../interfaces/funcionario';
import { FuncionarioCard } from '../../components/funcionario-card/funcionario-card';
import { FilterFuncionariosCard } from '../../components/filter-funcionarios-card/filter-funcionarios-card';
import { IconColor } from '../../../../shared/directives/icon-color';
import { FuncionariosService } from '../../services/funcionarios-service';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToggleFuncionarioDto } from '../../interfaces/toggle-funcionario-dto';

@Component({
  selector: 'app-funcionarios-lista',
  host: {
    class: 'flex gap-8 flex-col',
  },
  imports: [
    InfoCard,
    ButtonModule,
    LucideUserRoundPlus,
    DataViewModule,
    FuncionarioCard,
    FilterFuncionariosCard,
    LucideFunnelX,
    LucideSearchX,
    IconColor,
    RouterLink,
    ConfirmDialog,
  ],
  templateUrl: './funcionarios-lista.html',
  styleUrl: './funcionarios-lista.css',
})
export class FuncionariosLista implements OnInit {
  protected readonly funcionariosService = inject(FuncionariosService);
  protected readonly funcionarios = this.funcionariosService.funcionarios;
  protected readonly funcionariosCardsFiltrados = computed<FuncionarioCardContent[]>(() => {
    const busca = (this.busca() || '').toLowerCase().replace(/[\s\D]/g, '');
    const statusFiltro = this.statusSelecionado();
    const mesFiltro = this.mesSelecionado() === 'todos' ? null : Number(this.mesSelecionado());
    const cargoFiltro =
      this.cargoSelecionado() === 'todos' ? null : this.cargoSelecionado().toLowerCase();

    const funcionariosFiltrados: Funcionario[] = this.funcionarios().filter((funcionario) => {
      const nome = funcionario.nome.toLowerCase().replace(/\s/g, '');
      const cpf = funcionario.cpf.replace(/\D/g, '') || '';
      const email = funcionario.email.toLowerCase() || '';
      const mesAniversario = new Date(funcionario.dataNascimento) || null;

      const validBusca =
        !busca || nome.includes(busca) || cpf.includes(busca) || email.includes(busca);
      const validStatus =
        statusFiltro === 'todos' ||
        (statusFiltro === 'ativo' ? funcionario.ativo : !funcionario.ativo);
      const validMes = mesFiltro === null || mesAniversario.getMonth() === mesFiltro;
      const validCargo =
        cargoFiltro === null || funcionario.cargo?.nome.toLowerCase().includes(cargoFiltro);

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
  protected readonly busca = signal('');
  protected readonly cargoSelecionado = signal('todos');
  protected readonly statusSelecionado = signal('todos');
  protected readonly mesSelecionado = signal('todos');
  protected readonly dialogConfirmVisible = signal<boolean>(false);
  protected readonly acaoPendente = signal<ToggleFuncionarioDto | null>(null);
  protected readonly loading = this.funcionariosService.loading;

  ngOnInit(): void {
    this.funcionariosService.getAllFuncionarios().subscribe();
  }

  limparAcaoPendente(): void {
    this.acaoPendente.set(null);
  }

  toggleFuncionario(dto: ToggleFuncionarioDto): void {
    this.acaoPendente.set(dto);
    this.dialogConfirmVisible.set(true);
  }

  protected readonly confirmTitle = computed(() => {
    return this.acaoPendente()?.ativo ? 'Ativar funcionário' : 'Desativar funcionário';
  });

  protected readonly confirmMessage = computed(() => {
    return this.acaoPendente()?.ativo
      ? 'Deseja ativar este funcionário? Ele voltará a ficar disponível.'
      : 'Deseja desativar este funcionário? Ele deixará de ficar disponível.';
  });

  protected readonly confirmLabel = computed(() => {
    return this.acaoPendente()?.ativo ? 'Ativar' : 'Desativar';
  });

  protected readonly confirmSeverity = computed<'success' | 'danger'>(() => {
    return this.acaoPendente()?.ativo ? 'success' : 'danger';
  });

  confirmarAlteracaoStatus(): void {
    const dto = this.acaoPendente();

    if (!dto) return;

    const acao$ = dto.ativo
      ? this.funcionariosService.activateFuncionario(dto.id)
      : this.funcionariosService.deactivateFuncionario(dto.id);

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
}
