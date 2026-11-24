import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth-service';
import { LoadingType } from '../../../shared/types/loading-type';
import { Medicamento } from '../interfaces/medicamento';
import { MedicamentoRequest } from '../interfaces/medicamento-request';
import { MovimentacaoEstoque } from '../interfaces/movimentacao-estoque';
import { MovimentacaoEstoqueRequest } from '../interfaces/movimentacao-estoque-request';

@Injectable({
  providedIn: 'root',
})
export class MedicamentosService {
  private readonly baseAPIUrl = `${environment.apiUrl}/medicamentos`;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly internalMedicamentos = signal<Medicamento[]>([]);

  readonly medicamentos = this.internalMedicamentos.asReadonly();
  private readonly internalMedicamentosEmAlerta = signal<Medicamento[]>([]);
  readonly medicamentosEmAlerta = this.internalMedicamentosEmAlerta.asReadonly();
  private readonly listaCarregada = signal(false);
  private readonly loadingCounters: Record<LoadingType, number> = {
    list: 0,
    detail: 0,
    mutation: 0,
  };
  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  constructor() {
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        this.internalMedicamentos.set([]);
        this.internalMedicamentosEmAlerta.set([]);
        this.listaCarregada.set(false);
      }
    });
  }

  createMedicamento(medicamento: MedicamentoRequest): Observable<Medicamento> {
    this.setLoading('mutation', true);

    return this.http.post<Medicamento>(this.baseAPIUrl, medicamento).pipe(
      tap((novoMedicamento) => {
        this.internalMedicamentos.update((medicamentos) =>
          this.ordenar([novoMedicamento, ...medicamentos]),
        );
        this.sincronizarAlertaLocal(novoMedicamento);
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  updateMedicamento(id: number, medicamento: MedicamentoRequest): Observable<Medicamento> {
    this.setLoading('mutation', true);

    return this.http.put<Medicamento>(`${this.baseAPIUrl}/${id}`, medicamento).pipe(
      tap((medicamentoAtualizado) => {
        this.substituirMedicamentoNaLista(medicamentoAtualizado);
        this.sincronizarAlertaLocal(medicamentoAtualizado);
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deleteMedicamento(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.delete<void>(`${this.baseAPIUrl}/${id}`).pipe(
      tap(() => {
        this.internalMedicamentos.update((medicamentos) => medicamentos.filter((m) => m.id !== id));
        this.internalMedicamentosEmAlerta.update((alertas) => alertas.filter((m) => m.id !== id));
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  registrarEntrada(
    id: number,
    request: MovimentacaoEstoqueRequest,
  ): Observable<MovimentacaoEstoque> {
    this.setLoading('mutation', true);

    return this.http.put<MovimentacaoEstoque>(`${this.baseAPIUrl}/${id}/adicionar`, request).pipe(
      tap((movimentacao) => this.atualizarSaldoNaLista(movimentacao)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  registrarSaida(id: number, request: MovimentacaoEstoqueRequest): Observable<MovimentacaoEstoque> {
    this.setLoading('mutation', true);

    return this.http.put<MovimentacaoEstoque>(`${this.baseAPIUrl}/${id}/baixar`, request).pipe(
      tap((movimentacao) => this.atualizarSaldoNaLista(movimentacao)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  getMovimentacoesByMedicamentoId(id: number): Observable<MovimentacaoEstoque[]> {
    this.setLoading('detail', true);

    return this.http
      .get<MovimentacaoEstoque[]>(`${this.baseAPIUrl}/${id}/movimentacoes`)
      .pipe(finalize(() => this.setLoading('detail', false)));
  }

  getMedicamentosEmAlerta(): Observable<Medicamento[]> {
    return this.http
      .get<Medicamento[]>(`${this.baseAPIUrl}/alertas`)
      .pipe(tap((alertas) => this.internalMedicamentosEmAlerta.set(alertas)));
  }

  getAllMedicamentos(forceRefresh = false): Observable<Medicamento[]> {
    if (this.listaCarregada() && !forceRefresh) {
      return of(this.internalMedicamentos());
    }

    this.setLoading('list', true);

    return this.http.get<Medicamento[]>(this.baseAPIUrl).pipe(
      tap((medicamentos) => {
        this.internalMedicamentos.set(this.ordenar(medicamentos));
        this.listaCarregada.set(true);
      }),
      finalize(() => {
        this.setLoading('list', false);
      }),
    );
  }

  getMedicamentoById(id: number): Observable<Medicamento> {
    this.setLoading('detail', true);

    return this.http.get<Medicamento>(`${this.baseAPIUrl}/${id}`).pipe(
      finalize(() => {
        this.setLoading('detail', false);
      }),
    );
  }

  private setLoading(type: LoadingType, ativo: boolean): void {
    this.loadingCounters[type] = Math.max(0, this.loadingCounters[type] + (ativo ? 1 : -1));
    this.internalLoading.update((loading) => ({
      ...loading,
      [type]: this.loadingCounters[type] > 0,
    }));
  }

  private substituirMedicamentoNaLista(medicamentoAtualizado: Medicamento): void {
    this.internalMedicamentos.update((medicamentos) =>
      this.ordenar(
        medicamentos.map((medicamento) =>
          medicamento.id === medicamentoAtualizado.id ? medicamentoAtualizado : medicamento,
        ),
      ),
    );
  }

  private ordenar(medicamentos: Medicamento[]): Medicamento[] {
    return [...medicamentos].sort((a, b) => b.id - a.id);
  }

  private atualizarSaldoNaLista(movimentacao: MovimentacaoEstoque): void {
    let medicamentoAtualizado: Medicamento | undefined;

    this.internalMedicamentos.update((medicamentos) =>
      medicamentos.map((medicamento) => {
        if (medicamento.id !== movimentacao.medicamentoId) return medicamento;

        medicamentoAtualizado = {
          ...medicamento,
          quantidadeEstoque: movimentacao.saldoPosterior,
          status:
            movimentacao.saldoPosterior <= medicamento.quantidadeMinima
              ? 'ALERTA: ESTOQUE BAIXO'
              : 'ESTOQUE OK',
        };

        return medicamentoAtualizado;
      }),
    );

    if (medicamentoAtualizado) {
      this.sincronizarAlertaLocal(medicamentoAtualizado);
    }
  }

  private sincronizarAlertaLocal(medicamento: Medicamento): void {
    const emAlerta = medicamento.status
      ? medicamento.status === 'ALERTA: ESTOQUE BAIXO'
      : medicamento.quantidadeEstoque <= medicamento.quantidadeMinima;

    this.internalMedicamentosEmAlerta.update((alertas) => {
      const semAtual = alertas.filter((item) => item.id !== medicamento.id);
      return emAlerta ? [...semAtual, medicamento] : semAtual;
    });
  }
}
