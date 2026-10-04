import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterAcolhidosCard } from './filter-acolhidos-card';

describe('FilterAcolhidosCard', () => {
  let component: FilterAcolhidosCard;
  let fixture: ComponentFixture<FilterAcolhidosCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterAcolhidosCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterAcolhidosCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
