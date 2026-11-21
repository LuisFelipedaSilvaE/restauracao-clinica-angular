import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { finalize, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth-service';
import { LoadingType } from '../../../shared/types/loading-type';
import { StatusPagamento } from '../enums/status-pagamento';
import { Pagamento } from '../interfaces/pagamento';
import { PagamentoEstornoRequest } from '../interfaces/pagamento-estorno-request';
import { PagamentoRequest } from '../interfaces/pagamento-request';
import { PagamentoResumo } from '../interfaces/pagamento-resumo';

@Injectable({
  providedIn: 'root',
})
export class PagamentosService {
  private readonly baseAPIUrl = `${environment.apiUrl}/pagamentos`;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly internalPagamentos = signal<Pagamento[]>([]);
  readonly pagamentos = this.internalPagamentos.asReadonly();

  private readonly internalResumos = signal<Record<number, PagamentoResumo>>({});
  readonly resumos = this.internalResumos.asReadonly();

  private readonly listaCarregada = signal(false);

  private readonly loadingCounters: Record<LoadingType, number> = {
    list: 0,
    detail: 0,
    mutation: 0,
  };
  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  constructor() {
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        this.internalPagamentos.set([]);
        this.internalResumos.set({});
        this.listaCarregada.set(false);
      }
    });
  }

  getAllPagamentos(forceRefresh = false): Observable<Pagamento[]> {
    if (this.listaCarregada() && !forceRefresh) {
      return of(this.internalPagamentos());
    }

    this.setLoading('list', true);

    return this.http.get<Pagamento[]>(this.baseAPIUrl).pipe(
      map((pagamentos) => this.ordenar(pagamentos)),
      tap((pagamentos) => {
        this.internalPagamentos.set(pagamentos);
        this.listaCarregada.set(true);
      }),
      finalize(() => this.setLoading('list', false)),
    );
  }

  getPagamentoById(id: number): Observable<Pagamento> {
    this.setLoading('detail', true);

    return this.http
      .get<Pagamento>(`${this.baseAPIUrl}/${id}`)
      .pipe(finalize(() => this.setLoading('detail', false)));
  }

  getPagamentosByInternacaoId(internacaoId: number): Observable<Pagamento[]> {
    this.setLoading('list', true);

    return this.http.get<Pagamento[]>(`${this.baseAPIUrl}/internacao/${internacaoId}`).pipe(
      map((pagamentos) => this.ordenar(pagamentos)),
      tap((pagamentosDaInternacao) => {
        this.internalPagamentos.update((atuais) =>
          this.ordenar([
            ...atuais.filter((pagamento) => pagamento.internacaoId !== internacaoId),
            ...pagamentosDaInternacao,
          ]),
        );
      }),
      finalize(() => this.setLoading('list', false)),
    );
  }

  getResumoByInternacaoId(internacaoId: number): Observable<PagamentoResumo> {
    this.setLoading('detail', true);

    return this.http.get<PagamentoResumo>(`${this.baseAPIUrl}/internacao/${internacaoId}/total`).pipe(
      map((resumo) => ({
        internacaoId: resumo.internacaoId,
        totalPago: Number(resumo.totalPago),
      })),
      tap((resumo) => {
        this.internalResumos.update((atuais) => ({
          ...atuais,
          [resumo.internacaoId]: resumo,
        }));
      }),
      finalize(() => this.setLoading('detail', false)),
    );
  }

  createPagamento(request: PagamentoRequest): Observable<Pagamento> {
    this.setLoading('mutation', true);

    return this.http.post<Pagamento>(this.baseAPIUrl, request).pipe(
      tap((novoPagamento) => {
        this.internalPagamentos.update((pagamentos) =>
          this.ordenar([...pagamentos, novoPagamento]),
        );
        this.atualizarResumoLocal(novoPagamento.internacaoId);
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  estornarPagamento(id: number, request: PagamentoEstornoRequest): Observable<Pagamento> {
    this.setLoading('mutation', true);

    return this.http.patch<Pagamento>(`${this.baseAPIUrl}/${id}/estornar`, request).pipe(
      tap((pagamentoEstornado) => {
        this.internalPagamentos.update((pagamentos) =>
          this.ordenar(
            pagamentos.map((item) => (item.id === id ? pagamentoEstornado : item)),
          ),
        );
        this.atualizarResumoLocal(pagamentoEstornado.internacaoId);
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  private atualizarResumoLocal(internacaoId: number): void {
    const soma = this.internalPagamentos()
      .filter(
        (pagamento) =>
          pagamento.internacaoId === internacaoId && pagamento.status === StatusPagamento.ATIVO,
      )
      .reduce((total, pagamento) => total + Number(pagamento.valor), 0);

    const totalPago = Math.round(soma * 100) / 100;

    this.internalResumos.update((atuais) => ({
      ...atuais,
      [internacaoId]: { internacaoId, totalPago },
    }));
  }

  private ordenar(pagamentos: Pagamento[]): Pagamento[] {
    return [...pagamentos].sort(
      (a, b) => b.dataPagamento.localeCompare(a.dataPagamento) || b.id - a.id,
    );
  }

  private setLoading(tipo: LoadingType, ativo: boolean): void {
    this.loadingCounters[tipo] = Math.max(0, this.loadingCounters[tipo] + (ativo ? 1 : -1));
    this.internalLoading.update((loading) => ({
      ...loading,
      [tipo]: this.loadingCounters[tipo] > 0,
    }));
  }
}
