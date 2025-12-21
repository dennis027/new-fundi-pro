import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mpesa } from './mpesa';

describe('Mpesa', () => {
  let component: Mpesa;
  let fixture: ComponentFixture<Mpesa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mpesa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mpesa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
