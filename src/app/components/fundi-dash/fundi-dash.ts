// fundi-dash.component.ts

import { Component, signal, afterNextRender, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppBarService } from '../../services/app-bar-service';

@Component({
  selector: 'app-fundi-dash',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule
  ],
  templateUrl: './fundi-dash.html',
  styleUrls: ['./fundi-dash.css'],
})
export class FundiDash implements OnInit, OnDestroy {
  @ViewChild('accountMenuTrigger') accountMenuTrigger!: MatMenuTrigger;
  
  isMobile = signal(false);
  private appBar = inject(AppBarService);
  private router = inject(Router);

  // Default user data - no API calls
  username: string = 'John Doe';
  email: string = 'john.doe@example.com';
  fullname: string = 'John Doe';
  imgFile: string = '';
  location: string = 'Nairobi, Kenya';
  totalGigs: number = 8;
  verifiedGigs: number = 3;
  creditScore: number = 75;

  // API URLs (not used, kept for compatibility)
  apiUrl: string = '';
  imgUrl: string = '';

  constructor() {
    afterNextRender(() => {
      this.checkScreen();
      window.addEventListener('resize', () => this.checkScreen());
    });
  }

  private checkScreen(): void {
    this.isMobile.set(window.innerWidth < 992);
  }

  ngOnInit(): void {
    this.appBar.setTitle('Dashboard');
    this.appBar.setBack(false);

    this.appBar.setActions([
      {
        id: 'account',
        icon: 'account_circle',
        ariaLabel: 'Account',
        onClick: () => {
          setTimeout(() => {
            this.accountMenuTrigger?.openMenu();
          }, 0);
        },
      },
    ]);
  }

  // Menu action handlers
  goToProfile(): void {
    this.router.navigate(['/main-menu/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/main-menu/settings']);
  }

  logout(): void {
    console.log('Logging out...');
    localStorage.removeItem('access_token');
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.appBar.clearActions();
  }

  // Get score gradient for circular progress
  getScoreGradient(): string {
    const percentage = (this.creditScore / 100) * 360;
    const color = this.creditScore >= 70 ? '#2e7d32' : '#f97316';
    
    return `conic-gradient(${color} 0deg ${percentage}deg, #e5e7eb ${percentage}deg)`;
  }
}