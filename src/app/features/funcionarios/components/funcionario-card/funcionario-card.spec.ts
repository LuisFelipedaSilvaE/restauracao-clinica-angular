import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncionarioCard } from './funcionario-card';

describe('FuncionarioCard', () => {
  let component: FuncionarioCard;
  let fixture: ComponentFixture<FuncionarioCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuncionarioCard],
    }).compileComponents();

    fixture = TestBed.createComponent(FuncionarioCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
