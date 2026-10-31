import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoadingType } from '../../../shared/types/loading-type';
import { localDateToDate } from '../../../shared/utils/local-date';
import { ConveniosService } from '../../convenios/services/convenios-service';
import { Internacao } from '../interfaces/internacao';
import { InternacaoCreateRequest } from '../interfaces/internacao-create-request';
import { InternacaoEndRequest } from '../interfaces/internacao-end-request';
import { InternacaoUpdateRequest } from '../interfaces/internacao-update-request';

@Injectable({
  providedIn: 'root',
})
export class InternacoesService {
  private readonly baseAPIUrl = `${environment.apiUrl}/internacoes`;
  private readonly http = inject(HttpClient);
  private readonly conveniosService = inject(ConveniosService);

  private readonly internalInternacoes = signal<Internacao[]>([]);
  readonly internacoes = computed(() => {
    const conveniosPorId = new Map(
      this.conveniosService.convenios().map((convenio) => [convenio.id, convenio]),
    );

    return this.internalInternacoes().map((internacao) => ({
      ...internacao,
      convenio: conveniosPorId.get(internacao.convenio.id) ?? internacao.convenio,
    }));
  });

  private readonly listaCarregada = signal(false);

  private readonly internalLoading = signal<Record<LoadingType, boolean>>({
    list: false,
    detail: false,
    mutation: false,
  });
  readonly loading = this.internalLoading.asReadonly();

  getAllInternacoes(forceRefresh = false): Observable<Internacao[]> {
    if (this.listaCarregada() && !forceRefresh) {
      return of(this.internacoes());
    }

    this.setLoading('list', true);

    return this.http.get<Internacao[]>(this.baseAPIUrl).pipe(
      tap((internacoes) => {
        this.internalInternacoes.set(internacoes);
        this.listaCarregada.set(true);
      }),
      finalize(() => this.setLoading('list', false)),
    );
  }

  getInternacaoById(id: number): Observable<Internacao> {
    this.setLoading('detail', true);

    return this.http
      .get<Internacao>(`${this.baseAPIUrl}/${id}`)
      .pipe(finalize(() => this.setLoading('detail', false)));
  }

  createInternacao(internacao: InternacaoCreateRequest): Observable<Internacao> {
    this.setLoading('mutation', true);

    return this.http.post<Internacao>(this.baseAPIUrl, internacao).pipe(
      tap((novaInternacao) => {
        this.internalInternacoes.update((internacoes) => [...internacoes, novaInternacao]);
      }),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  updateInternacao(id: number, internacao: InternacaoUpdateRequest): Observable<Internacao> {
    this.setLoading('mutation', true);

    return this.http.put<Internacao>(`${this.baseAPIUrl}/${id}`, internacao).pipe(
      tap((internacaoAtualizada) => this.substituirInternacaoNaLista(internacaoAtualizada)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  encerrarInternacao(id: number, encerramento: InternacaoEndRequest): Observable<Internacao> {
    this.setLoading('mutation', true);

    return this.http.patch<Internacao>(`${this.baseAPIUrl}/${id}/end`, encerramento).pipe(
      tap((internacaoEncerrada) => this.substituirInternacaoNaLista(internacaoEncerrada)),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  deleteInternacao(id: number): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.delete<void>(`${this.baseAPIUrl}/${id}`).pipe(
      tap(() =>
        this.internalInternacoes.update((internacoes) =>
          internacoes.filter((internacao) => internacao.id !== id),
        ),
      ),
      finalize(() => this.setLoading('mutation', false)),
    );
  }

  calcularTempoInternado(dataEntrada: string, dataSaida: string | null = null): string {
    const entrada = localDateToDate(dataEntrada);
    const referencia = dataSaida ? localDateToDate(dataSaida) : new Date();

    entrada.setHours(0, 0, 0, 0);
    referencia.setHours(0, 0, 0, 0);

    const diasTotais = Math.max(
      0,
      Math.floor((referencia.getTime() - entrada.getTime()) / 86_400_000),
    );
    const meses = Math.floor(diasTotais / 30);
    const dias = diasTotais % 30;

    return meses === 0 ? `${dias}d` : `${meses} ${meses === 1 ? 'mês' : 'meses'} e ${dias}d`;
  }

  getInternacaoAtualDoAcolhido(acolhidoId: number): Internacao | undefined {
    return this.internacoes()
      .filter((internacao) => internacao.ativo && internacao.acolhido.id === acolhidoId)
      .sort((a, b) => b.dataEntrada.localeCompare(a.dataEntrada))[0];
  }

  private setLoading(type: LoadingType, value: boolean): void {
    this.internalLoading.update((loading) => ({ ...loading, [type]: value }));
  }

  private substituirInternacaoNaLista(internacaoAtualizada: Internacao): void {
    this.internalInternacoes.update((internacoes) =>
      internacoes.map((internacao) =>
        internacao.id === internacaoAtualizada.id ? internacaoAtualizada : internacao,
      ),
    );
  }
}
