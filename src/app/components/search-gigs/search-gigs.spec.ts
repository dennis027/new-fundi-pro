import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchGigs } from './search-gigs';

describe('SearchGigs', () => {
  let component: SearchGigs;
  let fixture: ComponentFixture<SearchGigs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchGigs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchGigs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
