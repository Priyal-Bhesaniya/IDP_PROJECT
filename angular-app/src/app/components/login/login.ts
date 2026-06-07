import { Component, ChangeDetectorRef, NgZone, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  userName: string = '';
  mobileNumber: string = '';
  otp: string[] = ['', '', '', '', '', ''];
  showOTP: boolean = false;
  loading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'error';
  attemptsRemaining: number = 3;
  showResendLink: boolean = false;
  isAccountLocked: boolean = false;

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef, private router: Router, private ngZone: NgZone, private appRef: ApplicationRef) {
    console.log('LoginComponent initialized');
    console.log('Initial state - showOTP:', this.showOTP);
    console.log('Initial state - isAccountLocked:', this.isAccountLocked);
    
    // Check lock status every 10 seconds
    this.checkLockStatus();
    setInterval(() => {
      this.checkLockStatus();
    }, 10000);
  }

  sendOTP(): void {
    if (!this.userName || this.userName.trim().length < 2) {
      this.showMessage('Please enter your name', 'error');
      return;
    }
    
    if (!this.mobileNumber || this.mobileNumber.length < 10) {
      this.showMessage('Please enter a valid mobile number', 'error');
      return;
    }

    this.loading = true;
    this.showResendLink = false;
    
    this.authService.sendOTP(this.mobileNumber, this.userName).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        console.log('Before - showOTP:', this.showOTP);
        console.log('Before - loading:', this.loading);
        
        this.loading = false;
        this.showOTP = true;
        this.attemptsRemaining = 3;
        this.showResendLink = false;
        
        // Reset lock state if we can send OTP (means lock expired)
        if (this.isAccountLocked) {
          console.log('Lock expired - resetting lock state');
          this.isAccountLocked = false;
          this.showMessage('Account lock has expired. You can try again.', 'success');
        }
        
        console.log('After - showOTP:', this.showOTP);
        console.log('After - loading:', this.loading);
        console.log('After - attemptsRemaining:', this.attemptsRemaining);
        console.log('After - isAccountLocked:', this.isAccountLocked);
        
        this.showMessage('OTP sent to your mobile number', 'success');
        console.log('Demo OTP:', response.demoOTP);
        console.log('Mobile Number:', this.mobileNumber);
        
        // Force change detection using NgZone - multiple approaches
        this.ngZone.run(() => {
          console.log('Before detectChanges - showOTP:', this.showOTP);
          this.cdr.detectChanges();
          console.log('After detectChanges - showOTP:', this.showOTP);
        });
        
        // Additional change detection after a short delay
        setTimeout(() => {
          this.ngZone.run(() => {
            console.log('Timeout detectChanges - showOTP:', this.showOTP);
            this.cdr.detectChanges();
            // Mark for check as backup
            this.cdr.markForCheck();
          });
        }, 100);
        
        // Another check after longer delay
        setTimeout(() => {
          this.ngZone.run(() => {
            console.log('Long timeout detectChanges - showOTP:', this.showOTP);
            this.cdr.detectChanges();
          });
        }, 500);
        
        // Force complete application tick as last resort
        setTimeout(() => {
          console.log('ApplicationRef tick - forcing complete refresh');
          this.appRef.tick();
        }, 1000);
      },
      error: (error) => {
        console.log('API Error:', error);
        this.loading = false;
        this.showMessage(error.error?.message || 'Failed to send OTP', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  verifyOTP(): void {
    const fullOTP = this.otp.join('');
    if (fullOTP.length !== 6) {
      this.showMessage('Please enter complete OTP', 'error');
      return;
    }

    // If UI shows locked but user tries correct OTP, allow it (lock might have expired)
    if (this.isAccountLocked) {
      console.log('Attempting OTP verification while UI shows locked - checking if lock expired');
    }

    this.loading = true;
    
    this.authService.verifyOTP(this.mobileNumber, fullOTP).subscribe({
      next: (response) => {
        console.log('Verify API Response:', response);
        this.loading = false;
        
        // Login successful - use auth service with name from form
        const loginData = {
          ...response,
          name: this.userName // Add name from form
        };
        this.authService.login(loginData);
        
        // If account was locked, it's now unlocked
        if (this.isAccountLocked) {
          console.log('Account was locked, now unlocked by successful OTP');
          this.isAccountLocked = false;
        }
        
        this.resetForm();
        this.showMessage('Login successful! Redirecting to dashboard...', 'success');
        console.log('Login successful! Role:', response.role);
        console.log('Connected to:', response.databaseConnection);
        
        // Force change detection and redirect to dashboard
        this.ngZone.run(() => {
          this.cdr.detectChanges();
          
          // Redirect to dashboard after 1 second
          setTimeout(() => {
            this.redirectBasedOnRole(response.role);
          }, 1000);
        });
        
        // Force change detection
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('Verify API Error:', error);
        this.loading = false;
        const errorMessage = error.error?.message || 'Invalid OTP';
        console.log('Error message:', errorMessage);
        
        // Check if account is locked
        if (errorMessage.includes('locked')) {
          console.log('Account locked detected - setting isAccountLocked to true');
          this.showMessage('Account locked due to too many failed attempts. Please try again after 1 minute.', 'error');
          this.showResendLink = false;
          this.isAccountLocked = true;
          console.log('State after lock - isAccountLocked:', this.isAccountLocked);
        } else if (errorMessage.includes('attempts remaining')) {
          // Extract attempts remaining from message
          const match = errorMessage.match(/(\d+) attempts remaining/);
          if (match) {
            this.attemptsRemaining = parseInt(match[1]);
            console.log('Attempts remaining:', this.attemptsRemaining);
            if (this.attemptsRemaining === 2) {
              this.showMessage('Invalid OTP. You have 2 attempts remaining', 'error');
            } else if (this.attemptsRemaining === 1) {
              this.showMessage('Invalid OTP. You have only 1 attempt remaining', 'error');
            } else {
              this.showMessage('Invalid OTP. No attempts remaining', 'error');
              this.showResendLink = true;
            }
          }
        } else {
          this.showMessage(errorMessage, 'error');
        }
        
        // Force change detection
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
        this.cdr.detectChanges();
      }
    });
  }

  resendOTP(): void {
    if (this.isAccountLocked) {
      this.showMessage('Account is locked. Please wait before resending OTP.', 'error');
      return;
    }
    
    this.loading = true;
    this.otp = ['', '', '', '', '', ''];
    this.showResendLink = false;
    
    this.authService.resendOTP(this.mobileNumber).subscribe({
      next: (response) => {
        this.loading = false;
        this.showMessage('New OTP sent successfully. You have 3 attempts remaining.', 'success');
        this.attemptsRemaining = 3;
        console.log('New Demo OTP:', response.demoOTP);
      },
      error: (error) => {
        this.loading = false;
        this.showMessage(error.error?.message || 'Failed to resend OTP', 'error');
      }
    });
  }

  private redirectBasedOnRole(role: string): void {
    console.log('User logged in with role:', role);
    console.log('Navigating based on role...');
    
    // Role-based navigation
    if (role === 'SYS' || role === 'ADMIN') {
      console.log('Admin user - navigating to admin dashboard');
      this.router.navigate(['/admin-dashboard']);
    } else if (role === 'DEALER') {
      console.log('Dealer user - navigating to dealer dashboard');
      this.router.navigate(['/dealer-dashboard']);
    } else {
      console.log('Regular user - navigating to dashboard');
      this.router.navigate(['/dashboard']);
    }
  }

  private checkLockStatus(): void {
    if (!this.mobileNumber || this.mobileNumber.length < 10) {
      return;
    }

    // Check if user was previously locked and if lock has expired
    if (this.isAccountLocked) {
      console.log('Checking if lock has expired for:', this.mobileNumber);
      
      // Try to send a test OTP to check if account is still locked
      this.authService.sendOTP(this.mobileNumber, this.userName).subscribe({
        next: (response) => {
          // If we can send OTP, account is no longer locked
          console.log('Lock has expired - unlocking account');
          this.isAccountLocked = false;
          this.attemptsRemaining = 3;
          this.showMessage('Account lock has expired. You can try again.', 'success');
          
          this.ngZone.run(() => {
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          // Account is still locked
          console.log('Account still locked');
        }
      });
    }
  }

  private resetForm(): void {
    this.userName = '';
    this.mobileNumber = '';
    this.otp = ['', '', '', '', '', ''];
    this.showOTP = false;
    this.attemptsRemaining = 3;
    this.showResendLink = false;
    this.isAccountLocked = false;
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    // Clear message after 5 seconds for errors, 3 seconds for success
    const timeout = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
      this.message = '';
    }, timeout);
  }
}
