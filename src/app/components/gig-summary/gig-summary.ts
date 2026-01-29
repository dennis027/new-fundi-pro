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
import regionsData from '../../../assets/JSON-Files/regions.json';


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
  regions = regionsData;

  private fb = inject(FormBuilder);
  private appBar = inject(AppBarService);
  private router = inject(Router);
  private gigServices = inject(GigServices);
  private platformId = inject(PLATFORM_ID);
  private dialog = inject(MatDialog);

  userRelatedGigs: Gig[] = [];
  organizations: any[] = [];

  gigTypes: any[] = [];

  counties: string[] = [];
  constituencies: string[] = [];
  wards: string[] = [];
  selectedPhoneNumber: string = '';


  selectedCounty: string = '';
  selectedConstituency: string = '';
  selectedWard: string = '';

  

  // Job types map
  private jobTypesMap: Map<number, string> = new Map();
  private gigTypesMap: Map<number, string> = new Map();



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

    this.fetchRegions();
    this.setupLocationListeners();

  }


 fetchRegions() {
  }



setupLocationListeners(): void {
  // Load counties from JSON - use county_name instead of county
  this.counties = this.regions.map((r: any) => r.county_name);

  // Disable child controls initially
  this.gigForm.get('constituency')?.disable();
  this.gigForm.get('ward')?.disable();

  // COUNTY → CONSTITUENCY
  this.gigForm.get('county')?.valueChanges.subscribe((county: string) => {
    this.constituencies = [];
    this.wards = [];

    this.gigForm.patchValue({
      constituency: '',
      ward: ''
    });

    if (!county) {
      this.gigForm.get('constituency')?.disable();
      this.gigForm.get('ward')?.disable();
      return;
    }

    // Find county data using county_name
    const countyData = this.regions.find(
      (r: any) => r.county_name === county
    );

    // Map constituencies using constituency_name
    this.constituencies = countyData
      ? countyData.constituencies.map((c: any) => c.constituency_name)
      : [];

    if (this.constituencies.length > 0) {
      this.gigForm.get('constituency')?.enable();
    }
    this.gigForm.get('ward')?.disable();
  });

  // CONSTITUENCY → WARD
  this.gigForm.get('constituency')?.valueChanges.subscribe((constituency: string) => {
    this.wards = [];
    this.gigForm.patchValue({ ward: '' });

    if (!constituency) {
      this.gigForm.get('ward')?.disable();
      return;
    }

    // Find county data using county_name
    const countyData = this.regions.find(
      (r: any) => r.county_name === this.gigForm.get('county')?.value
    );

    // Find constituency data using constituency_name
    const constituencyData = countyData?.constituencies.find(
      (c: any) => c.constituency_name === constituency
    );

    // Wards is already an array of strings in your JSON
    this.wards = constituencyData ? constituencyData.wards : [];

    if (this.wards.length > 0) {
      this.gigForm.get('ward')?.enable();
    }
  });
}

// Also update initGigForm to not add validators to disabled fields initially
initGigForm(): void {
  this.gigForm = this.fb.group({
    job_type: ['', Validators.required],
    start_date: ['', Validators.required],
    duration_value: [null, [Validators.required, Validators.min(1)]],
    duration_unit: ['', Validators.required],
    organization:['', Validators.required],
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
        this.gigTypes = data;
            this.gigTypes.forEach(jt => {
           this.gigTypesMap.set(jt.id, jt.name);
          });
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
    this.gigTypes.forEach(jt => {
      this.jobTypesMap.set(jt.id, jt.name);
    });

    // Simulate API call
    setTimeout(() => {
      this.gigs.set([...this.userRelatedGigs]);
      this.isLoading.set(false);
    }, 1000);
  }

  getJobTypeName(jobTypeId: number): string {
    return this.gigTypesMap.get(jobTypeId) || 'Unknown Job';
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
      const newGig: any = {
        id: Math.floor(Math.random() * 10000),
        job_type: parseInt(payload.job_type),
        start_date: payload.start_date,
        duration_value: payload.duration_value,
        duration_unit: payload.duration_unit,
        is_verified: false
      };

    

      this.isSubmitting.set(false);
      this.closeDialog();

      console.log('Gig added successfully!');
    }, 1500);

    
      // REAL API IMPLEMENTATION:
      
    this.gigServices.addGig(payload).subscribe({
      next: (newGig) => {
        this.gigs.update(g => [...g, newGig]);
        this.isSubmitting.set(false);
        this.closeDialog();
      },
      error: () => {
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


getOrgDetails(event: Event) {
  const orgId = (event.target as HTMLSelectElement).value;
  console.log(orgId);
  const selectedOrg = this.organizations.find(org => org.id == orgId);
  this.selectedCounty = selectedOrg ? selectedOrg.county : '';
  this.selectedConstituency = selectedOrg ? selectedOrg.constituency : '';
  this.selectedWard = selectedOrg ? selectedOrg.ward : '';
  this.selectedPhoneNumber = selectedOrg ? selectedOrg.phone_number : '';

  

}



}