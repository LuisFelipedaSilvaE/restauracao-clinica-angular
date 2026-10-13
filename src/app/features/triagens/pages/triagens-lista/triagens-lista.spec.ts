import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriagensLista } from './triagens-lista';

describe('TriagensLista', () => {
  let component: TriagensLista;
  let fixture: ComponentFixture<TriagensLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriagensLista],
    }).compileComponents();

    fixture = TestBed.createComponent(TriagensLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
