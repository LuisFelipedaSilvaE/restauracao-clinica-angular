import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import {
  LucidePencil,
  LucidePowerOff,
  LucideUserRound,
  LucideMail,
  LucideBriefcase,
  LucidePhone,
  LucideCake,
  LucideCalendarCheck,
  LucideDynamicIcon,
  LucidePower,
} from '@lucide/angular';
import { Funcionario } from '../../interfaces/funcionario';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { IconColor } from '../../../../shared/directives/icon-color';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuncionariosService } from '../../services/funcionarios-service';
import { FuncionarioActiveConfig } from '../../interfaces/funcionario-active-config';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { BackButton } from '../../../../shared/components/back-button/back-button';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone-pipe';
import { EnderecoPipe } from '../../../../shared/pipes/endereco-pipe';

@Component({
  selector: 'app-funcionario-detalhado',
  host: {
    class: 'flex flex-col gap-4',
  },
  providers: [DatePipe],
  imports: [
    ButtonModule,
    TagModule,
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
          new Date(this.funcionario()?.dataNascimento!),
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
}
