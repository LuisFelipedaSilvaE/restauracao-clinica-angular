import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterTriagensCard } from './filter-triagens-card';

describe('FilterTriagensCard', () => {
  let component: FilterTriagensCard;
  let fixture: ComponentFixture<FilterTriagensCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterTriagensCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterTriagensCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
