import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargoForm } from './cargo-form';

describe('CargoForm', () => {
  let component: CargoForm;
  let fixture: ComponentFixture<CargoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CargoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
