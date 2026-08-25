import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterFuncionariosCard } from './filter-funcionarios-card';

describe('FilterFuncionariosCard', () => {
  let component: FilterFuncionariosCard;
  let fixture: ComponentFixture<FilterFuncionariosCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterFuncionariosCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterFuncionariosCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
