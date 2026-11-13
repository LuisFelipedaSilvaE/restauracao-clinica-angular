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
import { CargosService } from '../../services/cargos-service';
import { CargoCard } from '../../components/cargo-card/cargo-card';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ToggleCargoDto } from '../../interfaces/toggle-cargo-dto';
import { CargoForm } from '../cargo-form/cargo-form';
import { Cargo } from '../../interfaces/cargo';
import { DataViewModule } from 'primeng/dataview';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';

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
  protected readonly acaoPendente = signal<ToggleCargoDto | null>(null);
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
    return this.acaoPendente()?.ativo ? 'Ativar cargo' : 'Desativar cargo';
  });

  protected readonly confirmMessage = computed(() => {
    return this.acaoPendente()?.ativo
      ? 'Deseja ativar este cargo? Ele voltará a ficar disponível.'
      : 'Deseja desativar este cargo? Ele deixará de ficar disponível.';
  });

  protected readonly confirmLabel = computed(() => {
    return this.acaoPendente()?.ativo ? 'Ativar' : 'Desativar';
  });

  protected readonly confirmSeverity = computed<'success' | 'danger'>(() => {
    return this.acaoPendente()?.ativo ? 'success' : 'danger';
  });

  ngOnInit(): void {
    this.cargosService.getAllCargos().subscribe();
  }

  confirmarAlteracaoStatus(): void {
    const dto = this.acaoPendente();

    if (!dto) return;

    const acao$ = dto.ativo
      ? this.cargosService.activateCargo(dto.id)
      : this.cargosService.deactivateCargo(dto.id);

    acao$.subscribe({
      next: () => this.dialogConfirmVisible.set(false),
    });
  }

  toggleCargo(dto: ToggleCargoDto): void {
    this.acaoPendente.set(dto);
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
