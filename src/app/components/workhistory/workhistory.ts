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
  job_type?: string;
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

  // Mock data
  private mockWorkHistory: WorkHistoryItem[] = [
    {
      id: 1,
      created_at: '2025-01-03T10:30:00',
      start_date: '2025-01-01',
      duration_value: 5,
      duration_unit: 'days',
      client_name: 'Nairobi Hospital',
      client_phone: '0712345678',
      ward: 'Parklands',
      constituency: 'Westlands',
      county: 'Nairobi',
      job_type: 'Plumbing'
    },
    {
      id: 2,
      created_at: '2024-12-28T14:20:00',
      start_date: '2024-12-26',
      duration_value: 2,
      duration_unit: 'weeks',
      client_name: 'KNH',
      client_phone: '0723456789',
      ward: 'Kilimani',
      constituency: 'Dagoretti North',
      county: 'Nairobi',
      job_type: 'Electrical'
    },
    {
      id: 3,
      created_at: '2024-12-15T09:15:00',
      start_date: '2024-12-10',
      duration_value: 7,
      duration_unit: 'days',
      client_name: 'Aga Khan Hospital',
      client_phone: '0734567890',
      ward: 'Parklands',
      constituency: 'Westlands',
      county: 'Nairobi',
      job_type: 'Carpentry'
    }
  ];

  constructor() {
    afterNextRender(() => {
      // Any browser-only code
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
          this.fetchWorkHistory();
        },
      }
    ]);

    this.fetchWorkHistory();

    if (isPlatformBrowser(this.platformId)) {
        this.getWorkHistoryFromAPI();
    }

  }

  ngOnDestroy(): void {
    // VERY IMPORTANT: cleanup
    this.appBar.clearActions();
  }

  getWorkHistoryFromAPI(): void {
    this.isLoading.set(true);
    this.gigServices.userWorkHistory().subscribe({
      next: (data) => {
        this.workHistory.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching work history:', error);
        this.isLoading.set(false);
      }
    });
  }

  


  fetchWorkHistory(): void {
    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.workHistory.set([...this.mockWorkHistory]);
      this.isLoading.set(false);
    }, 1000);
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