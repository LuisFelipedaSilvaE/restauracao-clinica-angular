import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Internacoes } from './internacoes';

describe('Internacoes', () => {
  let component: Internacoes;
  let fixture: ComponentFixture<Internacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Internacoes],
    }).compileComponents();

    fixture = TestBed.createComponent(Internacoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
