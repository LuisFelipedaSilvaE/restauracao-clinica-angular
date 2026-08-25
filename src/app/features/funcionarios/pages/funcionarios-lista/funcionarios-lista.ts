import { Component, computed, signal } from '@angular/core';
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
  ],
  templateUrl: './funcionarios-lista.html',
  styleUrl: './funcionarios-lista.css',
})
export class FuncionariosLista {
  protected readonly funcionarios = signal<Funcionario[]>([
    {
      id: 1,
      nome: 'Dario Klein Alves',
      cpf: '111.111.111-11',
      role: 'Monitor',
      telefone: '(18) 11111-1111',
      email: 'exemplo1@email.com',
      dataNascimento: new Date(2026, 2, 14),
      ativo: true,
    },
    {
      id: 2,
      nome: 'Jonathan Joestar',
      cpf: '222.222.222-22',
      role: 'Psicólogo(a)',
      telefone: '(18) 22222-2222',
      email: 'exemplo2@email.com',
      dataNascimento: new Date(2026, 6, 22),
      ativo: false,
    },
    {
      id: 3,
      nome: 'Pedro Costa Moura',
      cpf: '333.333.333-33',
      role: 'Coordenador',
      telefone: '(18) 33333-3333',
      email: 'exemplo3@email.com',
      dataNascimento: new Date(2026, 10, 5),
      ativo: true,
    },
  ]);
  protected readonly funcionariosCardsFiltrados = computed<FuncionarioCardContent[]>(() => {
    const busca = (this.busca() || '').toLowerCase().replace(/\s/g, '');
    const statusFiltro = this.statusSelecionado();
    const mesFiltro = this.mesSelecionado() === 'todos' ? null : Number(this.mesSelecionado());
    const cargoFiltro =
      this.cargoSelecionado() === 'todos' ? null : this.cargoSelecionado().toLowerCase();

    const funcionariosFiltrados: Funcionario[] = this.funcionarios().filter((funcionario) => {
      const nome = funcionario.nome.toLowerCase().replace(/\s/g, '');
      const cpf = funcionario.cpf?.replace(/\D/g, '') || '';
      const email = funcionario.email?.toLowerCase() || '';

      const validBusca =
        !busca || nome.includes(busca) || cpf.includes(busca) || email.includes(busca);
      const validStatus =
        statusFiltro === 'todos' ||
        (statusFiltro === 'ativo' ? funcionario.ativo : !funcionario.ativo);
      const validMes = mesFiltro === null || funcionario.dataNascimento?.getMonth() === mesFiltro;
      const validCargo =
        cargoFiltro === null || funcionario.role?.toLowerCase().includes(cargoFiltro);

      return validBusca && validStatus && validMes && validCargo;
    });

    return funcionariosFiltrados.map((funcionario) => {
      const siglaNome = funcionario.nome
        .split(' ')
        .slice(0, 2)
        .map((p) => p.charAt(0))
        .join('')
        .toUpperCase();

      return { ...funcionario, siglaNome, severity: 'warn' };
    });
  });
  protected readonly infoFuncionarios = signal<InfoCardContent[]>([
    {
      value: 3,
      label: 'Total de funcionários',
      icon: LucideUsersRound,
      color: '#e7000b',
    },
    {
      value: 14,
      label: 'Ativos',
      icon: LucideBriefcase,
      color: '#00a63e',
    },
    {
      value: 2,
      label: 'Inativos',
      icon: LucideUsersRound,
      color: '#4a5565',
    },
  ]);
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

  clearFilters(): void {
    this.busca.set('');
    this.cargoSelecionado.set('todos');
    this.statusSelecionado.set('todos');
    this.mesSelecionado.set('todos');
  }
}
