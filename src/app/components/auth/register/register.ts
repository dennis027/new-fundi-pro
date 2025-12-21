import {
  Component,
  signal,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  registerForm: FormGroup = this.fb.group(
    {
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required],
      account_type: ['01', Validators.required],
    },
    { validators: this.passwordsMatch }
  );

  // 🔐 Password match validator
  private passwordsMatch(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirm = control.get('confirm_password')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService.register(this.registerForm.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.showSuccess('Account created successfully!');
          this.router.navigate(['/login']);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.showError(
            err?.error?.message || 'Registration failed. Try again.'
          );
        },
      });
  }
}
