import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriagemForm } from './triagem-form';

describe('TriagemForm', () => {
  let component: TriagemForm;
  let fixture: ComponentFixture<TriagemForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriagemForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TriagemForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
