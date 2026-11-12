import { TestBed } from '@angular/core/testing';

import { ResponsaveisService } from './responsaveis-service';

describe('ResponsaveisService', () => {
  let service: ResponsaveisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponsaveisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
