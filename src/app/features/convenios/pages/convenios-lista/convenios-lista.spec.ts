import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConveniosLista } from './convenios-lista';

describe('ConveniosLista', () => {
  let component: ConveniosLista;
  let fixture: ComponentFixture<ConveniosLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConveniosLista],
    }).compileComponents();

    fixture = TestBed.createComponent(ConveniosLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
