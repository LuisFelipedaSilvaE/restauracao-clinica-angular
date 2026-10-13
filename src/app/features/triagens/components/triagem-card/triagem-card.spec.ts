import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriagemCard } from './triagem-card';

describe('TriagemCard', () => {
  let component: TriagemCard;
  let fixture: ComponentFixture<TriagemCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriagemCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TriagemCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
