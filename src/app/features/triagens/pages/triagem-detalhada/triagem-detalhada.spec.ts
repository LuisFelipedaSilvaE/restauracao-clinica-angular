import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriagemDetalhada } from './triagem-detalhada';

describe('TriagemDetalhada', () => {
  let component: TriagemDetalhada;
  let fixture: ComponentFixture<TriagemDetalhada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriagemDetalhada],
    }).compileComponents();

    fixture = TestBed.createComponent(TriagemDetalhada);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
