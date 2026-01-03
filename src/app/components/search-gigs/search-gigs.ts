// search-gigs.component.ts

import { afterNextRender, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppBarService } from '../../services/app-bar-service';

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

  private appBar = inject(AppBarService);

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

  // Mock regions data
  private regions: Region[] = [
    {
      county_name: 'Nairobi',
      constituencies: [
        {
          constituency_name: 'Westlands',
          wards: ['Parklands', 'Highridge', 'Karura', 'Kangemi', 'Mountain View']
        },
        {
          constituency_name: 'Dagoretti North',
          wards: ['Kilimani', 'Kawangware', 'Gatina', 'Kileleshwa', 'Kabiro']
        },
        {
          constituency_name: 'Starehe',
          wards: ['Nairobi Central', 'Ngara', 'Ziwani', 'Landimawe', 'Nairobi South']
        }
      ]
    },
    {
      county_name: 'Kiambu',
      constituencies: [
        {
          constituency_name: 'Kiambaa',
          wards: ['Karuri', 'Ndenderu', 'Muchatha', 'Cianda', 'Kihara']
        },
        {
          constituency_name: 'Kikuyu',
          wards: ['Kikuyu', 'Kinoo', 'Nachu', 'Sigona', 'Karai']
        }
      ]
    },
    {
      county_name: 'Mombasa',
      constituencies: [
        {
          constituency_name: 'Mvita',
          wards: ['Mji Wa Kale', 'Tudor', 'Tononoka', 'Shimanzi', 'Makadara']
        },
        {
          constituency_name: 'Nyali',
          wards: ['Frere Town', 'Ziwa La Ng\'ombe', 'Mkomani', 'Kongowea', 'Kadzandani']
        }
      ]
    }
  ];

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
      job_type: 'Plumbing',
      client_name: 'Nairobi Hospital',
      county: 'Nairobi',
      constituency: 'Westlands',
      ward: 'Parklands',
      is_verified: true
    },
    {
      id: 2,
      job_type: 'Electrical',
      client_name: 'KNH',
      county: 'Nairobi',
      constituency: 'Dagoretti North',
      ward: 'Kilimani',
      is_verified: true
    },
    {
      id: 3,
      job_type: 'Carpentry',
      client_name: 'Aga Khan Hospital',
      county: 'Nairobi',
      constituency: 'Westlands',
      ward: 'Parklands',
      is_verified: false
    },
    {
      id: 4,
      job_type: 'Painting',
      client_name: 'MP Shah Hospital',
      county: 'Nairobi',
      constituency: 'Starehe',
      ward: 'Nairobi Central',
      is_verified: true
    }
  ];

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
    this.loadJobTypes();
  }

  ngOnDestroy(): void {
    // VERY IMPORTANT: cleanup
    this.appBar.clearActions();
  }

  loadRegions(): void {
    this.counties = this.regions.map(r => r.county_name);
  }

  loadJobTypes(): void {
    this.jobTypes = [...this.mockJobTypes];
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
    if (this.isSearchDisabled() || this.isLoading()) return;

    this.isLoading.set(true);
    this.hasSearched.set(true);

    console.log('Searching with filters:', {
      county: this.selectedCounty,
      constituency: this.selectedConstituency,
      ward: this.selectedWard,
      jobType: this.selectedJobType,
      clientName: this.clientName
    });

    // Simulate API call
    setTimeout(() => {
      let results = [...this.mockGigs];

      // Apply filters
      if (this.selectedCounty) {
        results = results.filter(g => g.county === this.selectedCounty);
      }

      if (this.selectedConstituency) {
        results = results.filter(g => g.constituency === this.selectedConstituency);
      }

      if (this.selectedWard) {
        results = results.filter(g => g.ward === this.selectedWard);
      }

      if (this.selectedJobType) {
        const jobType = this.jobTypes.find(j => j.id.toString() === this.selectedJobType);
        if (jobType) {
          results = results.filter(g => g.job_type === jobType.name);
        }
      }

      if (this.clientName.trim()) {
        results = results.filter(g => 
          g.client_name.toLowerCase().includes(this.clientName.toLowerCase())
        );
      }

      this.searchResults.set(results);
      this.isLoading.set(false);

      // Clear form after search
      this.clearForm();
    }, 1000);
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