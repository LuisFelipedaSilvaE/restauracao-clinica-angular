import { Injectable, signal } from '@angular/core';
import { ACOLHIDOS_MOCK, MODALIDADES_ACOLHIDOS_MOCK } from '../data/acolhidos-mock';
import { Acolhido } from '../interfaces/acolhido';
import { AcolhidoCardContent } from '../interfaces/acolhido-card-content';

@Injectable({ providedIn: 'root' })
export class AcolhidosMockService {
  private readonly registros = signal<Acolhido[]>(structuredClone(ACOLHIDOS_MOCK));
  readonly acolhidos = this.registros.asReadonly();

  readonly modalidades = structuredClone(MODALIDADES_ACOLHIDOS_MOCK);
  obterSeverity(etapa: string): AcolhidoCardContent['severity'] {
    const severidades: Record<string, AcolhidoCardContent['severity']> = {
      'Em tratamento': 'success',
      'Próximo da alta': 'warn',
      'Alta vencida': 'danger',
      'Alta concedida': 'info',
      Desligado: 'secondary',
    };
    return severidades[etapa] ?? 'secondary';
  }

  calcularPrevisaoDeAlta(dataEntrada: Date): Date {
    const previsao = new Date(dataEntrada);
    previsao.setMonth(previsao.getMonth() + 3);
    return previsao;
  }

  calcularTempoInternado(dataEntrada: Date): string {
    const diasTotais = Math.max(
      0,
      Math.floor((Date.now() - new Date(dataEntrada).getTime()) / 86_400_000),
    );
    const meses = Math.floor(diasTotais / 30);
    const dias = diasTotais % 30;
    return meses === 0 ? `${dias}d` : `${meses} ${meses === 1 ? 'mês' : 'meses'} e ${dias}d`;
  }

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

  criar(dados: Omit<Acolhido, 'id'>): void {
    const id = Math.max(0, ...this.registros().map((acolhido) => acolhido.id)) + 1;
    this.registros.update((lista) => [...lista, { ...dados, id }]);
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

  alterarStatus(id: number, status: string): void {
    this.registros.update((lista) =>
      lista.map((acolhido) => (acolhido.id === id ? { ...acolhido, status } : acolhido)),
    );
  }
}
