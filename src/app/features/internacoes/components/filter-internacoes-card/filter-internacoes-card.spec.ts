import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterInternacoesCard } from './filter-internacoes-card';

describe('FilterInternacoesCard', () => {
  let component: FilterInternacoesCard;
  let fixture: ComponentFixture<FilterInternacoesCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterInternacoesCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterInternacoesCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
