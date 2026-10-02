import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargosLista } from './cargos-lista';

describe('CargosLista', () => {
  let component: CargosLista;
  let fixture: ComponentFixture<CargosLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargosLista],
    }).compileComponents();

    fixture = TestBed.createComponent(CargosLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
