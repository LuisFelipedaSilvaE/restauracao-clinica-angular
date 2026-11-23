import { TestBed } from '@angular/core/testing';

import { AcolhidoFormStateService } from './acolhido-form-state-service';

describe('AcolhidoFormStateService', () => {
  let service: AcolhidoFormStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcolhidoFormStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
