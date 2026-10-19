import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicamentoDetalhado } from './medicamento-detalhado';

describe('MedicamentoDetalhado', () => {
  let component: MedicamentoDetalhado;
  let fixture: ComponentFixture<MedicamentoDetalhado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicamentoDetalhado],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicamentoDetalhado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
