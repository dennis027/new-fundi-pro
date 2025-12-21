import { Component, inject } from '@angular/core';
import { AppBarService } from '../../services/app-bar-service';

@Component({
  selector: 'app-mpesa',
  imports: [],
  templateUrl: './mpesa.html',
  styleUrl: './mpesa.css',
})
export class Mpesa {

   private appBar = inject(AppBarService);

   ngOnInit() {
     this.appBar.setTitle('M-Pesa');
     this.appBar.setBack(true);

 
   }

   ngOnDestroy() {
     // VERY IMPORTANT: cleanup
     this.appBar.clearActions();
   }
}
