import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncionarioAtualizacao } from './funcionario-atualizacao';

describe('FuncionarioAtualizacao', () => {
  let component: FuncionarioAtualizacao;
  let fixture: ComponentFixture<FuncionarioAtualizacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuncionarioAtualizacao],
    }).compileComponents();

    fixture = TestBed.createComponent(FuncionarioAtualizacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
