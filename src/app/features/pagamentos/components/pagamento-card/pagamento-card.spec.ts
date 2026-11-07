import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagamentoCard } from './pagamento-card';

describe('PagamentoCard', () => {
  let component: PagamentoCard;
  let fixture: ComponentFixture<PagamentoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagamentoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PagamentoCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
