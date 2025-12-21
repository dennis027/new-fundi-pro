import { Component, inject } from '@angular/core';
import { AppBarService } from '../../services/app-bar-service';

@Component({
  selector: 'app-credit-score',
  imports: [],
  templateUrl: './credit-score.html',
  styleUrl: './credit-score.css',
})
export class CreditScore {

   private appBar = inject(AppBarService);

   ngOnInit() {
     this.appBar.setTitle('Credit Score');
     this.appBar.setBack(true);

 
   }

   ngOnDestroy() {
     // VERY IMPORTANT: cleanup
     this.appBar.clearActions();
   }
}
