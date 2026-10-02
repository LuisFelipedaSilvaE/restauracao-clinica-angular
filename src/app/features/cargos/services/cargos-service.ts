import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cargo } from '../interfaces/cargo';
import { finalize, Observable, of, tap } from 'rxjs';
import { LoadingType } from '../../../shared/types/loading-type';
import { CargoRequest } from '../interfaces/cargo-request';

@Injectable({
  providedIn: 'root',
})
export class CargosService {
  private readonly baseAPIUrl = `${environment.apiUrl}/cargos`;
  private readonly http = inject(HttpClient);
  private readonly internalCargos = signal<Cargo[]>([]);
  readonly cargos = this.internalCargos.asReadonly();
  private readonly listaCarregada = signal(false);
  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  createCargo(cargo: CargoRequest): Observable<Cargo> {
    this.setLoading('mutation', true);

    return this.http.post<Cargo>(this.baseAPIUrl, cargo).pipe(
      tap((newCargo) => {
        this.internalCargos.update((cargos) => this.ordenarPorStatus([...cargos, newCargo]));
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  updateCargo(id: number, cargo: CargoRequest): Observable<Cargo> {
    this.setLoading('mutation', true);

    return this.http.put<Cargo>(`${this.baseAPIUrl}/${id}`, cargo).pipe(
      tap((cargoAtualizado) => this.substituirCargoNaLista(cargoAtualizado)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  getAllCargos(forceRefresh = false): Observable<Cargo[]> {
    if (this.listaCarregada() && !forceRefresh) {
      return of(this.internalCargos());
    }

    this.setLoading('list', true);

    return this.http.get<Cargo[]>(this.baseAPIUrl).pipe(
      tap((cargos) => {
        this.internalCargos.set(this.ordenarPorStatus(cargos));
        this.listaCarregada.set(true);
      }),
      finalize(() => {
        this.setLoading('list', false);
      }),
    );
  }

  getCargoById(id: number): Observable<Cargo | undefined> {
    this.setLoading('detail', false);

    return this.http.get<Cargo>(`${this.baseAPIUrl}/${id}`).pipe(
      finalize(() => {
        this.setLoading('detail', false);
      }),
    );
  }

  activateCargo(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.patch<void>(`${this.baseAPIUrl}/${id}/activate`, null).pipe(
      tap(() => this.atualizarStatusNaLista(id, true)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deactivateCargo(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.patch<void>(`${this.baseAPIUrl}/${id}`, null).pipe(
      tap(() => this.atualizarStatusNaLista(id, false)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  private setLoading(type: LoadingType, value: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [type]: value }));
  }

  private substituirCargoNaLista(cargoAtualizado: Cargo) {
    this.internalCargos.update((cargos) =>
      this.ordenarPorStatus(
        cargos.map((cargo) => (cargo.id === cargoAtualizado.id ? cargoAtualizado : cargo)),
      ),
    );
  }

  private atualizarStatusNaLista(id: number, ativo: boolean): void {
    this.internalCargos.update((cargos) => {
      const atualizada = cargos.map((cargo) => (cargo.id === id ? { ...cargo, ativo } : cargo));
      return this.ordenarPorStatus(atualizada);
    });
  }

  private ordenarPorStatus(cargos: Cargo[]): Cargo[] {
    return [...cargos].sort((a, b) => Number(b.ativo) - Number(a.ativo));
  }
}
