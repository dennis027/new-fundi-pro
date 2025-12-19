import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGig } from './add-gig';

describe('AddGig', () => {
  let component: AddGig;
  let fixture: ComponentFixture<AddGig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
