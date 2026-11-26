import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth-service';
import { Convenio } from '../interfaces/convenio';
import { ConvenioRequest } from '../interfaces/convenio-request';
import { finalize, forkJoin, Observable, of, tap } from 'rxjs';
import { LoadingType } from '../../../shared/types/loading-type';

export interface IndicadoresConvenios {
  total: number;
  vagasTotais: number;
  vagasOcupadas: number;
  vagasDisponiveis: number;
}

@Injectable({
  providedIn: 'root',
})
export class ConveniosService {
  private readonly baseAPIUrl = `${environment.apiUrl}/convenios`;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly internalConvenios = signal<Convenio[]>([]);
  readonly convenios = this.internalConvenios.asReadonly();

  private readonly listaCarregada = signal(false);

  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  getIndicadores(): Observable<IndicadoresConvenios> {
    return forkJoin({
      total: this.http.get<number>(`${this.baseAPIUrl}/report/count-all`),
      vagasTotais: this.http.get<number>(`${this.baseAPIUrl}/report/total-vagas`),
      vagasOcupadas: this.http.get<number>(`${this.baseAPIUrl}/report/total-ocupacao`),
      vagasDisponiveis: this.getVagasDisponiveis(),
    });
  }

  getVagasDisponiveis(): Observable<number> {
    return this.http.get<number>(`${this.baseAPIUrl}/report/vagas-livres`);
  }

  constructor() {
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        this.internalConvenios.set([]);
        this.listaCarregada.set(false);
      }
    });
  }

  private setLoading(type: LoadingType, value: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [type]: value }));
  }

  private substituirConvenioNaLista(convenioAtualizado: Convenio) {
    this.internalConvenios.update((convenios) => {
      const existe = convenios.some((convenio) => convenio.id === convenioAtualizado.id);
      const atualizada = existe
        ? convenios.map((convenio) =>
            convenio.id === convenioAtualizado.id ? convenioAtualizado : convenio,
          )
        : [...convenios, convenioAtualizado];

      return this.ordenarPorStatus(atualizada);
    });
  }

  private atualizarStatusNaLista(id: number, ativo: boolean): void {
    this.internalConvenios.update((convenios) => {
      const atualizada = convenios.map((convenio) =>
        convenio.id === id ? { ...convenio, ativo } : convenio,
      );
      return this.ordenarPorStatus(atualizada);
    });
  }

  private ordenarPorStatus(convenios: Convenio[]): Convenio[] {
    return [...convenios].sort((a, b) => Number(b.ativo) - Number(a.ativo) || b.id - a.id);
  }

  getAllConvenios(forceRefresh = false): Observable<Convenio[]> {
    if (this.listaCarregada() && !forceRefresh) {
      return of(this.internalConvenios());
    }

    this.setLoading('list', true);

    return this.http.get<Convenio[]>(this.baseAPIUrl).pipe(
      tap((convenios) => {
        this.internalConvenios.set(this.ordenarPorStatus(convenios));
        this.listaCarregada.set(true);
      }),
      finalize(() => {
        this.setLoading('list', false);
      }),
    );
  }

  getConvenioById(id: number): Observable<Convenio> {
    this.setLoading('detail', true);

    return this.http
      .get<Convenio>(`${this.baseAPIUrl}/${id}`)
      .pipe(finalize(() => this.setLoading('detail', false)));
  }

  createConvenio(convenio: ConvenioRequest): Observable<Convenio> {
    this.setLoading('mutation', true);

    return this.http.post<Convenio>(this.baseAPIUrl, convenio).pipe(
      tap((novoConvenio) => {
        this.internalConvenios.update((convenios) =>
          this.ordenarPorStatus([...convenios, novoConvenio]),
        );
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  updateConvenio(id: number, convenio: ConvenioRequest): Observable<Convenio> {
    this.setLoading('mutation', true);

    return this.http.put<Convenio>(`${this.baseAPIUrl}/${id}`, convenio).pipe(
      tap((convenioAtualizado) => this.substituirConvenioNaLista(convenioAtualizado)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deactivateConvenio(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.patch<void>(`${this.baseAPIUrl}/${id}/deactivate`, null).pipe(
      tap(() => this.atualizarStatusNaLista(id, false)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  activateConvenio(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.patch<void>(`${this.baseAPIUrl}/${id}/activate`, null).pipe(
      tap(() => this.atualizarStatusNaLista(id, true)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deleteConvenio(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.delete<void>(`${this.baseAPIUrl}/${id}`).pipe(
      tap(() =>
        this.internalConvenios.update((convenios) =>
          convenios.filter((convenio) => convenio.id !== id),
        ),
      ),
      finalize(() => this.setLoading('mutation', false)),
    );
  }
}
