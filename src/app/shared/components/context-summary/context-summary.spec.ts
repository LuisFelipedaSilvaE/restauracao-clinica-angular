import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextSummary } from './context-summary';

describe('ContextSummary', () => {
  let component: ContextSummary;
  let fixture: ComponentFixture<ContextSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
