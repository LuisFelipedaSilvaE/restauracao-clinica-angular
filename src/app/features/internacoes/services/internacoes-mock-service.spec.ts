import { TestBed } from '@angular/core/testing';

import { InternacoesMockService } from './internacoes-mock-service';

describe('InternacoesMockService', () => {
  let service: InternacoesMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternacoesMockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
