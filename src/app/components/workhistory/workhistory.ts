import { Component, inject } from '@angular/core';
import { AppBarService } from '../../services/app-bar-service';

@Component({
  selector: 'app-workhistory',
  imports: [],
  templateUrl: './workhistory.html',
  styleUrl: './workhistory.css',
})
export class Workhistory {

   private appBar = inject(AppBarService);

   ngOnInit() {
     this.appBar.setTitle('Work History');
     this.appBar.setBack(true);

 
   }

   ngOnDestroy() {
     // VERY IMPORTANT: cleanup
     this.appBar.clearActions();
   }
}
