import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEdicaoFuncionario } from './dialog-edicao-funcionario';

describe('DialogEdicaoFuncionario', () => {
  let component: DialogEdicaoFuncionario;
  let fixture: ComponentFixture<DialogEdicaoFuncionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEdicaoFuncionario],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogEdicaoFuncionario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
