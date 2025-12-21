import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofOfPayment } from './proof-of-payment';

describe('ProofOfPayment', () => {
  let component: ProofOfPayment;
  let fixture: ComponentFixture<ProofOfPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProofOfPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProofOfPayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
