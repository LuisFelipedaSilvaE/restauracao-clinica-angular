import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvenioForm } from './convenio-form';

describe('ConvenioForm', () => {
  let component: ConvenioForm;
  let fixture: ComponentFixture<ConvenioForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvenioForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ConvenioForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
