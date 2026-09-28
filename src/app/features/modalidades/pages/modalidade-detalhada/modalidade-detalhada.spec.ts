import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalidadeDetalhada } from './modalidade-detalhada';

describe('ModalidadeDetalhada', () => {
  let component: ModalidadeDetalhada;
  let fixture: ComponentFixture<ModalidadeDetalhada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalidadeDetalhada],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalidadeDetalhada);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
