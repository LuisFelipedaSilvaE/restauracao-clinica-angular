import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternacaoForm } from './internacao-form';

describe('InternacaoForm', () => {
  let component: InternacaoForm;
  let fixture: ComponentFixture<InternacaoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternacaoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(InternacaoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
