import { Component, input, output, OutputEmitterRef, signal, WritableSignal } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import {
  LucideBriefcase,
  LucideCake,
  LucideSearch,
  LucideSlidersHorizontal,
} from '@lucide/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'filter-funcionarios-card',
  imports: [
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    FormsModule,
    LucideBriefcase,
    LucideSlidersHorizontal,
    LucideCake,
    LucideSearch,
  ],
  templateUrl: './filter-funcionarios-card.html',
  styleUrl: './filter-funcionarios-card.css',
})
export class FilterFuncionariosCard {
  readonly cargos = [
    { name: 'todos', code: 'todos' },
    { name: 'Administrador', code: 'Administrador' },
    { name: 'Coordenador', code: 'Coordenador' },
    { name: 'Enfermeiro(a)', code: 'Enfermeiro(a)' },
    { name: 'Assistente Social', code: 'Assistente' },
    { name: 'Nutricionista', code: 'Nutricionista' },
    { name: 'Psicólogo(a)', code: 'Psicólogo(a)' },
    { name: 'Monitor', code: 'Monitor' },
  ];
  readonly status = [
    { name: 'todos', code: 'todos' },
    { name: 'Ativo', code: 'ativo' },
    { name: 'Inativo', code: 'inativo' },
  ];
  readonly mesesDeNascimento = [
    { name: 'todos', code: 'todos' },
    { name: 'Janeiro', code: '0' },
    { name: 'Fevereiro', code: '1' },
    { name: 'Março', code: '2' },
    { name: 'Abril', code: '3' },
    { name: 'Maio', code: '4' },
    { name: 'Junho', code: '5' },
    { name: 'Julho', code: '6' },
    { name: 'Agosto', code: '7' },
    { name: 'Setembro', code: '8' },
    { name: 'Outubro', code: '9' },
    { name: 'Novembro', code: '10' },
    { name: 'Dezembro', code: '11' },
  ];
  readonly busca = input<string>();
  readonly cargoSelecionado = input<string>();
  readonly statusSelecionado = input<string>();
  readonly mesSelecionado = input<string>();
  protected readonly buscaChange = output<string>();
  protected readonly cargoSelecionadoChange = output<string>();
  protected readonly statusSelecionadoChange = output<string>();
  protected readonly mesSelecionadoChange = output<string>();
}
