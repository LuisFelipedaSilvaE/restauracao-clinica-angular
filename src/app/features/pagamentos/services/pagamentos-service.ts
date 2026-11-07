import { inject, Injectable, signal } from '@angular/core';
import { delay, finalize, Observable, of, tap, throwError } from 'rxjs';
import { LoadingType } from '../../../shared/types/loading-type';
import { Internacao } from '../../internacoes/interfaces/internacao';
import { InternacoesService } from '../../internacoes/services/internacoes-service';
import { Pagamento } from '../interfaces/pagamento';
import { PagamentoEstornoRequest } from '../interfaces/pagamento-estorno-request';
import { PagamentoRequest } from '../interfaces/pagamento-request';
import { PagamentoResumo } from '../interfaces/pagamento-resumo';

const MOCK_DELAY = 250;
const TAMANHO_MAXIMO_TEXTO = 500;

const PAGAMENTOS_MOCK: Pagamento[] = [
  {
    id: 1,
    internacaoId: 1,
    valor: 300,
    dataPagamento: '2026-10-17',
    competencia: '2026-10',
    observacao: null,
    status: 'CONFIRMADO',
    dataEstorno: null,
    motivoEstorno: null,
  },
  {
    id: 2,
    internacaoId: 1,
    valor: 250,
    dataPagamento: '2026-10-27',
    competencia: '2026-10',
    observacao: null,
    status: 'CONFIRMADO',
    dataEstorno: null,
    motivoEstorno: null,
  },
  {
    id: 3,
    internacaoId: 1,
    valor: 400,
    dataPagamento: '2026-11-04',
    competencia: '2026-11',
    observacao: null,
    status: 'CONFIRMADO',
    dataEstorno: null,
    motivoEstorno: null,
  },
  {
    id: 4,
    internacaoId: 2,
    valor: 500,
    dataPagamento: '2026-10-22',
    competencia: '2026-10',
    observacao: null,
    status: 'CONFIRMADO',
    dataEstorno: null,
    motivoEstorno: null,
  },
  {
    id: 5,
    internacaoId: 2,
    valor: 500,
    dataPagamento: '2026-11-01',
    competencia: '2026-11',
    observacao: null,
    status: 'CONFIRMADO',
    dataEstorno: null,
    motivoEstorno: null,
  },
];

@Injectable({
  providedIn: 'root',
})
export class PagamentosService {
  private readonly internacoesService = inject(InternacoesService);
  private readonly internalPagamentos = signal<Pagamento[]>(this.ordenar(PAGAMENTOS_MOCK));
  readonly pagamentos = this.internalPagamentos.asReadonly();
  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  getAllPagamentos(): Observable<Pagamento[]> {
    this.setLoading('list', true);

    return of(this.internalPagamentos()).pipe(
      delay(MOCK_DELAY),
      finalize(() => this.setLoading('list', false)),
    );
  }

  getPagamentoById(id: number): Observable<Pagamento> {
    this.setLoading('detail', true);
    const pagamento = this.internalPagamentos().find((item) => item.id === id);

    if (!pagamento) {
      this.setLoading('detail', false);
      return this.falha('Pagamento não encontrado.');
    }

    return of(pagamento).pipe(
      delay(MOCK_DELAY),
      finalize(() => this.setLoading('detail', false)),
    );
  }

  getPagamentosByInternacaoId(internacaoId: number): Observable<Pagamento[]> {
    this.setLoading('list', true);

    if (!this.getInternacao(internacaoId)) {
      this.setLoading('list', false);
      return this.falha('Internação não encontrada.');
    }

    const pagamentos = this.internalPagamentos().filter(
      (pagamento) => pagamento.internacaoId === internacaoId,
    );

    return of(pagamentos).pipe(
      delay(MOCK_DELAY),
      finalize(() => this.setLoading('list', false)),
    );
  }

  getResumoByInternacaoId(internacaoId: number): Observable<PagamentoResumo> {
    this.setLoading('detail', true);

    if (!this.getInternacao(internacaoId)) {
      this.setLoading('detail', false);
      return this.falha('Internação não encontrada.');
    }

    const totalPago = this.calcularTotalPago(internacaoId);

    return of({ internacaoId, totalPago }).pipe(
      delay(MOCK_DELAY),
      finalize(() => this.setLoading('detail', false)),
    );
  }

  createPagamento(request: PagamentoRequest): Observable<Pagamento> {
    const internacao = this.getInternacao(request.internacaoId);
    const erro = this.validarPagamento(request, internacao);

    if (erro) return this.falha(erro);

    this.setLoading('mutation', true);
    const novoPagamento: Pagamento = {
      id: this.proximoId(),
      internacaoId: request.internacaoId,
      valor: request.valor,
      dataPagamento: request.dataPagamento,
      competencia: request.competencia,
      observacao: request.observacao?.trim() || null,
      status: 'CONFIRMADO',
      dataEstorno: null,
      motivoEstorno: null,
    };

    return of(novoPagamento).pipe(
      delay(MOCK_DELAY),
      tap(() =>
        this.internalPagamentos.update((pagamentos) =>
          this.ordenar([...pagamentos, novoPagamento]),
        ),
      ),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  estornarPagamento(id: number, request: PagamentoEstornoRequest): Observable<Pagamento> {
    const pagamento = this.internalPagamentos().find((item) => item.id === id);
    const motivo = request.motivo.trim();

    if (!pagamento) return this.falha('Pagamento não encontrado.');
    if (pagamento.status === 'ESTORNADO') return this.falha('O pagamento já foi estornado.');
    if (!motivo) return this.falha('O motivo do estorno é obrigatório.');
    if (motivo.length > TAMANHO_MAXIMO_TEXTO) {
      return this.falha(`O motivo deve ter no máximo ${TAMANHO_MAXIMO_TEXTO} caracteres.`);
    }

    this.setLoading('mutation', true);
    const pagamentoEstornado: Pagamento = {
      ...pagamento,
      status: 'ESTORNADO',
      dataEstorno: new Date().toISOString(),
      motivoEstorno: motivo,
    };

    return of(pagamentoEstornado).pipe(
      delay(MOCK_DELAY),
      tap(() => {
        this.internalPagamentos.update((pagamentos) =>
          pagamentos.map((item) => (item.id === id ? pagamentoEstornado : item)),
        );
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  private validarPagamento(request: PagamentoRequest, internacao?: Internacao): string | null {
    if (!internacao) return 'Internação não encontrada.';
    if (!internacao.convenio.pagamento) {
      return 'A internação selecionada possui isenção de pagamento.';
    }
    const observacao = request.observacao?.trim() ?? '';
    if (request.valor > internacao.valorMensalidade && !observacao) {
      return 'Informe uma observação para pagamentos acima do valor da mensalidade.';
    }
    if (observacao.length > TAMANHO_MAXIMO_TEXTO) {
      return `A observação deve ter no máximo ${TAMANHO_MAXIMO_TEXTO} caracteres.`;
    }

    return null;
  }

  private getInternacao(id: number): Internacao | undefined {
    return this.internacoesService.internacoes().find((internacao) => internacao.id === id);
  }

  private calcularTotalPago(internacaoId: number): number {
    return this.internalPagamentos()
      .filter(
        (pagamento) => pagamento.internacaoId === internacaoId && pagamento.status === 'CONFIRMADO',
      )
      .reduce((total, pagamento) => total + pagamento.valor, 0);
  }

  private proximoId(): number {
    return Math.max(0, ...this.internalPagamentos().map((pagamento) => pagamento.id)) + 1;
  }

  private ordenar(pagamentos: Pagamento[]): Pagamento[] {
    return [...pagamentos].sort(
      (a, b) => b.dataPagamento.localeCompare(a.dataPagamento) || b.id - a.id,
    );
  }

  private setLoading(tipo: LoadingType, valor: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [tipo]: valor }));
  }

  private falha<T>(mensagem: string): Observable<T> {
    return throwError(() => new Error(mensagem));
  }
}
