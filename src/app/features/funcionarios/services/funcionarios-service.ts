import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Funcionario } from '../interfaces/funcionario';
import { finalize, map, Observable, of, tap } from 'rxjs';
import { FuncionarioRequest } from '../interfaces/funcionario-request';
import { LoadingType } from '../../../shared/types/loading-type';

@Injectable({
  providedIn: 'root',
})
export class FuncionariosService {
  private readonly baseAPIUrl = `${environment.apiUrl}/funcionarios`;
  private readonly http = inject(HttpClient);
  private readonly internalFuncionarios = signal<Funcionario[]>([]);
  readonly funcionarios = this.internalFuncionarios.asReadonly();
  private readonly listaCarregada = signal(false);
  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  createFuncionario(funcionario: FuncionarioRequest): Observable<Funcionario> {
    this.setLoading('mutation', true);

    return this.http.post<Funcionario>(this.baseAPIUrl, funcionario).pipe(
      tap((newfuncionario) => {
        this.internalFuncionarios.update((funcionarios) =>
          this.ordenarPorStatus([...funcionarios, newfuncionario]),
        );
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  getFuncionarioById(id: number): Observable<Funcionario | undefined> {
    this.setLoading('detail', false);

    return this.http.get<Funcionario>(`${this.baseAPIUrl}/${id}`).pipe(
      finalize(() => {
        this.setLoading('detail', false);
      }),
    );
  }

  private setLoading(type: LoadingType, value: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [type]: value }));
  }

  private substituirFuncionarioNaLista(funcionarioAtualizado: Funcionario) {
    this.internalFuncionarios.update((funcionarios) =>
      this.ordenarPorStatus(
        funcionarios.map((funcionario) =>
          funcionario.id === funcionarioAtualizado.id ? funcionarioAtualizado : funcionario,
        ),
      ),
    );
  }

  private atualizarStatusNaLista(id: number, ativo: boolean): void {
    this.internalFuncionarios.update((funcionarios) => {
      const atualizada = funcionarios.map((funcionario) =>
        funcionario.id === id ? { ...funcionario, ativo } : funcionario,
      );
      return this.ordenarPorStatus(atualizada);
    });
  }

  private ordenarPorStatus(funcionarios: Funcionario[]): Funcionario[] {
    return [...funcionarios].sort((a, b) => Number(b.ativo) - Number(a.ativo));
  }

  getAllFuncionarios(forceRefresh = false): Observable<Funcionario[]> {
    if (this.listaCarregada() && !forceRefresh) {
      return of(this.internalFuncionarios());
    }

    this.setLoading('list', true);

    return this.http.get<Funcionario[]>(this.baseAPIUrl).pipe(
      tap((funcionarios) => {
        this.internalFuncionarios.set(this.ordenarPorStatus(funcionarios));
        this.listaCarregada.set(true);
      }),
      finalize(() => {
        this.setLoading('list', false);
      }),
    );
  }

  updatefuncionario(id: number, funcionario: FuncionarioRequest): Observable<Funcionario> {
    this.setLoading('mutation', true);

    return this.http.put<Funcionario>(`${this.baseAPIUrl}/${id}`, funcionario).pipe(
      tap((funcionarioAtualizado) => this.substituirFuncionarioNaLista(funcionarioAtualizado)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deactivateFuncionario(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http
      .patch<void>(`${this.baseAPIUrl}/${id}/dismiss`, { dataDemissao: new Date() })
      .pipe(
        tap(() => this.atualizarStatusNaLista(id, false)),
        finalize(() => this.setLoading('mutation', false)),
      );
  }

  activateFuncionario(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.patch<void>(`${this.baseAPIUrl}/${id}/reactivate`, null).pipe(
      tap(() => this.atualizarStatusNaLista(id, true)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }
}
