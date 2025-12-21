import { afterNextRender, Component, inject, signal } from '@angular/core';
import { AppBarService } from '../../services/app-bar-service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile {

 // 1. Use Signals for modern reactivity
  isMobile = signal(false);
  private appBar = inject(AppBarService);

  constructor() {
    // 2. afterNextRender is guaranteed to run ONLY in the browser.
    // This is the safest way to fix the "window is not defined" error.
    afterNextRender(() => {
      this.checkScreen();
      
      // Manual listener replaces @HostListener for SSR safety
      window.addEventListener('resize', () => this.checkScreen());
    });
  }

  private checkScreen(): void {
    // Logic inside here is now safe because it's called via afterNextRender
    this.isMobile.set(window.innerWidth < 992);
  }

  ngOnInit() {
    this.appBar.setTitle('Profile');
    this.appBar.setBack(true);

    this.appBar.setActions([
      {
        id: 'account',
        icon: 'arrow_back',
        ariaLabel: 'Account',
        onClick: () => {
          console.log('Account clicked');
        },
      },

      
    ]);
  }

  ngOnDestroy() {
    // VERY IMPORTANT: cleanup
    this.appBar.clearActions();
  }
}