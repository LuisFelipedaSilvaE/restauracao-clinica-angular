import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoadingType } from '../../../shared/types/loading-type';
import { ConveniosService } from '../../convenios/services/convenios-service';
import { StatusTriagem } from '../enums/status-triagem';
import { Triagem } from '../interfaces/triagem';
import { TriagemRequest } from '../interfaces/triagem-request';

@Injectable({
  providedIn: 'root',
})
export class TriagensService {
  private readonly baseAPIUrl = `${environment.apiUrl}/triagens`;
  private readonly http = inject(HttpClient);
  private readonly conveniosService = inject(ConveniosService);
  private readonly internalTriagens = signal<Triagem[]>([
    {
      id: 1,
      convenio: {
        id: 1,
        descricao: 'Atendimento Social',
        cnpj: null,
        maxVagas: 40,
        ativo: true,
        pagamento: false,
        cor: '#2E86C1',
      },
      nomePossivelAcolhido: 'João da Silva',
      telefone: '(11) 98765-4321',
      dataAgendada: '2026-10-08T09:00:00',
      observacaoEntrevista: 'Demonstrou interesse em participar das atividades.',
      status: StatusTriagem.AGENDADA,
    },
    {
      id: 2,
      convenio: {
        id: 2,
        descricao: 'Clínica Parceira',
        cnpj: '11222333000181',
        maxVagas: 20,
        ativo: true,
        pagamento: true,
        cor: '#28B463',
      },
      nomePossivelAcolhido: 'Maria Oliveira',
      telefone: '(11) 97654-3210',
      dataAgendada: '2026-10-08T10:30:00',
      observacaoEntrevista: 'Possui experiência anterior com natação.',
      status: StatusTriagem.CONCLUIDA,
    },
    {
      id: 3,
      convenio: {
        id: 4,
        descricao: 'Lista de Espera',
        cnpj: null,
        maxVagas: 0,
        ativo: true,
        pagamento: false,
        cor: '#F39C12',
      },
      nomePossivelAcolhido: 'Pedro Santos',
      telefone: '(21) 98765-1234',
      dataAgendada: '2026-10-09T14:00:00',
      observacaoEntrevista: 'Necessita de avaliação antes da matrícula.',
      status: StatusTriagem.AGENDADA,
    },
    {
      id: 4,
      convenio: {
        id: 2,
        descricao: 'Clínica Parceira',
        cnpj: '11222333000181',
        maxVagas: 20,
        ativo: true,
        pagamento: true,
        cor: '#28B463',
      },
      nomePossivelAcolhido: 'Ana Costa',
      telefone: '(31) 99876-5432',
      dataAgendada: '2026-10-10T16:00:00',
      observacaoEntrevista: 'Triagem realizada. Aguardando disponibilidade de vaga.',
      status: StatusTriagem.AGENDADA,
    },
    {
      id: 5,
      convenio: {
        id: 4,
        descricao: 'Lista de Espera',
        cnpj: null,
        maxVagas: 0,
        ativo: true,
        pagamento: false,
        cor: '#F39C12',
      },
      nomePossivelAcolhido: 'Lucas Almeida',
      telefone: '(41) 98765-6789',
      dataAgendada: '2026-10-11T08:30:00',
      observacaoEntrevista: 'Aprovado na entrevista inicial.',
      status: StatusTriagem.ATRASADA,
    },
  ]);
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

  changeTriagemStatus(id: number, status: StatusTriagem): Observable<void> {
    this.setLoading('mutation', true);

    return this.http.patch<void>(`${this.baseAPIUrl}/${id}/dismiss`, { status: status }).pipe(
      tap(() => this.atualizarStatusNaLista(id, status)),
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

  private atualizarStatusNaLista(id: number, status: StatusTriagem): void {
    this.internalTriagens.update((triagens) => {
      const atualizada = triagens.map((triagem) =>
        triagem.id === id ? { ...triagem, status } : triagem,
      );
      return this.ordenarPorStatus(atualizada);
    });
  }

  private ordenarPorStatus(triagens: Triagem[]): Triagem[] {
    return [...triagens].sort((a, b) => Number(b.status) - Number(a.status));
  }
}
