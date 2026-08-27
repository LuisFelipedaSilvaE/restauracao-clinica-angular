import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Modalidade } from '../interfaces/modalidade';
import { ModalidadeRequest } from '../interfaces/modalidade-request';
import { finalize, Observable, of, tap } from 'rxjs';

type LoadingType = 'list' | 'mutation';

@Injectable({
  providedIn: 'root',
})
export class ModalidadesService {
  private readonly baseAPIUrl = `${environment.apiUrl}/modalidades`;
  private readonly http = inject(HttpClient);

  private readonly internalModalidades = signal<Modalidade[]>([]);
  readonly modalidades = this.internalModalidades.asReadonly();

  private readonly listaCarregada = signal(false);

  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  private setLoading(type: LoadingType, value: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [type]: value }));
  }

  private substituirModalidadeNaLista(modalidadeAtualizada: Modalidade) {
    this.internalModalidades.update((modalidades) =>
      this.ordenarPorStatus(
        modalidades.map((modalidade) =>
          modalidade.id === modalidadeAtualizada.id ? modalidadeAtualizada : modalidade,
        ),
      ),
    );
  }

  private atualizarStatusNaLista(id: number, ativo: boolean): void {
    this.internalModalidades.update((modalidades) => {
      const atualizada = modalidades.map((modalidade) =>
        modalidade.id === id ? { ...modalidade, ativo } : modalidade,
      );
      return this.ordenarPorStatus(atualizada);
    });
  }

  private ordenarPorStatus(modalidades: Modalidade[]): Modalidade[] {
    return [...modalidades].sort((a, b) => Number(b.ativo) - Number(a.ativo));
  }

  getAllModalidades(forceRefresh = false): Observable<Modalidade[]> {
    if (this.listaCarregada() && !forceRefresh) {
      return of(this.internalModalidades());
    }

    this.setLoading('list', true);

    return this.http.get<Modalidade[]>(this.baseAPIUrl).pipe(
      tap((modalidades) => {
        this.internalModalidades.set(this.ordenarPorStatus(modalidades));
        this.listaCarregada.set(true);
      }),
      finalize(() => {
        this.setLoading('list', false);
      }),
    );
  }

  createModalidade(modalidade: ModalidadeRequest): Observable<Modalidade> {
    this.setLoading('mutation', true);

    return this.http.post<Modalidade>(this.baseAPIUrl, modalidade).pipe(
      tap((newModalidade) => {
        this.internalModalidades.update((modalidades) =>
          this.ordenarPorStatus([...modalidades, newModalidade]),
        );
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  updateModalidade(id: number, modalidade: ModalidadeRequest): Observable<Modalidade> {
    this.setLoading('mutation', true);

    return this.http.put<Modalidade>(`${this.baseAPIUrl}/${id}`, modalidade).pipe(
      tap((modalidadeAtualizada) => this.substituirModalidadeNaLista(modalidadeAtualizada)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deactivateModalidade(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.delete<void>(`${this.baseAPIUrl}/${id}`).pipe(
      tap(() => this.atualizarStatusNaLista(id, false)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  activateModalidade(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.put<void>(`${this.baseAPIUrl}/${id}/activate`, null).pipe(
      tap(() => this.atualizarStatusNaLista(id, true)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }
}
