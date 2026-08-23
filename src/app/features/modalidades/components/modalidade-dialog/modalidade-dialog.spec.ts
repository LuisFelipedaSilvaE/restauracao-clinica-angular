import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalidadeDialog } from './modalidade-dialog';

describe('ModalidadeDialog', () => {
  let component: ModalidadeDialog;
  let fixture: ComponentFixture<ModalidadeDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalidadeDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalidadeDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
