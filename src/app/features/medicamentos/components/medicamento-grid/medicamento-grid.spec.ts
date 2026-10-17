import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicamentoGrid } from './medicamento-grid';

describe('MedicamentoGrid', () => {
  let component: MedicamentoGrid;
  let fixture: ComponentFixture<MedicamentoGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicamentoGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicamentoGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
