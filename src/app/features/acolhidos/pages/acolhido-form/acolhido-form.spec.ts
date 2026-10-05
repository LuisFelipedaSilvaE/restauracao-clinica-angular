import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcolhidoForm } from './acolhido-form';

describe('AcolhidoForm', () => {
  let component: AcolhidoForm;
  let fixture: ComponentFixture<AcolhidoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcolhidoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AcolhidoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
