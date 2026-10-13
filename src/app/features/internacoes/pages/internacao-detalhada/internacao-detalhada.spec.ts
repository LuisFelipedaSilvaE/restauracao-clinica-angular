import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternacaoDetalhada } from './internacao-detalhada';

describe('InternacaoDetalhada', () => {
  let component: InternacaoDetalhada;
  let fixture: ComponentFixture<InternacaoDetalhada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternacaoDetalhada],
    }).compileComponents();

    fixture = TestBed.createComponent(InternacaoDetalhada);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
