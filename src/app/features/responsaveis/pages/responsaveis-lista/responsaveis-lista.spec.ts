import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsaveisLista } from './responsaveis-lista';

describe('ResponsaveisLista', () => {
  let component: ResponsaveisLista;
  let fixture: ComponentFixture<ResponsaveisLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsaveisLista],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsaveisLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
