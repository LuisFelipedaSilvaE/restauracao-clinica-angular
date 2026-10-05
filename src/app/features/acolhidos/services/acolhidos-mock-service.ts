import { Injectable, signal } from '@angular/core';
import { ACOLHIDOS_MOCK, MODALIDADES_ACOLHIDOS_MOCK } from '../data/acolhidos-mock';
import { Acolhido } from '../interfaces/acolhido';

// Estado temporário compartilhado entre lista, cadastro e edição, até a integração com a API.
@Injectable({ providedIn: 'root' })
export class AcolhidosMockService {
  private readonly registros = signal<Acolhido[]>(structuredClone(ACOLHIDOS_MOCK));
  readonly acolhidos = this.registros.asReadonly();
  readonly modalidades = structuredClone(MODALIDADES_ACOLHIDOS_MOCK);

  criar(dados: Omit<Acolhido, 'id'>): void {
    const id = Math.max(0, ...this.registros().map((acolhido) => acolhido.id)) + 1;
    this.registros.update((lista) => [...lista, { ...dados, id }]);
  }

  atualizar(id: number, dados: Omit<Acolhido, 'id'>): boolean {
    if (!this.registros().some((acolhido) => acolhido.id === id)) return false;
    this.registros.update((lista) =>
      lista.map((acolhido) => (acolhido.id === id ? { ...dados, id } : acolhido)),
    );
    return true;
  }

  alterarStatus(id: number, status: string): void {
    this.registros.update((lista) =>
      lista.map((acolhido) => (acolhido.id === id ? { ...acolhido, status } : acolhido)),
    );
  }
}
