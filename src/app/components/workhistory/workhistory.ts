// workhistory.component.ts

import { afterNextRender, Component, inject, signal, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AppBarService } from '../../services/app-bar-service';
import { GigServices } from '../../services/gig-services';

interface WorkHistoryItem {
  id: number;
  created_at: string;
  start_date: string;
  duration_value: number;
  duration_unit: string;
  client_name: string;
  client_phone: string;
  ward: string;
  constituency: string;
  county: string;
  job_type?: number;
  organization?: number;
  worker?: number;
  is_verified?: boolean;
}

@Component({
  selector: 'app-workhistory',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './workhistory.html',
  styleUrl: './workhistory.css',
})
export class Workhistory implements OnInit, OnDestroy {
  isLoading = signal(true);
  workHistory = signal<WorkHistoryItem[]>([]);

  private appBar = inject(AppBarService);
  private router = inject(Router);
  private gigServices = inject(GigServices);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
    });
  }

  ngOnInit(): void {
    this.appBar.setTitle('Work History');
    this.appBar.setBack(true);

    this.appBar.setActions([
      {
        id: 'refresh',
        icon: 'refresh',
        ariaLabel: 'Refresh',
        onClick: () => {
          this.getWorkHistoryFromAPI();
        },
      }
    ]);

    if (isPlatformBrowser(this.platformId)) {
      this.getWorkHistoryFromAPI();
    }
  }

  ngOnDestroy(): void {
    this.appBar.clearActions();
  }

  getWorkHistoryFromAPI(): void {
    this.isLoading.set(true);
    this.gigServices.userWorkHistory().subscribe({
      next: (data) => {
        this.workHistory.set(data);
        console.log('Work history fetched successfully:', this.workHistory());
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching work history:', error);
        this.isLoading.set(false);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        } 
      }
    });
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  }

  addNewHistory(): void {
    this.router.navigate(['/main-menu/add-work-history']);
  }
}