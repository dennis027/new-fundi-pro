// fundi-dash.component.ts

import { Component, signal, afterNextRender, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppBarService } from '../../services/app-bar-service';

@Component({
  selector: 'app-fundi-dash',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fundi-dash.html',
  styleUrls: ['./fundi-dash.css'],
})
export class FundiDash implements OnInit, OnDestroy {
  // Use Signals for modern reactivity
  isMobile = signal(false);
  private appBar = inject(AppBarService);

  constructor() {
    // afterNextRender runs ONLY in the browser
    afterNextRender(() => {
      this.checkScreen();
      
      // Manual listener for resize events
      window.addEventListener('resize', () => this.checkScreen());
    });
  }

  private checkScreen(): void {
    // Set mobile breakpoint at 992px (lg breakpoint)
    this.isMobile.set(window.innerWidth < 992);
  }

  ngOnInit() {
    this.appBar.setTitle('Dashboard');
    this.appBar.setBack(false);

    this.appBar.setActions([
      {
        id: 'account',
        icon: 'account_circle',
        ariaLabel: 'Account',
        onClick: () => {
          console.log('Account clicked');
        },
      },
    ]);
  }

  ngOnDestroy() {
    // IMPORTANT: cleanup
    this.appBar.clearActions();
  }
}