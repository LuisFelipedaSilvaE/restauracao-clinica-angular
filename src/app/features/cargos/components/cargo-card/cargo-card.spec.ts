import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargoCard } from './cargo-card';

describe('CargoCard', () => {
  let component: CargoCard;
  let fixture: ComponentFixture<CargoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CargoCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
