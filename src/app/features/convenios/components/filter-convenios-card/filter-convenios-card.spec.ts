import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterConveniosCard } from './filter-convenios-card';

describe('FilterConveniosCard', () => {
  let component: FilterConveniosCard;
  let fixture: ComponentFixture<FilterConveniosCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterConveniosCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterConveniosCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
