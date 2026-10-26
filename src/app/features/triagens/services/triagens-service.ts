import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoadingType } from '../../../shared/types/loading-type';
import { ConveniosService } from '../../convenios/services/convenios-service';
import { Triagem } from '../interfaces/triagem';
import { TriagemReagendamentoRequest } from '../interfaces/triagem-reagendamento-request';
import { TriagemRequest } from '../interfaces/triagem-request';

@Injectable({
  providedIn: 'root',
})
export class TriagensService {
  private readonly baseAPIUrl = `${environment.apiUrl}/triagens`;
  private readonly http = inject(HttpClient);
  private readonly conveniosService = inject(ConveniosService);
  private readonly internalTriagens = signal<Triagem[]>([]);
  readonly triagens = computed(() => {
    const conveniosPorId = new Map(
      this.conveniosService.convenios().map((convenio) => [convenio.id, convenio]),
    );

    return this.internalTriagens().map((triagem) => ({
      ...triagem,
      convenio: conveniosPorId.get(triagem.convenio.id) ?? triagem.convenio,
    }));
  });
  private readonly listaCarregada = signal(false);
  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  createTriagem(triagem: TriagemRequest): Observable<Triagem> {
    this.setLoading('mutation', true);

    return this.http.post<Triagem>(this.baseAPIUrl, triagem).pipe(
      tap((newTriagem) => {
        this.internalTriagens.update((triagens) =>
          this.ordenarPorStatus([...triagens, newTriagem]),
        );
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  updateTriagem(id: number, triagem: TriagemRequest): Observable<Triagem> {
    this.setLoading('mutation', true);

    return this.http.put<Triagem>(`${this.baseAPIUrl}/${id}`, triagem).pipe(
      tap((triagemAtualizada) => this.substituirTriagemNaLista(triagemAtualizada)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  getAllTriagens(forceRefresh = false): Observable<Triagem[]> {
    if (this.listaCarregada() && !forceRefresh) {
      return of(this.internalTriagens());
    }

    this.setLoading('list', true);

    return this.http.get<Triagem[]>(this.baseAPIUrl).pipe(
      tap((triagens) => {
        this.internalTriagens.set(this.ordenarPorStatus(triagens));
        this.listaCarregada.set(true);
      }),
      finalize(() => {
        this.setLoading('list', false);
      }),
    );
  }

  getTriagemById(id: number): Observable<Triagem | undefined> {
    this.setLoading('detail', false);

    return this.http.get<Triagem>(`${this.baseAPIUrl}/${id}`).pipe(
      finalize(() => {
        this.setLoading('detail', false);
      }),
    );
  }

  concluirTriagem(id: number): Observable<Triagem> {
    this.setLoading('mutation', true);

    return this.http.patch<Triagem>(`${this.baseAPIUrl}/${id}/concluir`, null).pipe(
      tap((triagemAtualizada) => this.substituirTriagemNaLista(triagemAtualizada)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  reabrirTriagem(id: number): Observable<Triagem> {
    this.setLoading('mutation', true);

    return this.http.patch<Triagem>(`${this.baseAPIUrl}/${id}/desconcluir`, null).pipe(
      tap((triagemAtualizada) => this.substituirTriagemNaLista(triagemAtualizada)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  reagendarTriagem(id: number, request: TriagemReagendamentoRequest): Observable<Triagem> {
    this.setLoading('mutation', true);

    return this.http.patch<Triagem>(`${this.baseAPIUrl}/${id}/reagendar`, request).pipe(
      tap((triagemAtualizada) => this.substituirTriagemNaLista(triagemAtualizada)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deleteTriagem(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.delete<void>(`${this.baseAPIUrl}/${id}`).pipe(
      tap(() =>
        this.internalTriagens.update((triagens) => triagens.filter((triagem) => triagem.id !== id)),
      ),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  private setLoading(type: LoadingType, value: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [type]: value }));
  }

  private substituirTriagemNaLista(triagemAtualizada: Triagem) {
    this.internalTriagens.update((triagens) =>
      this.ordenarPorStatus(
        triagens.map((triagem) =>
          triagem.id === triagemAtualizada.id ? triagemAtualizada : triagem,
        ),
      ),
    );
  }

  private ordenarPorStatus(triagens: Triagem[]): Triagem[] {
    return [...triagens].sort((a, b) => Number(b.status) - Number(a.status));
  }
}
