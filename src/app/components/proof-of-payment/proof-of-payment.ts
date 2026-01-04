// proof-of-payment.component.ts

import { afterNextRender, Component, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AppBarService } from '../../services/app-bar-service';

@Component({
  selector: 'app-proof-of-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './proof-of-payment.html',
  styleUrl: './proof-of-payment.css',
})
export class ProofOfPayment implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  activeTab = signal<'smart' | 'manual'>('smart');
  screenshot = signal<string | null>(null);
  isAnalyzing = signal(false);
  isAutoFilled = signal(false);
  isSubmitting = signal(false);
  analysisError = signal<string | null>(null);
  
  amount = signal<string>('');
  transactionCode = signal<string>('');

  private appBar = inject(AppBarService);
  private router = inject(Router);
  private selectedFile: File | null = null;

  constructor() {
    afterNextRender(() => {
      // Any browser-only code
    });
  }

  ngOnInit(): void {
    this.appBar.setTitle('Proof Of Payment');
    this.appBar.setBack(true);
  }

  ngOnDestroy(): void {
    // VERY IMPORTANT: cleanup
    this.appBar.clearActions();
  }

  setActiveTab(tab: 'smart' | 'manual'): void {
    this.activeTab.set(tab);
  }

  openFilePicker(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.screenshot.set(e.target?.result as string);
        this.isAutoFilled.set(false);
        this.analysisError.set(null);
        
        // Automatically analyze
        this.analyzeScreenshot();
      };
      reader.readAsDataURL(file);
    }
  }

  removeScreenshot(): void {
    this.screenshot.set(null);
    this.selectedFile = null;
    this.isAutoFilled.set(false);
    this.analysisError.set(null);
    this.amount.set('');
    this.transactionCode.set('');
    
    // Reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  analyzeScreenshot(): void {
    this.isAnalyzing.set(true);
    this.analysisError.set(null);

    // Simulate API call for OCR/analysis
    setTimeout(() => {
      // Simulate successful extraction (mock data)
      const randomSuccess = Math.random() > 0.3; // 70% success rate

      if (randomSuccess) {
        // Mock extracted data
        this.amount.set('5000');
        this.transactionCode.set('QHJ8K9L0M1');
        this.isAutoFilled.set(true);
        this.activeTab.set('manual'); // Switch to manual tab to show filled form
      } else {
        // Simulate error
        this.analysisError.set('Could not extract transaction details. Please enter manually.');
      }

      this.isAnalyzing.set(false);
    }, 2000);
  }

  submitPayment(): void {
    if (!this.screenshot() || !this.amount() || !this.transactionCode()) {
      alert('Please fill all required fields and upload a screenshot');
      return;
    }

    this.isSubmitting.set(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Submitting payment:', {
        amount: this.amount(),
        transactionCode: this.transactionCode(),
        screenshot: this.selectedFile?.name
      });

      this.isSubmitting.set(false);
      alert('Payment uploaded successfully!');
      
      // Navigate back or to home
      this.router.navigate(['/main-menu']);
    }, 2000);
  }
}