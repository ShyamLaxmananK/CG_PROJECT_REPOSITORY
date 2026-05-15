import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotSelection } from './slot-selection';

describe('SlotSelection', () => {
  let component: SlotSelection;
  let fixture: ComponentFixture<SlotSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotSelection],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotSelection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
