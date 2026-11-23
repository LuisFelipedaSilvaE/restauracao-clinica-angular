import { TestBed } from '@angular/core/testing';

import { InternacaoFormStateService } from './internacao-form-state-service';

describe('InternacaoFormStateService', () => {
  let service: InternacaoFormStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternacaoFormStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
