import { Injectable, signal } from '@angular/core';
import { INTERNACOES_MOCK } from '../data/internacoes-mock';
import { InternacaoCardContent } from '../interfaces/internacao-card-content';
import { InternacaoFormDraft } from '../interfaces/internacao-form-draft';
import { Internacao } from '../interfaces/internacao';

@Injectable({
  providedIn: 'root',
})
export class InternacoesMockService {
  private readonly registros = signal<Internacao[]>(structuredClone(INTERNACOES_MOCK));
  private readonly rascunhoForm = signal<InternacaoFormDraft | null>(null);
  readonly internacoes = this.registros.asReadonly();

  criar(dados: Omit<Internacao, 'id'>): Internacao {
    const id = Math.max(0, ...this.registros().map((internacao) => internacao.id)) + 1;
    const novaInternacao = { ...structuredClone(dados), id };
    this.registros.update((internacoes) => [...internacoes, novaInternacao]);
    return novaInternacao;
  }

  buscar(id: number): Internacao | undefined {
    return this.internacoes().find((internacao) => internacao.id === id);
  }

  atualizar(id: number, dados: Omit<Internacao, 'id'>): boolean {
    if (!this.registros().some((internacao) => internacao.id === id)) return false;

    this.registros.update((internacoes) =>
      internacoes.map((internacao) =>
        internacao.id === id ? { ...structuredClone(dados), id } : internacao,
      ),
    );
    return true;
  }

  triagemEmUso(idTriagem: number, ignorarInternacaoId?: number): boolean {
    return this.internacoes().some(
      (internacao) => internacao.idTriagem === idTriagem && internacao.id !== ignorarInternacaoId,
    );
  }

  possuiInternacaoAtiva(idAcolhido: number, ignorarInternacaoId?: number): boolean {
    const etapasEncerradas = new Set(['Alta concedida', 'Desligado']);

    return this.internacoes().some(
      (internacao) =>
        internacao.idAcolhido === idAcolhido &&
        internacao.id !== ignorarInternacaoId &&
        !etapasEncerradas.has(internacao.etapaTratamento),
    );
  }

  salvarRascunho(rascunho: InternacaoFormDraft): void {
    this.rascunhoForm.set(structuredClone(rascunho));
  }

  consumirRascunho(): InternacaoFormDraft | null {
    const rascunho = this.rascunhoForm();
    this.rascunhoForm.set(null);
    return rascunho ? structuredClone(rascunho) : null;
  }

  obterSeverity(etapa: string): InternacaoCardContent['severity'] {
    const severidades: Record<string, InternacaoCardContent['severity']> = {
      'Em tratamento': 'success',
      'Próximo da alta': 'warn',
      'Alta vencida': 'danger',
      'Alta concedida': 'info',
      Desligado: 'secondary',
    };

    return severidades[etapa] ?? 'secondary';
  }
}
