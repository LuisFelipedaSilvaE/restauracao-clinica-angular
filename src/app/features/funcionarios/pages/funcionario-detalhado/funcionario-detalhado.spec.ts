import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncionarioDetalhado } from './funcionario-detalhado';

describe('FuncionarioDetalhado', () => {
  let component: FuncionarioDetalhado;
  let fixture: ComponentFixture<FuncionarioDetalhado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuncionarioDetalhado],
    }).compileComponents();

    fixture = TestBed.createComponent(FuncionarioDetalhado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
