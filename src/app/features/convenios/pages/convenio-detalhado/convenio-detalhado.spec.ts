import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvenioDetalhado } from './convenio-detalhado';

describe('ConvenioDetalhado', () => {
  let component: ConvenioDetalhado;
  let fixture: ComponentFixture<ConvenioDetalhado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvenioDetalhado],
    }).compileComponents();

    fixture = TestBed.createComponent(ConvenioDetalhado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
