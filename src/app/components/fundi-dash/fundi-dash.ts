import { Component, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-fundi-dash',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fundi-dash.html',
  styleUrls: ['./fundi-dash.css'],
})
export class FundiDash {
  // 1. Use Signals for modern reactivity
  isMobile = signal(false);

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
}