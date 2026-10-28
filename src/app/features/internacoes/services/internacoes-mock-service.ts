import { Injectable, signal } from '@angular/core';
import { CONVENIOS_INTERNACOES_MOCK, INTERNACOES_MOCK } from '../data/internacoes-mock';
import { Internacao } from '../interfaces/internacao';
import { InternacaoCardContent } from '../interfaces/internacao-card-content';
import { InternacaoFormDraft } from '../interfaces/internacao-form-draft';

@Injectable({
  providedIn: 'root',
})
export class InternacoesMockService {
  private readonly registros = signal<Internacao[]>(structuredClone(INTERNACOES_MOCK));
  private readonly rascunhoForm = signal<InternacaoFormDraft | null>(null);
  readonly internacoes = this.registros.asReadonly();
  readonly convenios = structuredClone(CONVENIOS_INTERNACOES_MOCK);

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

  buscarAtualPorAcolhido(idAcolhido: number): Internacao | undefined {
    const etapasEncerradas = new Set(['Alta concedida', 'Desligado']);
    return this.internacoes().find(
      (internacao) =>
        internacao.idAcolhido === idAcolhido && !etapasEncerradas.has(internacao.etapaTratamento),
    );
  }

  calcularTempoInternado(dataAdmissao: Date): string {
    const diasTotais = Math.max(
      0,
      Math.floor((Date.now() - new Date(dataAdmissao).getTime()) / 86_400_000),
    );
    const meses = Math.floor(diasTotais / 30);
    const dias = diasTotais % 30;
    return meses === 0 ? `${dias}d` : `${meses} ${meses === 1 ? 'mês' : 'meses'} e ${dias}d`;
  }
}
