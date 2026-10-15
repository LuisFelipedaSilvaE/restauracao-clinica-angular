import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Convenio } from '../interfaces/convenio';
import { ConvenioRequest } from '../interfaces/convenio-request';
import { finalize, Observable, of, tap } from 'rxjs';
import { LoadingType } from '../../../shared/types/loading-type';

@Injectable({
  providedIn: 'root',
})
export class ConveniosService {
  private readonly baseAPIUrl = `${environment.apiUrl}/convenios`;
  private readonly http = inject(HttpClient);

  private readonly internalConvenios = signal<Convenio[]>([]);
  readonly convenios = this.internalConvenios.asReadonly();

  private readonly listaCarregada = signal(false);

  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  private setLoading(type: LoadingType, value: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [type]: value }));
  }

  private substituirConvenioNaLista(convenioAtualizado: Convenio) {
    this.internalConvenios.update((convenios) =>
      this.ordenarPorStatus(
        convenios.map((convenio) =>
          convenio.id === convenioAtualizado.id ? convenioAtualizado : convenio,
        ),
      ),
    );
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
    return [...convenios].sort((a, b) => Number(b.ativo) - Number(a.ativo));
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

    return this.http.delete<void>(`${this.baseAPIUrl}/${id}`).pipe(
      tap(() => this.atualizarStatusNaLista(id, false)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  activateConvenio(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.put<void>(`${this.baseAPIUrl}/${id}/activate`, null).pipe(
      tap(() => this.atualizarStatusNaLista(id, true)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }
}
