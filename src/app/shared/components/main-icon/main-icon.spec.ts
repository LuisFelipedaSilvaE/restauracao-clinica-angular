import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainIcon } from './main-icon';

describe('MainIcon', () => {
  let component: MainIcon;
  let fixture: ComponentFixture<MainIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(MainIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
