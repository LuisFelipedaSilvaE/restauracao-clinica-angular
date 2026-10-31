import { Injectable, signal } from '@angular/core';
import { CONVENIOS_INTERNACOES_MOCK, INTERNACOES_MOCK } from '../data/internacoes-mock';
import { InternacaoMock } from '../interfaces/internacao-mock';
import { InternacaoFormDraft } from '../interfaces/internacao-form-draft';

@Injectable({
  providedIn: 'root',
})
export class InternacoesMockService {
  private readonly registros = signal<InternacaoMock[]>(structuredClone(INTERNACOES_MOCK));
  private readonly rascunhoForm = signal<InternacaoFormDraft | null>(null);
  readonly internacoes = this.registros.asReadonly();
  readonly convenios = structuredClone(CONVENIOS_INTERNACOES_MOCK);

  criar(dados: Omit<InternacaoMock, 'id'>): InternacaoMock {
    const id = Math.max(0, ...this.registros().map((internacao) => internacao.id)) + 1;
    const novaInternacao = { ...structuredClone(dados), id };
    this.registros.update((internacoes) => [...internacoes, novaInternacao]);
    return novaInternacao;
  }

  buscar(id: number): InternacaoMock | undefined {
    return this.internacoes().find((internacao) => internacao.id === id);
  }

  atualizar(id: number, dados: Omit<InternacaoMock, 'id'>): boolean {
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
}
