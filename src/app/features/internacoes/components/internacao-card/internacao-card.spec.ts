import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternacaoCard } from './internacao-card';

describe('InternacaoCard', () => {
  let component: InternacaoCard;
  let fixture: ComponentFixture<InternacaoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternacaoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(InternacaoCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
