import { Component, inject } from '@angular/core';
import { AppBarService } from '../../services/app-bar-service';

@Component({
  selector: 'app-search-gigs',
  imports: [],
  templateUrl: './search-gigs.html',
  styleUrl: './search-gigs.css',
})
export class SearchGigs {

   private appBar = inject(AppBarService);

   ngOnInit() {
     this.appBar.setTitle('Search Gigs');
     this.appBar.setBack(true);

 
   }

   ngOnDestroy() {
     // VERY IMPORTANT: cleanup
     this.appBar.clearActions();
   }
}
