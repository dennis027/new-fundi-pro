import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Workhistory } from './workhistory';

describe('Workhistory', () => {
  let component: Workhistory;
  let fixture: ComponentFixture<Workhistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Workhistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Workhistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
