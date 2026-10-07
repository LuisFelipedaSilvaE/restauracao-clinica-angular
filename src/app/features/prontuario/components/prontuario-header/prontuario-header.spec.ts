import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProntuarioHeader } from './prontuario-header';

describe('ProntuarioHeader', () => {
  let component: ProntuarioHeader;
  let fixture: ComponentFixture<ProntuarioHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProntuarioHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(ProntuarioHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
