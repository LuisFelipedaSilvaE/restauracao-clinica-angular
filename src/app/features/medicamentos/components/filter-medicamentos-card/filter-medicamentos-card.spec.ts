import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterMedicamentosCard } from './filter-medicamentos-card';

describe('FilterMedicamentosCard', () => {
  let component: FilterMedicamentosCard;
  let fixture: ComponentFixture<FilterMedicamentosCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterMedicamentosCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterMedicamentosCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
