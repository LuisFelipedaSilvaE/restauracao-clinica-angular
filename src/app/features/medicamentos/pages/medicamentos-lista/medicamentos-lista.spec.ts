import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicamentosLista } from './medicamentos-lista';

describe('MedicamentosLista', () => {
  let component: MedicamentosLista;
  let fixture: ComponentFixture<MedicamentosLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicamentosLista],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicamentosLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
