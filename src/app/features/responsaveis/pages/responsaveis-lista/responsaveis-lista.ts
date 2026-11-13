import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideFunnelX,
  LucidePencil,
  LucidePlus,
  LucidePower,
  LucidePowerOff,
  LucideSearch,
  LucideSearchX,
  LucideTrash2,
  LucideUsersRound,
} from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ActionMenu } from '../../../../shared/components/action-menu/action-menu';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyList } from '../../../../shared/components/empty-list/empty-list';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { AcaoMenu } from '../../../../shared/interfaces/acao-menu';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone-pipe';
import { Responsavel } from '../../interfaces/responsavel';
import { ResponsaveisService } from '../../services/responsaveis-service';

type AcaoPendente =
  | { tipo: 'status'; responsavel: Responsavel; novoStatus: boolean }
  | { tipo: 'exclusao'; responsavel: Responsavel };

@Component({
  selector: 'responsaveis-lista',
  host: {
    class: 'block min-w-0',
  },
  imports: [
    ActionMenu,
    ButtonModule,
    ConfirmDialog,
    CpfPipe,
    DataViewModule,
    EmptyList,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    LucideFunnelX,
    LucidePlus,
    LucideSearch,
    ProfileColor,
    SelectModule,
    SiglaNomePipe,
    SkeletonModule,
    TagModule,
    TelefonePipe,
  ],
  templateUrl: './responsaveis-lista.html',
  styleUrl: './responsaveis-lista.css',
})
export class ResponsaveisLista implements OnInit {
  private readonly responsaveisService = inject(ResponsaveisService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  protected readonly responsaveis = this.responsaveisService.responsaveis;
  protected readonly loading = this.responsaveisService.loading;
  protected readonly busca = signal('');
  protected readonly situacaoSelecionada = signal<'todos' | 'ativos' | 'inativos'>('todos');
  protected readonly dialogConfirmVisible = signal(false);
  protected readonly acaoPendente = signal<AcaoPendente | null>(null);
  protected readonly skeletonCards = Array.from({ length: 6 });
  protected readonly emptyResponsaveisIcon = LucideUsersRound;
  protected readonly emptySearchIcon = LucideSearchX;
  protected readonly situacoes = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ativos', value: 'ativos' },
    { label: 'Inativos', value: 'inativos' },
  ];

  protected readonly responsaveisFiltrados = computed(() => {
    const busca = this.normalizarTexto(this.busca());
    const buscaNumerica = this.busca().replace(/\D/g, '');
    const situacao = this.situacaoSelecionada();

    return this.responsaveis().filter((responsavel) => {
      const correspondeBusca =
        !busca ||
        this.normalizarTexto(responsavel.nome).includes(busca) ||
        this.normalizarTexto(responsavel.email).includes(busca) ||
        this.normalizarTexto(responsavel.endereco.cidade).includes(busca) ||
        (!!buscaNumerica &&
          (responsavel.cpf.replace(/\D/g, '').includes(buscaNumerica) ||
            responsavel.telefone.replace(/\D/g, '').includes(buscaNumerica)));
      const correspondeSituacao =
        situacao === 'todos' ||
        (situacao === 'ativos' && responsavel.ativo) ||
        (situacao === 'inativos' && !responsavel.ativo);

      return correspondeBusca && correspondeSituacao;
    });
  });

  protected readonly dataviewPt = {
    root: { class: 'flex! min-w-0 flex-col gap-2' },
    content: { class: 'min-w-0 overflow-hidden bg-transparent!' },
    pcPaginator: { root: { class: 'border! border-border-default' } },
  };

  protected readonly confirmTitle = computed(() => {
    const acao = this.acaoPendente();
    if (acao?.tipo === 'exclusao') return 'Excluir responsável';
    return acao?.novoStatus ? 'Ativar responsável' : 'Inativar responsável';
  });

  protected readonly confirmMessage = computed(() => {
    const acao = this.acaoPendente();
    if (!acao) return '';
    if (acao.tipo === 'exclusao') {
      return `Deseja excluir ${acao.responsavel.nome}? Esta ação não poderá ser desfeita.`;
    }
    return acao.novoStatus
      ? `Deseja ativar ${acao.responsavel.nome}? O responsável voltará a ficar disponível.`
      : `Deseja inativar ${acao.responsavel.nome}? O responsável deixará de ficar disponível para novos vínculos.`;
  });

  protected readonly confirmLabel = computed(() => {
    const acao = this.acaoPendente();
    if (acao?.tipo === 'exclusao') return 'Excluir';
    return acao?.novoStatus ? 'Ativar' : 'Inativar';
  });

  protected readonly confirmSeverity = computed<'success' | 'danger'>(() => {
    const acao = this.acaoPendente();
    return acao?.tipo === 'status' && acao.novoStatus ? 'success' : 'danger';
  });

  ngOnInit(): void {
    this.responsaveisService.getAllResponsaveis().subscribe();
  }

  protected acoes(responsavel: Responsavel): AcaoMenu[] {
    return [
      {
        label: 'Editar dados',
        visible: responsavel.ativo,
        lucideIcon: LucidePencil,
        iconClass: 'h-4 w-4 text-action-secondary-text',
        command: () => this.editarResponsavel(responsavel.id),
      },
      {
        label: responsavel.ativo ? 'Inativar' : 'Ativar',
        lucideIcon: responsavel.ativo ? LucidePowerOff : LucidePower,
        iconClass: responsavel.ativo
          ? 'h-4 w-4 text-action-warning'
          : 'h-4 w-4 text-action-success',
        command: () => this.solicitarAlteracaoStatus(responsavel),
      },
      {
        label: 'Excluir',
        lucideIcon: LucideTrash2,
        iconClass: 'h-4 w-4 text-action-destructive',
        command: () => this.solicitarExclusao(responsavel),
      },
    ];
  }

  protected novoResponsavel(): void {
    this.router.navigate(['/responsaveis/criar'], {
      queryParams: { returnUrl: '/acolhidos?painel=responsaveis' },
    });
  }

  protected clearFilters(): void {
    this.busca.set('');
    this.situacaoSelecionada.set('todos');
  }

  protected solicitarAlteracaoStatus(responsavel: Responsavel): void {
    this.acaoPendente.set({ tipo: 'status', responsavel, novoStatus: !responsavel.ativo });
    this.dialogConfirmVisible.set(true);
  }

  protected solicitarExclusao(responsavel: Responsavel): void {
    this.acaoPendente.set({ tipo: 'exclusao', responsavel });
    this.dialogConfirmVisible.set(true);
  }

  protected confirmarAcao(): void {
    const acao = this.acaoPendente();
    if (!acao) return;

    if (acao.tipo === 'exclusao') {
      this.responsaveisService.deleteResponsavel(acao.responsavel.id).subscribe({
        next: () => {
          this.dialogConfirmVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Responsável excluído!',
            detail: 'O responsável foi excluído com sucesso.',
            life: 3000,
          });
        },
      });
      return;
    }

    const acao$ = acao.novoStatus
      ? this.responsaveisService.activateResponsavel(acao.responsavel.id)
      : this.responsaveisService.deactivateResponsavel(acao.responsavel.id);

    acao$.subscribe({ next: () => this.dialogConfirmVisible.set(false) });
  }

  private editarResponsavel(id: number): void {
    this.router.navigate(['/responsaveis', id, 'editar'], {
      queryParams: { returnUrl: '/acolhidos?painel=responsaveis' },
    });
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\W_\u0300-\u036f]/g, '');
  }
}
