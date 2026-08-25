import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncionariosLista } from './funcionarios-lista';

describe('FuncionariosLista', () => {
  let component: FuncionariosLista;
  let fixture: ComponentFixture<FuncionariosLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuncionariosLista],
    }).compileComponents();

    fixture = TestBed.createComponent(FuncionariosLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
