import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProntuarioSectionCard } from './prontuario-section-card';

describe('ProntuarioSectionCard', () => {
  let component: ProntuarioSectionCard;
  let fixture: ComponentFixture<ProntuarioSectionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProntuarioSectionCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProntuarioSectionCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
