// fundi-dash.component.ts

import { Component, signal, afterNextRender, inject, OnInit, OnDestroy, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppBarService } from '../../services/app-bar-service';
import { UserService } from '../../services/user-service';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

interface WorkLog {
  id: number;
  siteName: string;
  jobType: string;
  date: string;
  verified: boolean;
  foremanName?: string;
}

interface CalendarDay {
  date: string;
  dayNum: number;
  status: 'verified' | 'pending' | 'empty';
  tooltip: string;
}

interface DashboardStats {
  total_gigs: number;
  verified_gigs: number;
  verified_days: number;
  verification_rate: number;
  sites_worked: number;
  disputes: number;
  history_months: number;
  credit_score: number;
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
  isLoading = signal(true);
  
  private appBar = inject(AppBarService);
  private router = inject(Router);
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);
  
  // User data
  username = signal<string>('');
  email = signal<string>('');
  fullname = signal<string>('');
  imgFile = signal<string>('');
  location = signal<string>('');
  
  // Trust-focused metrics (now from API)
  totalGigs = signal<number>(0);
  verifiedGigs = signal<number>(0);
  verifiedDays = signal<number>(0);
  verificationRate = signal<number>(0);
  sitesWorked = signal<number>(0);
  disputes = signal<number>(0);
  historyMonths = signal<number>(0);
  creditScore = signal<number>(0);
  
  // Recent work logs (from API)
  recentWorkLogs = signal<WorkLog[]>([]);
  
  // 30-day activity calendar (from API)
  last30Days = signal<CalendarDay[]>([]);

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

    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
    }
  }

  /**
   * Load all dashboard data from API
   */
  private loadDashboardData(): void {
    this.isLoading.set(true);

    // Load all data in parallel using forkJoin
    forkJoin({
      userProfile: this.userService.getUserDetails(),
      dashboardStats: this.userService.fundiStats(),
      recentWork: this.userService.userRecentWorks(),
      calendar: this.userService.dashCalendarData()
    }).subscribe({
      next: (results) => {
        console.log('Dashboard data loaded:', results);

        // Set user data
        this.username.set(results.userProfile.username || '');
        this.fullname.set(results.userProfile.full_name || '');
        this.email.set(results.userProfile.email || '');
        
        const location = [
          results.userProfile.county,
          results.userProfile.constituency,
          results.userProfile.ward
        ].filter(Boolean).join(', ');
        this.location.set(location);
        
        // Handle profile image
        if (results.userProfile.profile_pic) {
          this.imgFile.set(`${environment.apiUrl}${results.userProfile.profile_pic}`);
        }

        // Set dashboard stats
        const stats = results.dashboardStats as DashboardStats;
        this.totalGigs.set(stats.total_gigs);
        this.verifiedGigs.set(stats.verified_gigs);
        this.verifiedDays.set(stats.verified_days);
        this.verificationRate.set(stats.verification_rate);
        this.sitesWorked.set(stats.sites_worked);
        this.disputes.set(stats.disputes);
        this.historyMonths.set(stats.history_months);
        this.creditScore.set(stats.credit_score);

        // Set recent work logs
        this.recentWorkLogs.set(results.recentWork);

        // Set calendar data
        this.last30Days.set(results.calendar);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading.set(false);
        
        if (err.status === 401) {
          console.error('Unauthorized - redirecting to login');
          this.router.navigate(['/login']);
        } else {
          // Show error message to user
          console.error('Failed to load dashboard data. Please try again.');
        }
      }
    });
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): void {
    this.loadDashboardData();
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

  /**
   * Get score gradient for circular progress
   */
  getScoreGradient(): string {
    const rate = this.verificationRate();
    const percentage = (rate / 100) * 360;
    const color = rate >= 70 ? '#2e7d32' : '#f97316';
    
    return `conic-gradient(${color} 0deg ${percentage}deg, #e5e7eb ${percentage}deg)`;
  }

  /**
   * Get credit score gradient
   */
  getCreditScoreGradient(): string {
    const score = this.creditScore();
    const percentage = (score / 100) * 360;
    let color = '#ef4444'; // red for low scores
    
    if (score >= 70) {
      color = '#22c55e'; // green for high scores
    } else if (score >= 40) {
      color = '#f97316'; // orange for medium scores
    }
    
    return `conic-gradient(${color} 0deg ${percentage}deg, #e5e7eb ${percentage}deg)`;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Get verification status text
   */
  getVerificationStatus(): string {
    if (this.historyMonths() >= 3) {
      return '✓ Ready for Credit';
    } else {
      return `⏳ ${3 - this.historyMonths()} months to go`;
    }
  }
}