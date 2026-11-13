import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProntuarioHeader } from './components/prontuario-header/prontuario-header';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Acolhido } from '../acolhidos/interfaces/acolhido';
import { AcolhidosService } from '../acolhidos/services/acolhidos-service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { ProntuarioHeaderContent } from './interfaces/prontuario-header-content';
import { ProntuarioOutletData } from './interfaces/prontuario-outlet-data';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { filter, forkJoin, map } from 'rxjs';
import {
  LucideBedSingle,
  LucideDynamicIcon,
  LucideUserRound,
  LucideWalletCards,
} from '@lucide/angular';
import { InternacoesService } from '../internacoes/services/internacoes-service';
import { ETAPA_TRATAMENTO_CONFIG } from '../internacoes/interfaces/etapa-tratamento-config';

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
export class Prontuario {
  readonly acolhidoId = input<string>();
  readonly origem = input<'acolhidos' | 'internacao'>('acolhidos');
  readonly internacaoId = input<string>();
  private readonly router = inject(Router);
  protected readonly acolhido = signal<Acolhido | null>(null);
  private readonly acolhidosService = inject(AcolhidosService);
  private readonly internacoesService = inject(InternacoesService);
  private readonly messageService = inject(MessageService);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly confirmarAlteracao = signal(false);
  protected readonly confirmarExclusao = signal(false);
  protected readonly detailLoading = computed(
    () => this.acolhidosService.loading().detail || this.internacoesService.loading().list,
  );
  protected readonly mutationLoading = computed(() => this.acolhidosService.loading().mutation);
  protected readonly backConfig = computed(() => {
    const internacaoId = Number(this.internacaoId());

    if (this.origem() === 'internacao' && Number.isSafeInteger(internacaoId) && internacaoId > 0) {
      return {
        label: 'Voltar para internação',
        url: `/internacoes/${internacaoId}`,
      };
    }

    return {
      label: 'Voltar para lista de acolhidos',
      url: '/acolhidos',
    };
  });

  protected readonly abas = [
    {
      label: 'Internações',
      route: 'internacoes',
      icon: LucideBedSingle,
    },
    {
      label: 'Dados pessoais',
      route: 'dados-pessoais',
      icon: LucideUserRound,
    },
    {
      label: 'Pagamentos',
      route: 'pagamentos',
      icon: LucideWalletCards,
    },
  ];

  protected readonly abaAtiva = computed(() => {
    const path = this.currentUrl().split('?')[0].split('/').at(-1);
    return this.abas.some((aba) => aba.route === path) ? path : 'internacoes';
  });

  protected readonly headerData = computed<ProntuarioHeaderContent | null>(() => {
    const acolhido = this.acolhido();
    if (!acolhido) return null;

    const internacaoAtual = this.internacoesService.getInternacaoAtualDoAcolhido(acolhido.id);
    const etapaConfig = internacaoAtual
      ? ETAPA_TRATAMENTO_CONFIG[internacaoAtual.etapaTratamento]
      : null;

    return {
      ...acolhido,
      idade: this.acolhidosService.calcularIdade(acolhido.dataNascimento),
      internacaoAtual:
        internacaoAtual && etapaConfig
          ? {
              ...internacaoAtual,
              tempoInternado: this.internacoesService.calcularTempoInternado(
                internacaoAtual.dataEntrada,
                internacaoAtual.dataSaida,
              ),
              etapaTratamentoLabel: etapaConfig.label,
              severity: etapaConfig.severity,
            }
          : undefined,
    };
  });

  protected readonly outletData = computed<ProntuarioOutletData>(() => ({
    acolhido: this.headerData(),
    internacoes: this.internacoesService
      .internacoes()
      .filter((internacao) => internacao.acolhido.id === this.acolhido()?.id)
      .sort((a, b) => b.dataEntrada.localeCompare(a.dataEntrada)),
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

  constructor() {
    effect((onCleanup) => {
      const idNumerico = Number(this.acolhidoId());

      if (!Number.isSafeInteger(idNumerico) || idNumerico <= 0) {
        this.voltarParaOrigem();
        return;
      }

      this.acolhido.set(null);

      const subscription = forkJoin({
        acolhido: this.acolhidosService.getAcolhidoById(idNumerico),
        internacoes: this.internacoesService.getAllInternacoes(),
      }).subscribe({
        next: ({ acolhido }) => this.acolhido.set(acolhido),
        error: () => this.voltarParaOrigem(),
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected voltarParaOrigem(): void {
    this.router.navigateByUrl(this.backConfig().url);
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
        this.voltarParaOrigem();
      },
    });
  }
}
