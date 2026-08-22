import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewModalidadeDialog } from './new-modalidade-dialog';

describe('NewModalidadeDialog', () => {
  let component: NewModalidadeDialog;
  let fixture: ComponentFixture<NewModalidadeDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewModalidadeDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(NewModalidadeDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
