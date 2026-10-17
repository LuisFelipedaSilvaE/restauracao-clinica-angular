import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideBriefcase,
  LucideCake,
  LucideCalendarCheck,
  LucideDynamicIcon,
  LucideMail,
  LucidePencil,
  LucidePhone,
  LucidePower,
  LucidePowerOff,
  LucideUserRound,
  LucideUserRoundKey,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { BackButton } from '../../../../shared/components/back-button/back-button';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { IconColor } from '../../../../shared/directives/icon-color';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { EnderecoPipe } from '../../../../shared/pipes/endereco-pipe';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone-pipe';
import { localDateToDate } from '../../../../shared/utils/local-date';
import { DialogEdicaoFuncionario } from '../../components/dialog-edicao-funcionario/dialog-edicao-funcionario';
import { Funcionario } from '../../interfaces/funcionario';
import { FuncionarioActiveConfig } from '../../interfaces/funcionario-active-config';
import { FuncionariosService } from '../../services/funcionarios-service';

@Component({
  selector: 'app-funcionario-detalhado',
  host: {
    class: 'flex flex-col gap-4',
  },
  providers: [DatePipe],
  imports: [
    ButtonModule,
    TagModule,
    TooltipModule,
    LucidePencil,
    ProfileColor,
    IconColor,
    LucideDynamicIcon,
    LucideUserRound,
    LucideMail,
    LucideBriefcase,
    LucidePhone,
    LucideCake,
    LucideCalendarCheck,
    CommonModule,
    RouterLink,
    SiglaNomePipe,
    ConfirmDialog,
    BackButton,
    CpfPipe,
    TelefonePipe,
    EnderecoPipe,
    LucideUserRoundKey,
    DialogEdicaoFuncionario,
  ],
  templateUrl: './funcionario-detalhado.html',
  styleUrl: './funcionario-detalhado.css',
})
export class FuncionarioDetalhado implements OnInit {
  protected readonly funcionario = signal<Funcionario | undefined>(undefined);
  protected readonly cepFormatado = computed(() => {
    const cep: string | undefined = this.funcionario()?.cep;

    if (!cep) {
      return '';
    }

    return `${cep.slice(0, 5)}-${cep.slice(5)}`;
  });
  private readonly funcionariosService = inject(FuncionariosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly datePipe = inject(DatePipe);
  protected readonly loading = this.funcionariosService.loading;
  protected readonly confirmarAlteracao = signal(false);
  protected readonly edicaoVisivel = signal(false);
  protected readonly edicaoType = signal<'cargo' | 'senha' | null>(null);
  protected dataNascimentoNormalizada: string = '';
  protected activeConfig = computed<FuncionarioActiveConfig>(() => {
    return {
      button: {
        severity: this.funcionario()?.ativo ? 'warn' : 'success',
        label: this.funcionario()?.ativo ? 'Inativar' : 'Ativar',
        icon: this.funcionario()?.ativo ? LucidePowerOff : LucidePower,
      },
      severity: this.funcionario()?.ativo ? 'success' : 'secondary',
      label: this.funcionario()?.ativo ? 'Ativo' : 'Inativo',
    };
  });

  protected readonly toggleSeverity = computed<'danger' | 'success'>(() =>
    this.funcionario()?.ativo ? 'danger' : 'success',
  );
  protected readonly toggleMessage = computed(() =>
    this.funcionario()?.ativo
      ? 'Deseja inativar este funcionario? Ele deixará de ficar disponível.'
      : 'Deseja ativar este funcionario? Ele voltará a ficar disponível.',
  );

  ngOnInit(): void {
    this.getFuncionario();
  }

  protected alterarStatus(): void {
    const funcionario = this.funcionario();
    if (!funcionario) return;

    const proximoStatus = !funcionario.ativo;
    const acao$ = proximoStatus
      ? this.funcionariosService.activateFuncionario(funcionario.id)
      : this.funcionariosService.deactivateFuncionario(funcionario.id);

    acao$.subscribe({
      next: () => {
        this.funcionario.update((atual) =>
          atual ? { ...atual, ativo: proximoStatus } : undefined,
        );
        this.confirmarAlteracao.set(false);
      },
    });
  }

  getFuncionario(): void {
    const id: number = Number(this.route.snapshot.paramMap.get('id')!);

    if (Number.isNaN(id)) {
      this.router.navigate(['/funcionarios']);
      return;
    }

    this.funcionariosService.getFuncionarioById(id).subscribe({
      next: (res) => {
        this.funcionario.set(res);
        this.dataNascimentoNormalizada = this.normalizeDataNascimento(
          localDateToDate(this.funcionario()!.dataNascimento),
        );
      },
    });
  }

  normalizeDataNascimento(dataNascimento: Date): string {
    const data = this.datePipe.transform(dataNascimento, 'dd MMMM yyyy')!.split(' ');
    const dia = data[0];
    let mesTitle = data[1];
    mesTitle = mesTitle?.replace(mesTitle.charAt(0), mesTitle.charAt(0).toUpperCase());
    const ano = data[2];

    return `${dia} de ${mesTitle}, ${ano} (${this.calcularIdade(dataNascimento)} Anos)`;
  }

  calcularIdade(dataNascimento: Date): number {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const diferencaMeses = hoje.getMonth() - nascimento.getMonth();

    if (diferencaMeses < 0 || (diferencaMeses === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }

  toggleEdicaoSenha(): void {
    this.edicaoVisivel.set(true);
    this.edicaoType.set('senha');
  }

  toggleEdicaoCargo(): void {
    this.edicaoVisivel.set(true);
    this.edicaoType.set('cargo');
  }
}
