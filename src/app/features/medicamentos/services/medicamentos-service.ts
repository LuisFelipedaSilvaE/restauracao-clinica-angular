import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoadingType } from '../../../shared/types/loading-type';
import { Medicamento } from '../interfaces/medicamento';
import { MedicamentoRequest } from '../interfaces/medicamento-request';

@Injectable({
  providedIn: 'root',
})
export class MedicamentosService {
  private readonly baseAPIUrl = `${environment.apiUrl}/medicamentos`;
  private readonly http = inject(HttpClient);

  private readonly internalMedicamentos = signal<Medicamento[]>([
    {
      id: 1,
      nome: 'Paracetamol 500mg',
      preco: 15.5,
      unidadeControle: 'Caixa',
      estoque: 100,
    },
    { id: 2, nome: 'Ibuprofeno 400mg', preco: 22.0, unidadeControle: 'Caixa', estoque: 80 },
    {
      id: 3,
      nome: 'Dipirona 500mg/mL',
      preco: 12.3,
      unidadeControle: 'Frasco',
      estoque: 150,
    },
    { id: 4, nome: 'Amoxicilina 500mg', preco: 45.9, unidadeControle: 'Caixa', estoque: 50 },
    { id: 5, nome: 'Omeprazol 20mg', preco: 28.75, unidadeControle: 'Caixa', estoque: 120 },
  ]);

  readonly medicamentos = this.internalMedicamentos.asReadonly();
  private readonly listaCarregada = signal(false);
  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  createMedicamento(medicamento: MedicamentoRequest): Observable<Medicamento> {
    this.setLoading('mutation', true);

    this.internalMedicamentos.update((medicamentos) => [
      ...medicamentos,
      { id: medicamentos.length, ...medicamento },
    ]);
    return of();

    return this.http.post<Medicamento>(this.baseAPIUrl, medicamento).pipe(
      tap((novoMedicamento) => {
        this.internalMedicamentos.update((medicamentos) => [...medicamentos, novoMedicamento]);
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  updateMedicamento(id: number, medicamento: MedicamentoRequest): Observable<Medicamento> {
    this.setLoading('mutation', true);
    const medicamentoOriginal = this.internalMedicamentos().find((m) => m.id === id);

    if (!medicamentoOriginal) {
      return of();
    }

    this.substituirMedicamentoNaLista({ ...medicamentoOriginal, ...medicamento });
    return of();

    return this.http.put<Medicamento>(`${this.baseAPIUrl}/${id}`, medicamento).pipe(
      tap((medicamentoAtualizado) => this.substituirMedicamentoNaLista(medicamentoAtualizado)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  getAllMedicamentos(forceRefresh = false): Observable<Medicamento[]> {
    // if (this.listaCarregada() && !forceRefresh) {
    return of(this.internalMedicamentos());
    // }

    this.setLoading('list', true);

    return this.http.get<Medicamento[]>(this.baseAPIUrl).pipe(
      tap((medicamentos) => {
        this.internalMedicamentos.set(medicamentos);
        this.listaCarregada.set(true);
      }),
      finalize(() => {
        this.setLoading('list', false);
      }),
    );
  }

  getMedicamentoById(id: number): Observable<Medicamento> {
    this.setLoading('detail', true);
    const medicamento = this.internalMedicamentos().find((m) => m.id === id);

    if (!medicamento) {
      return of();
    }

    return of(medicamento);

    return this.http.get<Medicamento>(`${this.baseAPIUrl}/${id}`).pipe(
      finalize(() => {
        this.setLoading('detail', false);
      }),
    );
  }

  private setLoading(type: LoadingType, value: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [type]: value }));
  }

  private substituirMedicamentoNaLista(medicamentoAtualizado: Medicamento): void {
    this.internalMedicamentos.update((medicamentos) =>
      medicamentos.map((medicamento) =>
        medicamento.id === medicamentoAtualizado.id ? medicamentoAtualizado : medicamento,
      ),
    );
  }
}
