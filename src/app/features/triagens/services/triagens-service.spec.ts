import { TestBed } from '@angular/core/testing';

import { TriagensService } from './triagens-service';

describe('TriagensService', () => {
  let service: TriagensService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TriagensService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
