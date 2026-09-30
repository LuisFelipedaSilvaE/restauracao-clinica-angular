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
  private readonly internalFuncionarios = signal<Funcionario[]>([
    {
      id: 1,
      nome: 'Dario Klein Alves',
      cpf: '111.111.111-11',
      cargo: {
        id: 7,
        nome: 'Monitor',
        ativo: true,
      },
      telefone: '(18) 11111-1111',
      email: 'exemplo1@email.com',
      dataNascimento: new Date(2006, 2, 14),
      dataAdmissao: new Date(2026, 10, 14),
      endereco: 'Rua XV de Novembro · Boa Vista · Salvador - SP',
      cep: '11378-910',
      ativo: true,
    },
    {
      id: 2,
      nome: 'Jonathan Joestar',
      cpf: '222.222.222-22',
      cargo: {
        id: 6,
        nome: 'Psicólogo(a)',
        ativo: true,
      },
      telefone: '(18) 22222-2222',
      email: 'exemplo2@email.com',
      dataNascimento: new Date(1976, 6, 22),
      endereco: 'Rua XV de Novembro, 380 · Boa Vista · Salvador - SP',
      cep: '11378-910',
      ativo: false,
    },
    {
      id: 3,
      nome: 'Pedro Costa Moura',
      cpf: '333.333.333-33',
      cargo: {
        id: 2,
        nome: 'Coordenador',
        ativo: true,
      },
      telefone: '(18) 33333-3333',
      email: 'exemplo3@email.com',
      dataNascimento: new Date(1995, 10, 5),
      endereco: 'Rua XV de Novembro, 380 · Boa Vista · Salvador - SP',
      cep: '11378-910',
      ativo: true,
    },
  ]);
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

    const func: Funcionario = { ...funcionario, id: this.internalFuncionarios().length + 1 };
    return of(func).pipe(
      tap((newfuncionario) => {
        this.internalFuncionarios.update((funcionarios) =>
          this.ordenarPorStatus([...funcionarios, newfuncionario]),
        );
      }),
      finalize(() => this.setLoading('mutation', false)),
    );

    // return this.http.post<Funcionario>(this.baseAPIUrl, funcionario).pipe(
    //   tap((newfuncionario) => {
    //     this.internalFuncionarios.update((funcionarios) =>
    //       this.ordenarPorStatus([...funcionarios, newfuncionario]),
    //     );
    //   }),
    //   finalize(() => this.setLoading('mutation', false)),
    // );
  }

  getFuncionarioById(id: number): Observable<Funcionario | undefined> {
    this.setLoading('detail', false);
    const funcionarioOriginal: Funcionario | undefined = this.internalFuncionarios().find(
      (f) => f.id === id,
    );

    return of(funcionarioOriginal);
    // return this.http.get<Funcionario>(`${this.baseAPIUrl}/${id}`).pipe(
    //   finalize(() => {
    //     this.setLoading('detail', false);
    //   }),
    // );
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

  deactivateFuncionario(id: number): Observable<Funcionario | undefined> {
    this.setLoading('mutation', true);
    const funcionarioOriginal: Funcionario | undefined = this.internalFuncionarios().find(
      (f) => f.id === id,
    );

    return of(undefined).pipe(
      map(() => {
        if (!funcionarioOriginal) return undefined;
        return { ...funcionarioOriginal!, ativo: false };
      }),
      tap(() => this.atualizarStatusNaLista(id, false)),
      finalize(() => this.setLoading('mutation', false)),
    );

    // return this.http.delete<void>(`${this.baseAPIUrl}/${id}`).pipe(
    //   map(() => {
    //     if (!funcionarioOriginal) return undefined;
    //     return { ...funcionarioOriginal!, ativo: false };
    //   }),
    // tap(() => this.atualizarStatusNaLista(id, false)),
    // finalize(() => this.setLoading('mutation', false)),
    // );
  }

  activateFuncionario(id: number): Observable<Funcionario | undefined> {
    this.setLoading('mutation', true);
    const funcionarioOriginal: Funcionario | undefined = this.internalFuncionarios().find(
      (f) => f.id === id,
    );

    return of(undefined).pipe(
      map(() => {
        if (!funcionarioOriginal) return undefined;
        return { ...funcionarioOriginal!, ativo: true };
      }),
      tap(() => this.atualizarStatusNaLista(id, true)),
      finalize(() => this.setLoading('mutation', false)),
    );

    // return this.http.put<void>(`${this.baseAPIUrl}/${id}/activate`, null).pipe(
    //   map(() => {
    //     if(!funcionarioOriginal) return undefined
    //     return { ...funcionarioOriginal!, ativo: true };
    //   }),
    //   tap(() => this.atualizarStatusNaLista(id, true)),
    //   finalize(() => this.setLoading('mutation', false)),
    // );
  }
}
