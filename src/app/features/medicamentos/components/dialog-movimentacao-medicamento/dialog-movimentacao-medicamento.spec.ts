import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogMovimentacaoMedicamento } from './dialog-movimentacao-medicamento';

describe('DialogMovimentacaoMedicamento', () => {
  let component: DialogMovimentacaoMedicamento;
  let fixture: ComponentFixture<DialogMovimentacaoMedicamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogMovimentacaoMedicamento],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogMovimentacaoMedicamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
