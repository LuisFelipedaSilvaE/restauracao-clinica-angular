import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Modalidade } from '../interfaces/modalidade';
import { finalize, Observable, of, shareReplay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalidadesService {
  private readonly baseAPIUrl = `${environment.apiUrl}/modalidades`;
  private readonly http = inject(HttpClient);

  private readonly internalModalidades = signal<Modalidade[]>([]);
  readonly modalidades = this.internalModalidades.asReadonly();

  private readonly carregado = signal(false);
  private requisicaoEmAndamento$: Observable<Modalidade[]> | null = null;

  private readonly internalLoadingList = signal(false);
  readonly loadingList = this.internalLoadingList.asReadonly();

  private readonly internalLoadingMutation = signal(false);
  readonly loadingMutation = this.internalLoadingMutation.asReadonly();

  private substituirModalidadeNaLista(modalidadeAtualizada: Modalidade) {
    this.internalModalidades.update((modalidades) =>
      this.ordenarPorStatus(
        modalidades.map((modalidade) =>
          modalidade.id === modalidadeAtualizada.id ? modalidadeAtualizada : modalidade,
        ),
      ),
    );
  }

  private atualizarStatusNaLista(id: number, ativa: boolean) {
    this.internalModalidades.update((modalidades) => {
      const atualizada = modalidades.map((modalidade) =>
        modalidade.id === id ? { ...modalidade, ativa } : modalidade,
      );
      return this.ordenarPorStatus(atualizada);
    });
  }

  private ordenarPorStatus(modalidades: Modalidade[]): Modalidade[] {
    return [...modalidades].sort((a, b) => Number(b.ativa) - Number(a.ativa));
  }

  getAllModalidades(forceRefresh = false): Observable<Modalidade[]> {
    if (this.carregado() && !forceRefresh) {
      return of(this.internalModalidades());
    }

    if (this.requisicaoEmAndamento$) {
      return this.requisicaoEmAndamento$;
    }

    this.internalLoadingList.set(true);

    this.requisicaoEmAndamento$ = this.http.get<Modalidade[]>(this.baseAPIUrl).pipe(
      tap((modalidades) => {
        this.internalModalidades.set(this.ordenarPorStatus(modalidades));
        this.carregado.set(true);
      }),
      finalize(() => {
        this.internalLoadingList.set(false);
        this.requisicaoEmAndamento$ = null;
      }),
      shareReplay(1),
    );

    return this.requisicaoEmAndamento$;
  }

  createModalidade(modalidade: Modalidade): Observable<Modalidade> {
    this.internalLoadingMutation.set(true);

    return this.http.post<Modalidade>(this.baseAPIUrl, modalidade).pipe(
      tap((newModalidade) => {
        this.internalModalidades.update((modalidades) =>
          this.ordenarPorStatus([...modalidades, newModalidade]),
        );
      }),
      finalize(() => this.internalLoadingMutation.set(false)),
    );
  }

  updateModalidade(id: number, modalidade: Modalidade): Observable<Modalidade> {
    this.internalLoadingMutation.set(true);

    return this.http.put<Modalidade>(`${this.baseAPIUrl}/${id}`, modalidade).pipe(
      tap((modalidadeAtualizada) => this.substituirModalidadeNaLista(modalidadeAtualizada)),
      finalize(() => this.internalLoadingMutation.set(false)),
    );
  }

  deactivateModalidade(id: number): Observable<void> {
    this.internalLoadingMutation.set(true);

    return this.http.delete<void>(`${this.baseAPIUrl}/${id}`).pipe(
      tap(() => this.atualizarStatusNaLista(id, false)),
      finalize(() => this.internalLoadingMutation.set(false)),
    );
  }

  activateModalidade(id: number): Observable<void> {
    this.internalLoadingMutation.set(true);

    return this.http.put<void>(`${this.baseAPIUrl}/${id}/activate`, null).pipe(
      tap(() => this.atualizarStatusNaLista(id, true)),
      finalize(() => this.internalLoadingMutation.set(false)),
    );
  }
}
