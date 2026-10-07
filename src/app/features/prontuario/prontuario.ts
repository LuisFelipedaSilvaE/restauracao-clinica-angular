import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ProntuarioHeader } from './components/prontuario-header/prontuario-header';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Acolhido } from '../acolhidos/interfaces/acolhido';
import { AcolhidosMockService } from '../acolhidos/services/acolhidos-mock-service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { ProntuarioHeaderContent } from './interfaces/prontuario-header-content';
import { TabsModule } from 'primeng/tabs';
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
  private readonly acolhidoMockService = inject(AcolhidosMockService);
  protected readonly confirmarAlteracao = signal(false);

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
      idade: this.acolhidoMockService.calcularIdade(acolhido.dataNascimento),
      previsaoDeAlta: this.acolhidoMockService.calcularPrevisaoDeAlta(acolhido.dataEntrada),
      tempoInternado: this.acolhidoMockService.calcularTempoInternado(acolhido.dataEntrada),
      severity: this.acolhidoMockService.obterSeverity(acolhido.etapaTratamento),
    };
  });

  protected readonly toggleLabel = computed(() =>
    this.acolhido()?.status === 'Ativo' ? 'Inativar' : 'Ativar',
  );

  protected readonly toggleMessage = computed(() =>
    this.acolhido()?.status === 'Ativo'
      ? 'Deseja inativar este acolhido? Ele deixará de ficar disponível.'
      : 'Deseja ativar este acolhido? Ele voltará a ficar disponível.',
  );

  protected readonly toggleSeverity = computed<'danger' | 'success'>(() =>
    this.acolhido()?.status === 'Ativo' ? 'danger' : 'success',
  );

  ngOnInit(): void {
    const idNumerico = Number(this.id());

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      this.voltarParaLista();
      return;
    }

    const acolhido = this.acolhidoMockService.buscar(idNumerico);

    if (!acolhido) {
      this.voltarParaLista();
      return;
    }

    this.acolhido.set(acolhido);
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/acolhidos']);
  }

  protected alterarStatus(): void {
    const acolhido = this.acolhido();
    if (!acolhido) return;

    const novoStatus = acolhido.status === 'Ativo' ? 'Inativo' : 'Ativo';
    this.acolhidoMockService.alterarStatus(acolhido.id, novoStatus);
    this.acolhido.update((atual) => (atual ? { ...atual, status: novoStatus } : null));
    this.confirmarAlteracao.set(false);
  }
}
