import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriagemReagendamentoForm } from './triagem-reagendamento-form';

describe('TriagemReagendamentoForm', () => {
  let component: TriagemReagendamentoForm;
  let fixture: ComponentFixture<TriagemReagendamentoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriagemReagendamentoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TriagemReagendamentoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
