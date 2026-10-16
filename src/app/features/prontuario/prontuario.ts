import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ProntuarioHeader } from './components/prontuario-header/prontuario-header';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Acolhido } from '../acolhidos/interfaces/acolhido';
import { AcolhidosService } from '../acolhidos/services/acolhidos-service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { ProntuarioHeaderContent } from './interfaces/prontuario-header-content';
import { ProntuarioOutletData } from './interfaces/prontuario-outlet-data';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import {
  LucideApple,
  LucideBrain,
  LucideClipboardList,
  LucideDynamicIcon,
  LucideFileHeart,
  LucideFileText,
  LucideFolderOpen,
  LucideHeartHandshake,
} from '@lucide/angular';

@Component({
  selector: 'app-prontuario',
  host: {
    class: 'flex min-w-0 flex-col gap-4',
  },
  imports: [
    ProntuarioHeader,
    ConfirmDialog,
    TabsModule,
    RouterLink,
    RouterOutlet,
    LucideDynamicIcon,
  ],
  templateUrl: './prontuario.html',
  styleUrl: './prontuario.css',
})
export class Prontuario implements OnInit {
  readonly id = input<string>();
  private readonly router = inject(Router);
  protected readonly acolhido = signal<Acolhido | null>(null);
  private readonly acolhidosService = inject(AcolhidosService);
  private readonly messageService = inject(MessageService);
  protected readonly confirmarAlteracao = signal(false);
  protected readonly confirmarExclusao = signal(false);
  protected readonly detailLoading = computed(() => this.acolhidosService.loading().detail);
  protected readonly mutationLoading = computed(() => this.acolhidosService.loading().mutation);

  protected readonly abas = [
    {
      label: 'Dados gerais',
      route: 'dados-gerais',
      icon: LucideClipboardList,
    },
    {
      label: 'Relatórios médicos',
      route: 'relatorios-medicos',
      icon: LucideFileHeart,
    },
    {
      label: 'Relatórios sociais',
      route: 'relatorios-sociais',
      icon: LucideHeartHandshake,
    },
    {
      label: 'Relatórios psicológicos',
      route: 'relatorios-psicologicos',
      icon: LucideBrain,
    },
    {
      label: 'Nutrição',
      route: 'nutricao',
      icon: LucideApple,
    },
    {
      label: 'Declarações',
      route: 'declaracoes',
      icon: LucideFileText,
    },
    {
      label: 'Documentos',
      route: 'documentos',
      icon: LucideFolderOpen,
    },
  ];

  protected readonly headerData = computed<ProntuarioHeaderContent | null>(() => {
    const acolhido = this.acolhido();
    if (!acolhido) return null;

    return {
      ...acolhido,
      idade: this.acolhidosService.calcularIdade(acolhido.dataNascimento),
    };
  });

  protected readonly outletData = computed<ProntuarioOutletData>(() => ({
    acolhido: this.headerData(),
    loading: this.detailLoading(),
  }));

  protected readonly toggleLabel = computed(() => (this.acolhido()?.ativo ? 'Inativar' : 'Ativar'));

  protected readonly toggleMessage = computed(() =>
    this.acolhido()?.ativo
      ? 'Deseja inativar este acolhido? Ele deixará de ficar disponível.'
      : 'Deseja ativar este acolhido? Ele voltará a ficar disponível.',
  );

  protected readonly toggleSeverity = computed<'danger' | 'success'>(() =>
    this.acolhido()?.ativo ? 'danger' : 'success',
  );

  ngOnInit(): void {
    const idNumerico = Number(this.id());

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      this.voltarParaLista();
      return;
    }

    this.acolhidosService.getAcolhidoById(idNumerico).subscribe({
      next: (acolhido) => this.acolhido.set(acolhido),
      error: () => this.voltarParaLista(),
    });
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/acolhidos']);
  }

  protected alterarStatus(): void {
    const acolhido = this.acolhido();
    if (!acolhido) return;

    const novoStatus = !acolhido.ativo;
    const acao$ = novoStatus
      ? this.acolhidosService.activateAcolhido(acolhido.id)
      : this.acolhidosService.deactivateAcolhido(acolhido.id);

    acao$.subscribe({
      next: () => {
        this.acolhido.update((atual) => (atual ? { ...atual, ativo: novoStatus } : null));
        this.confirmarAlteracao.set(false);
      },
    });
  }

  protected excluirAcolhido(): void {
    const acolhido = this.acolhido();
    if (!acolhido) return;

    this.acolhidosService.deleteAcolhido(acolhido.id).subscribe({
      next: () => {
        this.confirmarExclusao.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Acolhido excluído!',
          detail: 'O acolhido foi excluído com sucesso.',
          life: 3000,
        });
        this.voltarParaLista();
      },
    });
  }
}
