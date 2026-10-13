import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternacoesLista } from './internacoes-lista';

describe('InternacoesLista', () => {
  let component: InternacoesLista;
  let fixture: ComponentFixture<InternacoesLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternacoesLista],
    }).compileComponents();

    fixture = TestBed.createComponent(InternacoesLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
