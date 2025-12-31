// fundi-dash.component.ts

import { Component, signal, afterNextRender, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppBarService } from '../../services/app-bar-service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-fundi-dash',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './fundi-dash.html',
  styleUrls: ['./fundi-dash.css'],
})
export class FundiDash implements OnInit, OnDestroy {
  @ViewChild('accountMenuTrigger') accountMenuTrigger!: MatMenuTrigger;
  
  isMobile = signal(false);
  private appBar = inject(AppBarService);
  private router = inject(Router);

  constructor() {
    afterNextRender(() => {
      this.checkScreen();
      window.addEventListener('resize', () => this.checkScreen());
    });
  }

  private checkScreen(): void {
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
          // Trigger the menu programmatically
          setTimeout(() => {
            this.accountMenuTrigger?.openMenu();
          }, 0);
        },
      },
    ]);
  }

  // Menu action handlers
  goToProfile() {
    this.router.navigate(['/main-menu/profile']);
  }

  goToSettings() {
    this.router.navigate(['/main-menu/settings']);
  }

  logout() {
    console.log('Logging out...');
    // Add your logout logic here
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.appBar.clearActions();
  }
}