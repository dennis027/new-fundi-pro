import { Component, inject, signal, afterNextRender, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AppBarService } from '../../services/app-bar-service';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../services/analytics-service';

interface SummaryStats {
  all_time: {
    total_gigs: number;
    verified_gigs: number;
    verification_rate: number;
    total_earnings: number;
    unique_orgs: number;
    credit_score: number;
  };
  last_7_days: {
    total_gigs: number;
    verified_gigs: number;
    total_earnings: number;
  };
  last_30_days: {
    total_gigs: number;
    verified_gigs: number;
    total_earnings: number;
  };
  top_performers: {
    top_organization: string;
    top_organization_gigs: number;
    top_organization_earnings: number;
    top_job_type: string;
    top_job_type_gigs: number;
    top_job_type_earnings: number;
  };
}

interface WorkTrend {
  period: string;
  total_gigs: number;
  verified_gigs: number;
  total_earnings: number;
  verification_rate: number;
}

interface OrganizationPerformance {
  organization_id: number;
  organization_name: string;
  total_gigs: number;
  verified_gigs: number;
  verification_rate: number;
  total_earnings: number;
}

interface JobTypeAnalytics {
  job_type: string;
  total_gigs: number;
  verified_gigs: number;
  total_earnings: number;
  verification_rate: number;
}

interface CreditScoreData {
  current_score: number;
  score_history: any[];
  recent_trend: {
    last_7_days_change: number;
    num_changes: number;
  };
}

interface ComparativeData {
  current_period: {
    total_gigs: number;
    verified_gigs: number;
    total_earnings: number;
    unique_orgs: number;
  };
  previous_period: {
    total_gigs: number;
    verified_gigs: number;
    total_earnings: number;
    unique_orgs: number;
  };
  changes: {
    gigs_change: number;
    verified_change: number;
    earnings_change: number;
    orgs_change: number;
  };
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private appBar = inject(AppBarService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isMobile = signal(false);
  isLoading = signal(true);

  // Summary data
  summaryStats = signal<SummaryStats | null>(null);
  
  // Trends data
  workTrends = signal<WorkTrend[]>([]);
  maxTrendValue = signal<number>(0);
  
  // Top performers
  topOrganizations = signal<OrganizationPerformance[]>([]);
  topJobTypes = signal<JobTypeAnalytics[]>([]);
  
  // Credit score
  creditScoreData = signal<CreditScoreData | null>(null);
  
  // Comparative data
  comparativeData = signal<ComparativeData | null>(null);

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
    this.appBar.setTitle('Analytics');
    this.appBar.setBack(true);

    if (isPlatformBrowser(this.platformId)) {
      this.loadAnalytics();
    }
  }

  /**
   * Load all analytics data
   */
  private loadAnalytics(): void {
    this.isLoading.set(true);

    forkJoin({
      summary: this.analyticsService.summary(),
      trends: this.analyticsService.workTrends(),
      organizations: this.analyticsService.orgPerformance(),
      jobTypes: this.analyticsService.jobTypes(),
      creditScore: this.analyticsService.creditScore(),
      comparative: this.analyticsService.comparativeE()
    }).subscribe({
      next: (results) => {
        console.log('Fundi analytics data loaded:', results);

        // Set summary stats
        this.summaryStats.set(results.summary);

        // Set trends (limit to 14 days for display)
        const trends = results.trends.trends || [];
        this.workTrends.set(trends.slice(-14));
        
        // Calculate max value for chart scaling
        const maxGigs = Math.max(...trends.map((t: WorkTrend) => t.total_gigs), 1);
        this.maxTrendValue.set(maxGigs);

        // Set top organizations (limit to 5)
        this.topOrganizations.set(results.organizations.slice(0, 5));

        // Set top job types (limit to 5)
        this.topJobTypes.set(results.jobTypes.slice(0, 5));

        // Set credit score data
        this.creditScoreData.set(results.creditScore);

        // Set comparative data
        this.comparativeData.set(results.comparative);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading Fundi analytics:', err);
        this.isLoading.set(false);
        
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  /**
   * Get change indicator class
   */
  getChangeClass(change: number): string {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  }

  /**
   * Get change icon
   */
  getChangeIcon(change: number): string {
    if (change > 0) return 'trending_up';
    if (change < 0) return 'trending_down';
    return 'trending_flat';
  }

  /**
   * Get credit score color class
   */
  getCreditScoreClass(score: number): string {
    if (score >= 70) return 'excellent';
    if (score >= 40) return 'good';
    return 'needs-improvement';
  }

  /**
   * Refresh analytics data
   */
  refreshAnalytics(): void {
    this.loadAnalytics();
  }

  /**
   * Navigate to detailed view
   */
  viewDetails(type: string): void {
    console.log('View details for:', type);
  }
}