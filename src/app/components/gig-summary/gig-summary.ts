// gig-summary.component.ts

import { afterNextRender, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AppBarService } from '../../services/app-bar-service';
import { GigServices } from '../../services/gig-services';

interface Gig {
  id: number;
  job_type: number;
  client_name: string;
  client_phone: string;
  county: string;
  constituency: string;
  ward: string;
  start_date: string;
  duration_value: number;
  duration_unit: string;
  is_verified: boolean;
}

interface JobType {
  id: number;
  name: string;
}

@Component({
  selector: 'app-gig-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './gig-summary.html',
  styleUrl: './gig-summary.css',
})
export class GigSummary implements OnInit, OnDestroy {
  isLoading = signal(true);
  gigs = signal<Gig[]>([]);

  private appBar = inject(AppBarService);
  private router = inject(Router);
  private gigServices = inject(GigServices);

  // Job types map
  private jobTypesMap: Map<number, string> = new Map();

  // Mock job types
  private mockJobTypes: JobType[] = [
    { id: 1, name: 'Plumbing' },
    { id: 2, name: 'Electrical' },
    { id: 3, name: 'Carpentry' },
    { id: 4, name: 'Painting' },
    { id: 5, name: 'Masonry' }
  ];

  // Mock gigs
  private mockGigs: Gig[] = [
    {
      id: 1,
      job_type: 1,
      client_name: 'Nairobi Hospital',
      client_phone: '0712345678',
      county: 'Nairobi',
      constituency: 'Westlands',
      ward: 'Parklands',
      start_date: '2025-01-01',
      duration_value: 5,
      duration_unit: 'days',
      is_verified: true
    },
    {
      id: 2,
      job_type: 2,
      client_name: 'KNH',
      client_phone: '0723456789',
      county: 'Nairobi',
      constituency: 'Dagoretti North',
      ward: 'Kilimani',
      start_date: '2024-12-26',
      duration_value: 2,
      duration_unit: 'weeks',
      is_verified: false
    },
    {
      id: 3,
      job_type: 3,
      client_name: 'Aga Khan Hospital',
      client_phone: '0734567890',
      county: 'Nairobi',
      constituency: 'Westlands',
      ward: 'Parklands',
      start_date: '2024-12-15',
      duration_value: 7,
      duration_unit: 'days',
      is_verified: true
    },
    {
      id: 4,
      job_type: 4,
      client_name: 'MP Shah Hospital',
      client_phone: '0745678901',
      county: 'Nairobi',
      constituency: 'Starehe',
      ward: 'Nairobi Central',
      start_date: '2024-12-10',
      duration_value: 3,
      duration_unit: 'days',
      is_verified: false
    }
  ];

  constructor() {
    afterNextRender(() => {
      // Any browser-only code
    });
  }

  ngOnInit(): void {
    this.appBar.setTitle('My Gigs');
    this.appBar.setBack(true);

    this.appBar.setActions([
      {
        id: 'add-gig',
        icon: 'add',
        ariaLabel: 'Add Gigs',
        onClick: () => {
          console.log('Navigate to Add Gig');
        },
      },
      {
        id: 'refresh',
        icon: 'refresh',
        ariaLabel: 'Refresh Gigs',
        onClick: () => {
          this.fetchGigs();
        },
      }
    ]);

    this.fetchGigs();

    this.gigServices.getOrganizations().subscribe({
      next: (data) => {
        console.log('Organizations:', data);
      },
      error: (error) => {
        console.error('Error fetching organizations:', error);

        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.appBar.clearActions();
  }

  fetchGigs(): void {
    this.isLoading.set(true);

    // Load job types
    this.mockJobTypes.forEach(jt => {
      this.jobTypesMap.set(jt.id, jt.name);
    });

    // Simulate API call
    setTimeout(() => {
      this.gigs.set([...this.mockGigs]);
      this.isLoading.set(false);
    }, 1000);
  }

  getJobTypeName(jobTypeId: number): string {
    return this.jobTypesMap.get(jobTypeId) || 'Unknown Job';
  }

  addFirstGig(): void {
    this.router.navigate(['/main-menu/log-gig']);
  }
}