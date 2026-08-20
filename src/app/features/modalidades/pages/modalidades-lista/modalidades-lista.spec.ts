import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalidadesLista } from './modalidades-lista';

describe('ModalidadesLista', () => {
  let component: ModalidadesLista;
  let fixture: ComponentFixture<ModalidadesLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalidadesLista],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalidadesLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
