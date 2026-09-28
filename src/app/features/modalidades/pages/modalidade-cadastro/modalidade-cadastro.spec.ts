import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalidadeCadastro } from './modalidade-cadastro';

describe('ModalidadeCadastro', () => {
  let component: ModalidadeCadastro;
  let fixture: ComponentFixture<ModalidadeCadastro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalidadeCadastro],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalidadeCadastro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
