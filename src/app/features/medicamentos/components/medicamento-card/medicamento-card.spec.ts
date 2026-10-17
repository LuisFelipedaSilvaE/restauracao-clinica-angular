import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicamentoCard } from './medicamento-card';

describe('MedicamentoCard', () => {
  let component: MedicamentoCard;
  let fixture: ComponentFixture<MedicamentoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicamentoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicamentoCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
