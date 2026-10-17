import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoadingType } from '../../../shared/types/loading-type';
import { localDateToDate } from '../../../shared/utils/local-date';
import { Acolhido } from '../interfaces/acolhido';
import { AcolhidoRequest } from '../interfaces/acolhido-request';

@Injectable({
  providedIn: 'root',
})
export class AcolhidosService {
  private readonly baseAPIUrl = `${environment.apiUrl}/acolhidos`;
  private readonly http = inject(HttpClient);

  private readonly internalAcolhidos = signal<Acolhido[]>([]);
  readonly acolhidos = this.internalAcolhidos.asReadonly();

  private readonly listaCarregada = signal(false);

  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  getAllAcolhidos(forceRefresh = false): Observable<Acolhido[]> {
    if (this.listaCarregada() && !forceRefresh) {
      return of(this.internalAcolhidos());
    }

    this.setLoading('list', true);

    return this.http.get<Acolhido[]>(this.baseAPIUrl).pipe(
      tap((acolhidos) => {
        this.internalAcolhidos.set(this.ordenarPorStatus(acolhidos));
        this.listaCarregada.set(true);
      }),
      finalize(() => this.setLoading('list', false)),
    );
  }

  getAcolhidoById(id: number): Observable<Acolhido> {
    this.setLoading('detail', true);

    return this.http
      .get<Acolhido>(`${this.baseAPIUrl}/${id}`)
      .pipe(finalize(() => this.setLoading('detail', false)));
  }

  createAcolhido(acolhido: AcolhidoRequest): Observable<Acolhido> {
    this.setLoading('mutation', true);

    return this.http.post<Acolhido>(this.baseAPIUrl, acolhido).pipe(
      tap((novoAcolhido) => {
        this.internalAcolhidos.update((acolhidos) =>
          this.ordenarPorStatus([...acolhidos, novoAcolhido]),
        );
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  updateAcolhido(id: number, acolhido: AcolhidoRequest): Observable<Acolhido> {
    this.setLoading('mutation', true);

    return this.http.put<Acolhido>(`${this.baseAPIUrl}/${id}`, acolhido).pipe(
      tap((acolhidoAtualizado) => this.substituirAcolhidoNaLista(acolhidoAtualizado)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deactivateAcolhido(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.patch<void>(`${this.baseAPIUrl}/${id}/deactivate`, null).pipe(
      tap(() => this.atualizarStatusNaLista(id, false)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  activateAcolhido(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.patch<void>(`${this.baseAPIUrl}/${id}/reactivate`, null).pipe(
      tap(() => this.atualizarStatusNaLista(id, true)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deleteAcolhido(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.delete<void>(`${this.baseAPIUrl}/${id}`).pipe(
      tap(() => this.internalAcolhidos.update((acolhidos) => acolhidos.filter((a) => a.id !== id))),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  calcularIdade(dataNascimento: string | Date): number {
    const nascimento =
      typeof dataNascimento === 'string'
        ? localDateToDate(dataNascimento)
        : new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();

    if (
      hoje.getMonth() < nascimento.getMonth() ||
      (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())
    ) {
      idade--;
    }

    return Math.max(0, idade);
  }

  private setLoading(type: LoadingType, value: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [type]: value }));
  }

  private substituirAcolhidoNaLista(acolhidoAtualizado: Acolhido): void {
    this.internalAcolhidos.update((acolhidos) =>
      this.ordenarPorStatus(
        acolhidos.map((acolhido) =>
          acolhido.id === acolhidoAtualizado.id ? acolhidoAtualizado : acolhido,
        ),
      ),
    );
  }

  private atualizarStatusNaLista(id: number, ativo: boolean): void {
    this.internalAcolhidos.update((acolhidos) =>
      this.ordenarPorStatus(
        acolhidos.map((acolhido) => (acolhido.id === id ? { ...acolhido, ativo } : acolhido)),
      ),
    );
  }

  private ordenarPorStatus(acolhidos: Acolhido[]): Acolhido[] {
    return [...acolhidos].sort((a, b) => Number(b.ativo) - Number(a.ativo));
  }
}
