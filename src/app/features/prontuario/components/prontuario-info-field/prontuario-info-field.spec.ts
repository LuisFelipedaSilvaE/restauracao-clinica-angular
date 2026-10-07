import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProntuarioInfoField } from './prontuario-info-field';

describe('ProntuarioInfoField', () => {
  let component: ProntuarioInfoField;
  let fixture: ComponentFixture<ProntuarioInfoField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProntuarioInfoField],
    }).compileComponents();

    fixture = TestBed.createComponent(ProntuarioInfoField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
