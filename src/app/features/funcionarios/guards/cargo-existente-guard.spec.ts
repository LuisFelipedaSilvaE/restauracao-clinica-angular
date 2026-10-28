import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { cargoExistenteGuard } from './cargo-existente-guard';

describe('cargoExistenteGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => cargoExistenteGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
