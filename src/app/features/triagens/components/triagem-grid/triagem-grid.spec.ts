import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriagemGrid } from './triagem-grid';

describe('TriagemGrid', () => {
  let component: TriagemGrid;
  let fixture: ComponentFixture<TriagemGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriagemGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(TriagemGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
