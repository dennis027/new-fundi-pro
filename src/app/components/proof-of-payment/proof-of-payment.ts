import { Component, inject } from '@angular/core';
import { AppBarService } from '../../services/app-bar-service';

@Component({
  selector: 'app-proof-of-payment',
  imports: [],
  templateUrl: './proof-of-payment.html',
  styleUrl: './proof-of-payment.css',
})
export class ProofOfPayment {

   private appBar = inject(AppBarService);

   ngOnInit() {
     this.appBar.setTitle('Proof Of Payment');
     this.appBar.setBack(true);

 
   }

   ngOnDestroy() {
     // VERY IMPORTANT: cleanup
     this.appBar.clearActions();
   }
}
