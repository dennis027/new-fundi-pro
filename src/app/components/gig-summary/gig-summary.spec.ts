import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GigSummary } from './gig-summary';

describe('GigSummary', () => {
  let component: GigSummary;
  let fixture: ComponentFixture<GigSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GigSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GigSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
