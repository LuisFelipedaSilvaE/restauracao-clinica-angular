import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoadingType } from '../../../shared/types/loading-type';
import { Responsavel } from '../interfaces/responsavel';
import { ResponsavelRequest } from '../interfaces/responsavel-request';

@Injectable({
  providedIn: 'root',
})
export class ResponsaveisService {
  private readonly baseAPIUrl = `${environment.apiUrl}/responsaveis`;
  private readonly http = inject(HttpClient);

  private readonly internalResponsaveis = signal<Responsavel[]>([]);
  readonly responsaveis = this.internalResponsaveis.asReadonly();

  private readonly listaCarregada = signal(false);

  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  getAllResponsaveis(forceRefresh = false): Observable<Responsavel[]> {
    if (this.listaCarregada() && !forceRefresh) {
      return of(this.internalResponsaveis());
    }

    this.setLoading('list', true);

    return this.http.get<Responsavel[]>(this.baseAPIUrl).pipe(
      tap((responsaveis) => {
        this.internalResponsaveis.set(this.ordenarPorStatus(responsaveis));
        this.listaCarregada.set(true);
      }),
      finalize(() => this.setLoading('list', false)),
    );
  }

  getResponsavelById(id: number): Observable<Responsavel> {
    this.setLoading('detail', true);

    return this.http
      .get<Responsavel>(`${this.baseAPIUrl}/${id}`)
      .pipe(finalize(() => this.setLoading('detail', false)));
  }

  createResponsavel(responsavel: ResponsavelRequest): Observable<Responsavel> {
    this.setLoading('mutation', true);

    return this.http.post<Responsavel>(this.baseAPIUrl, responsavel).pipe(
      tap((novoResponsavel) => {
        this.internalResponsaveis.update((responsaveis) =>
          this.ordenarPorStatus([...responsaveis, novoResponsavel]),
        );
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  updateResponsavel(id: number, responsavel: ResponsavelRequest): Observable<Responsavel> {
    this.setLoading('mutation', true);

    return this.http.put<Responsavel>(`${this.baseAPIUrl}/${id}`, responsavel).pipe(
      tap((responsavelAtualizado) => this.substituirResponsavelNaLista(responsavelAtualizado)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deactivateResponsavel(id: number): Observable<Responsavel> {
    this.setLoading('mutation', true);

    return this.http.patch<Responsavel>(`${this.baseAPIUrl}/${id}/deactivate`, null).pipe(
      tap((responsavelAtualizado) => this.substituirResponsavelNaLista(responsavelAtualizado)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  activateResponsavel(id: number): Observable<Responsavel> {
    this.setLoading('mutation', true);

    return this.http.patch<Responsavel>(`${this.baseAPIUrl}/${id}/reactivate`, null).pipe(
      tap((responsavelAtualizado) => this.substituirResponsavelNaLista(responsavelAtualizado)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deleteResponsavel(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.delete<void>(`${this.baseAPIUrl}/${id}`).pipe(
      tap(() =>
        this.internalResponsaveis.update((responsaveis) =>
          responsaveis.filter((responsavel) => responsavel.id !== id),
        ),
      ),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  private setLoading(type: LoadingType, value: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [type]: value }));
  }

  private substituirResponsavelNaLista(responsavelAtualizado: Responsavel): void {
    this.internalResponsaveis.update((responsaveis) =>
      this.ordenarPorStatus(
        responsaveis.map((responsavel) =>
          responsavel.id === responsavelAtualizado.id ? responsavelAtualizado : responsavel,
        ),
      ),
    );
  }

  private ordenarPorStatus(responsaveis: Responsavel[]): Responsavel[] {
    return [...responsaveis].sort((a, b) => Number(b.ativo) - Number(a.ativo));
  }
}
