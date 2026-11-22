import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideBriefcase,
  LucideFunnelX,
  LucidePlus,
  LucideSearch,
  LucideSearchX,
  LucideSlidersHorizontal,
} from '@lucide/angular';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { CargosService } from '../../services/cargos-service';
import { CargoCard } from '../../components/cargo-card/cargo-card';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToggleCargoDto } from '../../interfaces/toggle-cargo-dto';
import { CargoForm } from '../cargo-form/cargo-form';
import { Cargo } from '../../interfaces/cargo';
import { AuthService } from '../../../../core/services/auth-service';
import { DataViewModule } from 'primeng/dataview';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';

type AcaoPendente =
  | { tipo: 'status'; dados: ToggleCargoDto }
  | { tipo: 'exclusao'; id: number; nome: string };

@Component({
  selector: 'cargos-lista',
  host: {
    class: 'block min-w-0',
  },
  imports: [
    ButtonModule,
    CargoCard,
    LucideFunnelX,
    LucidePlus,
    LucideSearch,
    LucideSlidersHorizontal,
    EmptyList,
    ConfirmDialog,
    CargoForm,
    DataViewModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    SkeletonModule,
  ],
  templateUrl: './cargos-lista.html',
  styleUrl: './cargos-lista.css',
})
export class CargosLista implements OnInit {
  protected readonly emptyCargosIcon = LucideBriefcase;
  protected readonly emptySearchIcon = LucideSearchX;
  private readonly cargosService = inject(CargosService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  protected readonly isAdmin = this.authService.hasRole('ADMIN');
  protected readonly cargos = this.cargosService.cargos;
  protected readonly loading = this.cargosService.loading;
  protected readonly skeletonCards = Array.from({ length: 6 });
  protected readonly busca = signal('');
  protected readonly situacaoSelecionada = signal<'todos' | 'ativos' | 'inativos'>('todos');
  protected readonly situacoes = [
    { name: 'Todas as situações', code: 'todos' },
    { name: 'Ativos', code: 'ativos' },
    { name: 'Inativos', code: 'inativos' },
  ];
  protected readonly dialogConfirmVisible = signal<boolean>(false);
  protected readonly acaoPendente = signal<AcaoPendente | null>(null);
  protected readonly cargosFiltrados = computed(() => {
    const busca = this.normalizarTexto(this.busca());
    const situacao = this.situacaoSelecionada();

    return this.cargos().filter((cargo) => {
      const correspondeBusca = !busca || this.normalizarTexto(cargo.nome).includes(busca);
      const correspondeSituacao =
        situacao === 'todos' ||
        (situacao === 'ativos' && !!cargo.ativo) ||
        (situacao === 'inativos' && !cargo.ativo);

      return correspondeBusca && correspondeSituacao;
    });
  });

  protected readonly updateDialogVisible = signal<boolean>(false);
  protected readonly cargoToUpdate = signal<Cargo | null>(null);
  protected readonly dataviewPt = {
    root: {
      class: 'flex! flex-col gap-2',
    },
    content: {
      class: 'bg-transparent!',
    },
    pcPaginator: {
      root: {
        class: 'border! border-border-default bg-surface-subtle/20!',
      },
    },
  };

  protected readonly confirmTitle = computed(() => {
    const acao = this.acaoPendente();
    if (acao?.tipo === 'exclusao') return 'Excluir cargo';
    return acao?.dados.ativo ? 'Ativar cargo' : 'Desativar cargo';
  });

  protected readonly confirmMessage = computed(() => {
    const acao = this.acaoPendente();
    if (acao?.tipo === 'exclusao') {
      return `Deseja excluir ${acao.nome}? Esta ação não poderá ser desfeita.`;
    }
    return acao?.dados.ativo
      ? 'Deseja ativar este cargo? Ele voltará a ficar disponível.'
      : 'Deseja desativar este cargo? Ele deixará de ficar disponível.';
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

  ngOnInit(): void {
    this.cargosService.getAllCargos().subscribe();
  }

  confirmarAcao(): void {
    const acao = this.acaoPendente();

    if (!acao) return;

    if (acao.tipo === 'exclusao') {
      if (!this.isAdmin) return;

      this.cargosService.deleteCargo(acao.id).subscribe({
        next: () => {
          this.dialogConfirmVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Cargo excluído!',
            detail: 'O cargo foi excluído com sucesso.',
            life: 3000,
          });
        },
      });
      return;
    }

    if (!this.isAdmin) return;

    const acao$ = acao.dados.ativo
      ? this.cargosService.activateCargo(acao.dados.id)
      : this.cargosService.deactivateCargo(acao.dados.id);

    acao$.subscribe({
      next: () => this.dialogConfirmVisible.set(false),
    });
  }

  toggleCargo(dto: ToggleCargoDto): void {
    if (!this.isAdmin) return;

    this.acaoPendente.set({ tipo: 'status', dados: dto });
    this.dialogConfirmVisible.set(true);
  }

  solicitarExclusao(cargo: { id: number; nome: string }): void {
    if (!this.isAdmin) return;

    this.acaoPendente.set({ tipo: 'exclusao', ...cargo });
    this.dialogConfirmVisible.set(true);
  }

  editCargo(cargo: Cargo): void {
    this.updateDialogVisible.set(true);
    this.cargoToUpdate.set(cargo);
  }

  registerCargo(): void {
    this.updateDialogVisible.set(true);
    this.cargoToUpdate.set(null);
  }

  protected clearFilters(): void {
    this.busca.set('');
    this.situacaoSelecionada.set('todos');
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\W_\u0300-\u036f]/g, '');
  }
}
