import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalidadeForm } from './modalidade-form';

describe('ModalidadeForm', () => {
  let component: ModalidadeForm;
  let fixture: ComponentFixture<ModalidadeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalidadeForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalidadeForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
