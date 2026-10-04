import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcolhidoCard } from './acolhido-card';

describe('AcolhidoCard', () => {
  let component: AcolhidoCard;
  let fixture: ComponentFixture<AcolhidoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcolhidoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AcolhidoCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
