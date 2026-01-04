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

interface WorkLog {
  id: number;
  siteName: string;
  jobType: string;
  date: string;
  verified: boolean;
  foremanName?: string;
}

interface CalendarDay {
  date: Date;
  dayNum: number;
  status: 'verified' | 'pending' | 'empty';
  tooltip: string;
}

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

  // User data
  username: string = 'John Doe';
  email: string = 'john.doe@example.com';
  fullname: string = 'John Doe';
  imgFile: string = '';
  location: string = 'Nairobi, Kenya';
  
  // Trust-focused metrics
  totalGigs: number = 8;
  verifiedGigs: number = 6;
  verifiedDays: number = 18;  // Last 30 days
  verificationRate: number = 92;
  sitesWorked: number = 2;
  disputes: number = 0;
  historyMonths: number = 2;  // Building toward 3 months
  
  // API URLs (not used, kept for compatibility)
  apiUrl: string = '';
  imgUrl: string = '';

  // Recent work logs (site-based, not client-based)
  recentWorkLogs: WorkLog[] = [
    {
      id: 1,
      siteName: 'Westlands Construction Site',
      jobType: 'Plumbing',
      date: '2025-01-03',
      verified: true,
      foremanName: 'James Kiprotich'
    },
    {
      id: 2,
      siteName: 'Kilimani Apartments',
      jobType: 'Electrical Work',
      date: '2025-01-02',
      verified: true,
      foremanName: 'Mary Njeri'
    },
    {
      id: 3,
      siteName: 'Westlands Construction Site',
      jobType: 'Carpentry',
      date: '2025-01-01',
      verified: false
    },
    {
      id: 4,
      siteName: 'Karen Residential',
      jobType: 'Painting',
      date: '2024-12-30',
      verified: true,
      foremanName: 'Peter Omondi'
    }
  ];

  // 30-day activity calendar
  last30Days: CalendarDay[] = [];

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

    this.generateLast30Days();
  }

  // Generate 30-day activity calendar
  private generateLast30Days(): void {
    const today = new Date();
    const calendar: CalendarDay[] = [];
    
    // Mock verified days pattern
    const verifiedDays = [1, 2, 3, 5, 6, 8, 9, 10, 12, 13, 15, 16, 17, 19, 20, 22, 23, 24];
    const pendingDays = [4, 7, 11];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayNum = date.getDate();
      
      let status: 'verified' | 'pending' | 'empty' = 'empty';
      let tooltip = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      
      if (verifiedDays.includes(dayNum % 30)) {
        status = 'verified';
        tooltip += ' - Work verified';
      } else if (pendingDays.includes(dayNum % 30)) {
        status = 'pending';
        tooltip += ' - Pending verification';
      } else {
        tooltip += ' - No work logged';
      }
      
      calendar.push({ date, dayNum, status, tooltip });
    }
    
    this.last30Days = calendar;
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

  // Get score gradient for circular progress (kept for compatibility)
  getScoreGradient(): string {
    const percentage = (this.verificationRate / 100) * 360;
    const color = this.verificationRate >= 70 ? '#2e7d32' : '#f97316';
    
    return `conic-gradient(${color} 0deg ${percentage}deg, #e5e7eb ${percentage}deg)`;
  }
}