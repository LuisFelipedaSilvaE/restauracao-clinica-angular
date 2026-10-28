import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAlterarSenhaF } from './dialog-alterar-senha-f';

describe('DialogAlterarSenhaF', () => {
  let component: DialogAlterarSenhaF;
  let fixture: ComponentFixture<DialogAlterarSenhaF>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAlterarSenhaF],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogAlterarSenhaF);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
