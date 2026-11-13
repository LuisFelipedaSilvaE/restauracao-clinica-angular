import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { StatusTriagem } from '../enums/status-triagem';
import { Triagem } from '../interfaces/triagem';
import { TriagensService } from './triagens-service';

describe('TriagensService', () => {
  let service: TriagensService;
  let http: HttpTestingController;

  const criarTriagem = (id: number, status: StatusTriagem): Triagem => ({
    id,
    convenio: {
      id: 1,
      descricao: 'Convênio teste',
      cnpj: null,
      maxVagas: 10,
      ativo: true,
      pagamento: false,
      cor: '#123456',
    },
    nomePossivelAcolhido: `Pessoa ${id}`,
    telefone: '11999999999',
    dataAgendada: '2099-01-01T10:00:00',
    dataConclusao: status === StatusTriagem.CONCLUIDA ? '2099-01-01T10:30:00' : null,
    observacaoEntrevista: null,
    status,
  });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });
    service = TestBed.inject(TriagensService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('carrega o contrato atual e ordena as situações conhecidas', () => {
    const cancelada = criarTriagem(4, StatusTriagem.CANCELADA);
    const concluida = criarTriagem(3, StatusTriagem.CONCLUIDA);
    const agendada = criarTriagem(2, StatusTriagem.AGENDADA);
    const atrasada = criarTriagem(1, StatusTriagem.ATRASADA);

    service.getAllTriagens().subscribe();
    http
      .expectOne((request) => request.method === 'GET' && request.url.endsWith('/triagens'))
      .flush([cancelada, concluida, agendada, atrasada]);

    expect(service.triagens().map((triagem) => triagem.status)).toEqual([
      StatusTriagem.ATRASADA,
      StatusTriagem.AGENDADA,
      StatusTriagem.CONCLUIDA,
      StatusTriagem.CANCELADA,
    ]);
    expect(service.triagens()[0].observacaoEntrevista).toBeNull();
  });

  it('cancela uma triagem pelo endpoint disponibilizado pelo backend', () => {
    const cancelada = criarTriagem(1, StatusTriagem.CANCELADA);

    service.cancelarTriagem(1).subscribe((triagem) => expect(triagem).toEqual(cancelada));
    http
      .expectOne(
        (request) => request.method === 'PATCH' && request.url.endsWith('/triagens/1/cancelar'),
      )
      .flush(cancelada);
  });

  it('descancela uma triagem pelo endpoint disponibilizado pelo backend', () => {
    const agendada = criarTriagem(1, StatusTriagem.AGENDADA);

    service.descancelarTriagem(1).subscribe((triagem) => expect(triagem).toEqual(agendada));
    http
      .expectOne(
        (request) => request.method === 'PATCH' && request.url.endsWith('/triagens/1/descancelar'),
      )
      .flush(agendada);
  });
});
