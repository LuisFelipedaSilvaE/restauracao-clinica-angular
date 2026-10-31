import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRegistrarAltaInternacao } from './dialog-registrar-alta-internacao';

describe('DialogRegistrarAltaInternacao', () => {
  let component: DialogRegistrarAltaInternacao;
  let fixture: ComponentFixture<DialogRegistrarAltaInternacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogRegistrarAltaInternacao],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogRegistrarAltaInternacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
