import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRegistrarPagamento } from './dialog-registrar-pagamento';

describe('DialogRegistrarPagamento', () => {
  let component: DialogRegistrarPagamento;
  let fixture: ComponentFixture<DialogRegistrarPagamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogRegistrarPagamento],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogRegistrarPagamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
