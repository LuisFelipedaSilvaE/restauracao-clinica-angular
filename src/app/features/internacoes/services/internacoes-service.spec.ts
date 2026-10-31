import { TestBed } from '@angular/core/testing';

import { InternacoesService } from './internacoes-service';

describe('InternacoesService', () => {
  let service: InternacoesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternacoesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
