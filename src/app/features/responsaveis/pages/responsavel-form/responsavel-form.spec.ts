import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsavelForm } from './responsavel-form';

describe('ResponsavelForm', () => {
  let component: ResponsavelForm;
  let fixture: ComponentFixture<ResponsavelForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsavelForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsavelForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
