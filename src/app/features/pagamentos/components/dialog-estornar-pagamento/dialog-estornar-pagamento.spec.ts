import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEstornarPagamento } from './dialog-estornar-pagamento';

describe('DialogEstornarPagamento', () => {
  let component: DialogEstornarPagamento;
  let fixture: ComponentFixture<DialogEstornarPagamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEstornarPagamento],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogEstornarPagamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
