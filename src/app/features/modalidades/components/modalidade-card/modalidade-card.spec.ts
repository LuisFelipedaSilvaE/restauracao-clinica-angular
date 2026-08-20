import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalidadeCard } from './modalidade-card';

describe('ModalidadeCard', () => {
  let component: ModalidadeCard;
  let fixture: ComponentFixture<ModalidadeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalidadeCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalidadeCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
