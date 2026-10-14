import { Injectable, signal } from '@angular/core';
import { ACOLHIDOS_MOCK } from '../data/acolhidos-mock';
import { Acolhido } from '../interfaces/acolhido';

@Injectable({ providedIn: 'root' })
export class AcolhidosMockService {
  private readonly registros = signal<Acolhido[]>(structuredClone(ACOLHIDOS_MOCK));
  readonly acolhidos = this.registros.asReadonly();

  calcularIdade(dataNascimento: Date): number {
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    if (
      hoje.getMonth() < nascimento.getMonth() ||
      (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())
    ) {
      idade--;
    }
    return Math.max(0, idade);
  }

  criar(dados: Omit<Acolhido, 'id'>): Acolhido {
    const id = Math.max(0, ...this.registros().map((acolhido) => acolhido.id)) + 1;
    const novoAcolhido = { ...dados, id };
    this.registros.update((lista) => [...lista, novoAcolhido]);
    return novoAcolhido;
  }

  buscar(id: number): Acolhido | undefined {
    return this.acolhidos().find((a) => a.id == id);
  }

  atualizar(id: number, dados: Omit<Acolhido, 'id'>): boolean {
    if (!this.registros().some((acolhido) => acolhido.id === id)) return false;
    this.registros.update((lista) =>
      lista.map((acolhido) => (acolhido.id === id ? { ...dados, id } : acolhido)),
    );
    return true;
  }

  alterarStatus(id: number, ativo: boolean): void {
    this.registros.update((lista) =>
      lista.map((acolhido) => (acolhido.id === id ? { ...acolhido, ativo } : acolhido)),
    );
  }
}
