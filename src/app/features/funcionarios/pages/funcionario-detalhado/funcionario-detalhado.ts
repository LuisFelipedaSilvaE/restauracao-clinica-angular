import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import {
  LucideArrowLeft,
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
  LucideIcon,
} from '@lucide/angular';
import { Funcionario } from '../../interfaces/funcionario';
import { ProfileColor } from '../../../../shared/directives/profile-color';
import { IconColor } from '../../../../shared/directives/icon-color';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuncionariosService } from '../../services/funcionarios-service';
import { FuncionarioActiveConfig } from '../../interfaces/funcionario-active-config';
import { SiglaNomePipe } from '../../../../shared/pipes/sigla-nome-pipe';

@Component({
  selector: 'app-funcionario-detalhado',
  host: {
    class: 'flex flex-col gap-4',
  },
  providers: [DatePipe],
  imports: [
    ButtonModule,
    TagModule,
    LucideArrowLeft,
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
  ],
  templateUrl: './funcionario-detalhado.html',
  styleUrl: './funcionario-detalhado.css',
})
export class FuncionarioDetalhado implements OnInit {
  private readonly funcionariosService = inject(FuncionariosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly datePipe = inject(DatePipe);
  protected data = signal<Funcionario | undefined>(undefined);
  protected dataNascimentoNormalizada: string = '';
  protected activeConfig = computed<FuncionarioActiveConfig>(() => {
    return {
      button: {
        severity: this.data()!.ativo ? 'warn' : 'success',
        label: this.data()!.ativo ? 'Inativar' : 'Ativar',
        icon: this.data()!.ativo ? LucidePowerOff : LucidePower,
      },
      severity: this.data()!.ativo ? 'success' : 'secondary',
      label: this.data()!.ativo ? 'Ativo' : 'Inativo',
    };
  });

  ngOnInit(): void {
    this.getFuncionario();
  }

  toggleFuncionario(): void {
    const acao$ = this.data()?.ativo
      ? this.funcionariosService.deactivateFuncionario(this.data()!.id)
      : this.funcionariosService.activateFuncionario(this.data()!.id);

    acao$.subscribe({
      next: (res) => this.data.set(res),
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
        this.data.set(res);
      },
    });

    this.dataNascimentoNormalizada = this.normalizeDataNascimento(this.data()!.dataNascimento!);
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
