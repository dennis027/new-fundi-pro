// search-gigs.component.ts

import { afterNextRender, Component, inject, signal, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppBarService } from '../../services/app-bar-service';
import { GigServices } from '../../services/gig-services';
import RegionsData from '../../../assets/JSON-Files/regions.json';
import { Router } from '@angular/router';

interface JobType {
  id: number;
  name: string;
}

interface Gig {
  id: number;
  job_type: string;
  client_name: string;
  county: string;
  constituency: string;
  ward: string;
  is_verified: boolean;
}

interface Region {
  county_name: string;
  constituencies: Constituency[];
}

interface Constituency {
  constituency_name: string;
  wards: string[];
}

@Component({
  selector: 'app-search-gigs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './search-gigs.html',
  styleUrl: './search-gigs.css',
})
export class SearchGigs implements OnInit, OnDestroy {
  isMobile = signal(false);
  isLoading = signal(false);
  hasSearched = signal(false);
  searchResults = signal<Gig[]>([]);
  errorMessage = signal<string>('');

  private appBar = inject(AppBarService);
  private gigServices = inject(GigServices);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Form fields
  selectedCounty: string = '';
  selectedConstituency: string = '';
  selectedWard: string = '';
  selectedJobType: string = '';
  clientName: string = '';

  // Dropdown options
  counties: string[] = [];
  constituencies: string[] = [];
  wards: string[] = [];
  jobTypes: JobType[] = [];

  // getting regions data
  private regions: Region[] = RegionsData as Region[];

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
    this.appBar.setTitle('Search Gigs');
    this.appBar.setBack(true);

    this.loadRegions();
    if (isPlatformBrowser(this.platformId)) {
      this.getJobTypes();
    }
  }
filterGigsFromAPI(): void {
  if (this.isSearchDisabled() || this.isLoading()) return;

  this.isLoading.set(true);
  this.hasSearched.set(true);
  this.errorMessage.set('');

  const jobTypeId: any = this.selectedJobType ? parseInt(this.selectedJobType, 10) : '';
  
  console.log('Searching with filters:', {
    county: this.selectedCounty,
    constituency: this.selectedConstituency,
    ward: this.selectedWard,
    jobTypeId: jobTypeId,
    clientName: this.clientName
  });

  this.gigServices.searchGigsByType(
    this.selectedCounty,
    this.selectedConstituency,
    this.selectedWard,
    jobTypeId,
    this.clientName.trim()
  ).subscribe({
    next: (data) => {
      console.log('Search results received:', data);
      this.searchResults.set(data);
      this.isLoading.set(false);
      this.clearForm();
    },
    error: (error) => {
      console.error('Error searching gigs:', error);
      this.isLoading.set(false);

      if (error.status === 401) {
        this.errorMessage.set('Please login to continue');
        this.router.navigate(['/login']);
      } else if (error.status === 404) {
        this.errorMessage.set('No gigs found matching your criteria');
        this.searchResults.set([]);
      } else if (error.status === 500) {
        this.errorMessage.set('Server error. Please try again later.');
        this.searchResults.set([]);
      } else {
        this.errorMessage.set('An error occurred while searching. Please try again.');
        this.searchResults.set([]);
      }
    }
  });
}

  getJobTypes(): void {
    this.gigServices.getGigTypes().subscribe({
      next: (data) => {
        this.jobTypes = data;
        console.log('Job types loaded:', this.jobTypes);
      },
      error: (error) => {
        console.error('Error fetching job types:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.appBar.clearActions();
  }

  loadRegions(): void {
    this.counties = this.regions.map(r => r.county_name);
  }

  onCountyChanged(): void {
    this.selectedConstituency = '';
    this.selectedWard = '';
    this.wards = [];

    if (!this.selectedCounty) {
      this.constituencies = [];
      return;
    }

    const selectedRegion = this.regions.find(r => r.county_name === this.selectedCounty);
    if (selectedRegion) {
      this.constituencies = selectedRegion.constituencies.map(c => c.constituency_name);
    } else {
      this.constituencies = [];
    }
  }

  onConstituencyChanged(): void {
    this.selectedWard = '';

    if (!this.selectedConstituency) {
      this.wards = [];
      return;
    }

    const selectedRegion = this.regions.find(r => r.county_name === this.selectedCounty);
    if (selectedRegion) {
      const selectedConstituency = selectedRegion.constituencies.find(
        c => c.constituency_name === this.selectedConstituency
      );
      if (selectedConstituency) {
        this.wards = [...selectedConstituency.wards];
      } else {
        this.wards = [];
      }
    }
  }

  isSearchDisabled(): boolean {
    return !this.selectedCounty &&
           !this.selectedConstituency &&
           !this.selectedWard &&
           !this.selectedJobType &&
           !this.clientName.trim();
  }

  searchGigs(): void {
    this.filterGigsFromAPI();
  }

  clearForm(): void {
    this.selectedCounty = '';
    this.selectedConstituency = '';
    this.selectedWard = '';
    this.selectedJobType = '';
    this.clientName = '';
    this.constituencies = [];
    this.wards = [];
  }
}