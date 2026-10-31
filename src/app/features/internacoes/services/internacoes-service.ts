import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoadingType } from '../../../shared/types/loading-type';
import { Internacao } from '../interfaces/internacao';
import { InternacaoCreateRequest } from '../interfaces/internacao-create-request';
import { InternacaoEndRequest } from '../interfaces/internacao-end-request';
import { InternacaoUpdateRequest } from '../interfaces/internacao-update-request';

@Injectable({
  providedIn: 'root',
})
export class InternacoesService {
  private readonly baseAPIUrl = `${environment.apiUrl}/internacoes`;
  private readonly http = inject(HttpClient);

  private readonly internalInternacoes = signal<Internacao[]>([]);
  readonly internacoes = this.internalInternacoes.asReadonly();

  private readonly listaCarregada = signal(false);

  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  getAllInternacoes(forceRefresh = false): Observable<Internacao[]> {
    if (this.listaCarregada() && !forceRefresh) {
      return of(this.internalInternacoes());
    }

    this.setLoading('list', true);

    return this.http.get<Internacao[]>(this.baseAPIUrl).pipe(
      tap((internacoes) => {
        this.internalInternacoes.set(internacoes);
        this.listaCarregada.set(true);
      }),
      finalize(() => this.setLoading('list', false)),
    );
  }

  getInternacaoById(id: number): Observable<Internacao> {
    this.setLoading('detail', true);

    return this.http
      .get<Internacao>(`${this.baseAPIUrl}/${id}`)
      .pipe(finalize(() => this.setLoading('detail', false)));
  }

  createInternacao(internacao: InternacaoCreateRequest): Observable<Internacao> {
    this.setLoading('mutation', true);

    return this.http.post<Internacao>(this.baseAPIUrl, internacao).pipe(
      tap((novaInternacao) => {
        this.internalInternacoes.update((internacoes) => [...internacoes, novaInternacao]);
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  updateInternacao(id: number, internacao: InternacaoUpdateRequest): Observable<Internacao> {
    this.setLoading('mutation', true);

    return this.http.put<Internacao>(`${this.baseAPIUrl}/${id}`, internacao).pipe(
      tap((internacaoAtualizada) => this.substituirInternacaoNaLista(internacaoAtualizada)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  encerrarInternacao(id: number, encerramento: InternacaoEndRequest): Observable<Internacao> {
    this.setLoading('mutation', true);

    return this.http.patch<Internacao>(`${this.baseAPIUrl}/${id}/end`, encerramento).pipe(
      tap((internacaoEncerrada) => this.substituirInternacaoNaLista(internacaoEncerrada)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deleteInternacao(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.delete<void>(`${this.baseAPIUrl}/${id}`).pipe(
      tap(() =>
        this.internalInternacoes.update((internacoes) =>
          internacoes.filter((internacao) => internacao.id !== id),
        ),
      ),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  private setLoading(type: LoadingType, value: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [type]: value }));
  }

  private substituirInternacaoNaLista(internacaoAtualizada: Internacao): void {
    this.internalInternacoes.update((internacoes) =>
      internacoes.map((internacao) =>
        internacao.id === internacaoAtualizada.id ? internacaoAtualizada : internacao,
      ),
    );
  }
}
