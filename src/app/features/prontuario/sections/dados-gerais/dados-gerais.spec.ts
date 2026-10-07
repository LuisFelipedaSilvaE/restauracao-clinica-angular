import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DadosGerais } from './dados-gerais';

describe('DadosGerais', () => {
  let component: DadosGerais;
  let fixture: ComponentFixture<DadosGerais>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DadosGerais],
    }).compileComponents();

    fixture = TestBed.createComponent(DadosGerais);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
