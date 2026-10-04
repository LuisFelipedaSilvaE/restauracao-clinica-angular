import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcolhidosLista } from './acolhidos-lista';

describe('AcolhidosLista', () => {
  let component: AcolhidosLista;
  let fixture: ComponentFixture<AcolhidosLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcolhidosLista],
    }).compileComponents();

    fixture = TestBed.createComponent(AcolhidosLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
