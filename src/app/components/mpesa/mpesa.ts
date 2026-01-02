// mpesa.component.ts

import { afterNextRender, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppBarService } from '../../services/app-bar-service';

interface MpesaTransaction {
  id: number;
  amount: number;
  phone_number: string;
  mpesa_receipt_number: string;
  transaction_date: string;
}

@Component({
  selector: 'app-mpesa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './mpesa.html',
  styleUrl: './mpesa.css',
})
export class Mpesa implements OnInit, OnDestroy {
  isMobile = signal(false);
  isLoading = signal(false);
  showPaymentDialog = signal(false);
  showFilterDialog = signal(false);
  mpesaMessages = signal<MpesaTransaction[]>([]);

  private appBar = inject(AppBarService);

  // Payment dialog fields
  paymentPhone: string = '';
  paymentAmount: number | null = null;

  // Filter fields
  filterPhone: string = '';
  filterAmount: string = '';
  filterReceipt: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';

  // Mock data
  private mockTransactions: MpesaTransaction[] = [
    {
      id: 1,
      amount: 8500,
      phone_number: '254712345678',
      mpesa_receipt_number: 'QHJ8K9L0M1',
      transaction_date: '2025-01-03T14:30:00'
    },
    {
      id: 2,
      amount: 15000,
      phone_number: '254723456789',
      mpesa_receipt_number: 'QHJ8K9L0M2',
      transaction_date: '2025-01-02T10:15:00'
    },
    {
      id: 3,
      amount: 12000,
      phone_number: '254734567890',
      mpesa_receipt_number: 'QHJ8K9L0M3',
      transaction_date: '2025-01-01T16:45:00'
    },
    {
      id: 4,
      amount: 25000,
      phone_number: '254745678901',
      mpesa_receipt_number: 'QHJ8K9L0M4',
      transaction_date: '2024-12-31T09:20:00'
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
    this.appBar.setTitle('M-Pesa');
    this.appBar.setBack(true);

    this.appBar.setActions([
      {
        id: 'filter',
        icon: 'filter_list',
        ariaLabel: 'Filter Messages',
        onClick: () => {
          this.openFilterDialog();
        },
      },
      {
        id: 'refresh',
        icon: 'refresh',
        ariaLabel: 'Refresh',
        onClick: () => {
          this.fetchMpesaMessages();
        },
      }
    ]);

    this.fetchMpesaMessages();
  }

  ngOnDestroy(): void {
    // VERY IMPORTANT: cleanup
    this.appBar.clearActions();
  }

  fetchMpesaMessages(): void {
    this.isLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.mpesaMessages.set([...this.mockTransactions]);
      this.isLoading.set(false);
    }, 800);
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  }

  formatPhone(phone: string): string {
    if (phone.startsWith('254')) {
      return '0' + phone.substring(3);
    }
    return phone;
  }

  // Payment Dialog
  openPaymentDialog(): void {
    this.showPaymentDialog.set(true);
    this.paymentPhone = '';
    this.paymentAmount = null;
  }

  closePaymentDialog(): void {
    this.showPaymentDialog.set(false);
  }

  sendStkPush(): void {
    if (!this.paymentPhone || !this.paymentAmount || this.paymentAmount <= 0) {
      alert('Please enter valid phone number and amount');
      return;
    }

    let phone = this.paymentPhone.trim();
    
    // Format phone number
    if (phone.startsWith('0')) {
      phone = '254' + phone.substring(1);
    } else if (phone.startsWith('+254')) {
      phone = '254' + phone.substring(4);
    }

    console.log('Sending STK Push:', {
      phone,
      amount: this.paymentAmount
    });

    // Simulate API call
    setTimeout(() => {
      // Add new transaction to the list
      const newTransaction: MpesaTransaction = {
        id: Date.now(),
        amount: this.paymentAmount!,
        phone_number: phone,
        mpesa_receipt_number: 'QHJ' + Math.random().toString(36).substring(2, 11).toUpperCase(),
        transaction_date: new Date().toISOString()
      };

      this.mpesaMessages.update(messages => [newTransaction, ...messages]);
      
      this.closePaymentDialog();
      alert('STK push sent successfully!');
    }, 1000);
  }

  // Filter Dialog
  openFilterDialog(): void {
    this.showFilterDialog.set(true);
  }

  closeFilterDialog(): void {
    this.showFilterDialog.set(false);
  }

  applyFilters(): void {
    console.log('Applying filters:', {
      phone: this.filterPhone,
      amount: this.filterAmount,
      receipt: this.filterReceipt,
      startDate: this.filterStartDate,
      endDate: this.filterEndDate
    });

    let filtered = [...this.mockTransactions];

    // Apply phone filter
    if (this.filterPhone) {
      filtered = filtered.filter(t => 
        t.phone_number.includes(this.filterPhone) || 
        this.formatPhone(t.phone_number).includes(this.filterPhone)
      );
    }

    // Apply amount filter
    if (this.filterAmount) {
      filtered = filtered.filter(t => 
        t.amount === parseFloat(this.filterAmount)
      );
    }

    // Apply receipt filter
    if (this.filterReceipt) {
      filtered = filtered.filter(t => 
        t.mpesa_receipt_number.toLowerCase().includes(this.filterReceipt.toLowerCase())
      );
    }

    // Apply date filters
    if (this.filterStartDate) {
      const startDate = new Date(this.filterStartDate);
      filtered = filtered.filter(t => 
        new Date(t.transaction_date) >= startDate
      );
    }

    if (this.filterEndDate) {
      const endDate = new Date(this.filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => 
        new Date(t.transaction_date) <= endDate
      );
    }

    this.mpesaMessages.set(filtered);
    this.closeFilterDialog();
  }

  clearFilters(): void {
    this.filterPhone = '';
    this.filterAmount = '';
    this.filterReceipt = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    
    this.mpesaMessages.set([...this.mockTransactions]);
    this.closeFilterDialog();
  }
}