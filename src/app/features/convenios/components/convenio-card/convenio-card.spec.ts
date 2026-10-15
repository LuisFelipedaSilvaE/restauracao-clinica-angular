import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvenioCard } from './convenio-card';

describe('ConvenioCard', () => {
  let component: ConvenioCard;
  let fixture: ComponentFixture<ConvenioCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvenioCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ConvenioCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
