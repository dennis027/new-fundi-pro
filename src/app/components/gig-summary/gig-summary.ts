// gig-summary.component.ts

import { afterNextRender, Component, inject, signal, OnInit, OnDestroy, PLATFORM_ID, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppBarService } from '../../services/app-bar-service';
import { GigServices } from '../../services/gig-services';
import { SharedImports } from '../../shared-imports/imports';

interface JobType {
  id: number;
  name: string;
}

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

@Component({
  selector: 'app-gig-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    SharedImports
  ],
  templateUrl: './gig-summary.html',
  styleUrl: './gig-summary.css',
})
export class GigSummary implements OnInit, OnDestroy {
  @ViewChild('addGigDialog') addGigDialogTemplate!: TemplateRef<any>;
  
  isLoading = signal(true);
  gigs = signal<Gig[]>([]);
  isSubmitting = signal(false);
  
  gigForm!: FormGroup;
  dialogRef?: MatDialogRef<any>;

  private fb = inject(FormBuilder);
  private appBar = inject(AppBarService);
  private router = inject(Router);
  private gigServices = inject(GigServices);
  private platformId = inject(PLATFORM_ID);
  private dialog = inject(MatDialog);

  userRelatedGigs: Gig[] = [];
  organizations: any[] = [];


  jobTypes: JobType[] = [
    { id: 1, name: 'Plumbing' },
    { id: 2, name: 'Electrical' },
    { id: 3, name: 'Carpentry' },
    { id: 4, name: 'Painting' },
    { id: 5, name: 'Masonry' }
  ];

  counties = ['Nairobi', 'Kiambu', 'Mombasa', 'Kisumu', 'Nakuru'];
  constituencies = ['Westlands', 'Dagoretti North', 'Starehe', 'Langata', 'Kasarani'];

  // Job types map
  private jobTypesMap: Map<number, string> = new Map();

  // Mock gigs
  mockGigs: Gig[] = [
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
          this.openAddGigDialog();
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

    // Initialize form
    this.initGigForm();

    if (isPlatformBrowser(this.platformId)) {
      this.getOrganizations();
      this.getGigsAvailable();
      this.getGigType();
      this.getUserRelatedGigs();
      this.fetchGigs();
    }
  }

  initGigForm(): void {
    this.gigForm = this.fb.group({
      job_type: [''],
      start_date: ['', Validators.required],
      duration_value: [null, [Validators.required, Validators.min(1)]],
      duration_unit: ['', Validators.required],
      client_name: ['', Validators.required],
      client_phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      county: ['', Validators.required],
      constituency: ['', Validators.required],
      ward: ['', Validators.required],
      organization: [15],
    });
  }

  getOrganizations(): void {
    this.gigServices.getOrganizations().subscribe({
      next: (data) => {
        console.log('Organizations:', data);
        this.organizations = data;
      },
      error: (error) => {
        console.error('Error fetching organizations:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  getGigsAvailable(): void {
    this.gigServices.getGigsAvailable().subscribe({
      next: (data) => {
        console.log('Gigs Available:', data);
      },
      error: (error) => {
        console.error('Error fetching gigs available:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  getGigType(): void {
    this.gigServices.getGigTypes().subscribe({
      next: (data) => {
        console.log('Gig Types:', data);
      },
      error: (error) => {
        console.error('Error fetching gig types:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  getUserRelatedGigs(): void {
    this.gigServices.userRelatedGigs().subscribe({
      next: (data) => {
        console.log('User Related Gigs:', data);
        this.userRelatedGigs = data;
      },
      error: (error) => {
        console.error('Error fetching user related gigs:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.appBar.clearActions();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  fetchGigs(): void {
    this.isLoading.set(true);

    // Load job types
    this.jobTypes.forEach(jt => {
      this.jobTypesMap.set(jt.id, jt.name);
    });

    // Simulate API call
    setTimeout(() => {
      this.gigs.set([...this.userRelatedGigs]);
      this.isLoading.set(false);
    }, 1000);
  }

  getJobTypeName(jobTypeId: number): string {
    return this.jobTypesMap.get(jobTypeId) || 'Unknown Job';
  }

  openAddGigDialog(): void {
    this.gigForm.reset({ organization: 15 });
    this.dialogRef = this.dialog.open(this.addGigDialogTemplate, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'gig-dialog',
      disableClose: false
    });

    this.dialogRef.afterClosed().subscribe(() => {
      this.isSubmitting.set(false);
    });
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onSubmit(): void {
    if (this.gigForm.invalid) {
      this.gigForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.gigForm.value;

    console.log('SUBMIT PAYLOAD', payload);

    // Simulate API call
    setTimeout(() => {
      const newGig: Gig = {
        id: this.mockGigs.length + 1,
        job_type: parseInt(payload.job_type),
        client_name: payload.client_name,
        client_phone: payload.client_phone,
        county: payload.county,
        constituency: payload.constituency,
        ward: payload.ward,
        start_date: payload.start_date,
        duration_value: payload.duration_value,
        duration_unit: payload.duration_unit,
        is_verified: false
      };

      this.mockGigs.unshift(newGig);
      this.gigs.set([...this.mockGigs]);

      this.isSubmitting.set(false);
      this.closeDialog();

      console.log('Gig added successfully!');
    }, 1500);

    
      // REAL API IMPLEMENTATION:
      
      this.gigServices.addGig(payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.closeDialog();
          this.fetchGigs(); // Reload gigs
        },
        error: (error) => {
          console.error('Error creating gig:', error);
          this.isSubmitting.set(false);
        }
      });
    
  }

  hasError(fieldName: string): boolean {
    const field = this.gigForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.gigForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return 'This field is required';
    }
    if (field.hasError('min')) {
      return 'Value must be greater than 0';
    }
    if (field.hasError('pattern')) {
      return 'Please enter a valid 10-digit phone number';
    }
    return '';
  }
}