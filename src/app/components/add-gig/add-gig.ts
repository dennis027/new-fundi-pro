// add-gig.component.ts

import { afterNextRender, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AppBarService } from '../../services/app-bar-service';

interface JobType {
  id: number;
  name: string;
}

interface Organization {
  id: number;
  name: string;
  county: string;
  constituency: string;
  ward: string;
  phone_number?: string;
}

@Component({
  selector: 'app-add-gig',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule
  ],
  templateUrl: './add-gig.html',
  styleUrls: ['./add-gig.css'],
})
export class AddGig implements OnInit, OnDestroy {
  // Signals for reactivity
  isMobile = signal(false);
  isLoading = signal(false);
  selectedOrganization = signal<Organization | null>(null);

  private appBar = inject(AppBarService);
  private fb = inject(FormBuilder);

  // Form
  gigForm!: FormGroup;

  // Static data for demo
  jobTypes: JobType[] = [
    { id: 1, name: 'Plumbing' },
    { id: 2, name: 'Electrical' },
    { id: 3, name: 'Carpentry' },
    { id: 4, name: 'Painting' },
    { id: 5, name: 'Masonry' }
  ];

  organizations: Organization[] = [
    {
      id: 1,
      name: 'Nairobi Hospital',
      county: 'Nairobi',
      constituency: 'Westlands',
      ward: 'Parklands',
      phone_number: '020-1234567'
    },
    {
      id: 2,
      name: 'KNH - Kenyatta National Hospital',
      county: 'Nairobi',
      constituency: 'Dagoretti North',
      ward: 'Kilimani',
      phone_number: '020-2726300'
    },
    {
      id: 3,
      name: 'Aga Khan University Hospital',
      county: 'Nairobi',
      constituency: 'Westlands',
      ward: 'Parklands',
      phone_number: '020-3662000'
    },
    {
      id: 4,
      name: 'MP Shah Hospital',
      county: 'Nairobi',
      constituency: 'Westlands',
      ward: 'Parklands',
      phone_number: '020-4285000'
    }
  ];

  durationUnits = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' }
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
    this.appBar.setTitle('Log Gig');
    this.appBar.setBack(true);

    this.appBar.setActions([
      {
        id: 'save',
        icon: 'save',
        ariaLabel: 'Save Draft',
        onClick: () => {
          console.log('Save draft clicked');
        },
      }
    ]);

    this.initForm();
  }

  ngOnDestroy(): void {
    this.appBar.clearActions();
  }

  private initForm(): void {
    this.gigForm = this.fb.group({
      site: ['', Validators.required],
      jobType: ['', Validators.required],
      startDate: ['', Validators.required],
      durationUnit: ['', Validators.required],
      durationValue: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onOrganizationSelected(organization: Organization): void {
    this.selectedOrganization.set(organization);
    this.gigForm.patchValue({ site: organization.name });
  }

  onSubmit(): void {
    console.log('Submitting gig form', this.gigForm.value);
    if (this.gigForm.invalid) {
      this.gigForm.markAllAsTouched();
      console.log('Form is invalid');
      return;
    }

    if (!this.selectedOrganization()) {
      console.log('Please select a site');
      return;
    }

    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      const gigData = {
        ...this.gigForm.value,
        organization: this.selectedOrganization()
      };

      console.log('Submitting gig:', gigData);
      
      this.isLoading.set(false);
      
      // Show success message
      alert('Gig submitted successfully!');
      
      // Reset form
      this.gigForm.reset();
      this.selectedOrganization.set(null);
    }, 2000);
  }
}