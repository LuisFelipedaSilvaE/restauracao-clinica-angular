import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailInfoField } from './detail-info-field';

describe('DetailInfoField', () => {
  let component: DetailInfoField;
  let fixture: ComponentFixture<DetailInfoField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailInfoField],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailInfoField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
