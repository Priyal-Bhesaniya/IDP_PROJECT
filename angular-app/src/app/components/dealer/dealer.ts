import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { DealerService, Dealer } from '../../services/dealer.service';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-dealer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dealer.html',
  styleUrls: ['./dealer.scss']
})
export class DealerComponent implements OnInit {
  public userName: string = '';
  public userInitials: string = '';
  public dealer: Dealer | null = null;
  public dealers: Dealer[] = [];
  public selectedDealer: Dealer | null = null;
  public selectedDealerIndex: number = 0;
  public loading: boolean = false;
  public error: string = '';
  
  // Notification properties
  public notifications: Notification[] = [];
  public showNotifications: boolean = false;
  public notificationCount: number = 0;

  // Getter to filter only active dealers
  public get activeDealers(): Dealer[] {
    return this.dealers.filter(dealer => dealer.status === 'Active');
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private dealerService: DealerService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('Dealer component loaded!');
    this.loadUserData();
  }

  ngOnInit(): void {
    this.loadAllDealers();
  }

  private loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.name;
      this.userInitials = this.getInitials(currentUser.name);
    }
  }

  public goToBookRental(): void {
    this.router.navigate(['/book-rental']);
  }

  private getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  public logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  public goToBookService(): void {
    this.router.navigate(['/book-service']);
  }

  private loadAllDealers(): void {
    this.loading = true;
    this.error = '';
    
    this.dealerService.getDealers().subscribe({
      next: (dealers: Dealer[]) => {
        this.dealers = dealers;
        this.loading = false;
        console.log('All dealers loaded:', dealers);
        
        // Now load the specific dealer data after dealers array is populated
        this.loadDealerData();
      },
      error: (err) => {
        this.error = 'Failed to load dealers';
        this.loading = false;
        console.error('Error loading dealers:', err);
      }
    });
  }

  private loadDealerData(): void {
    // Get current dealer from auth service (assuming dealer is logged in)
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.mobileNumber) {
      // Remove +91 prefix if present to match database format (10 digits only)
      const cleanMobileNumber = currentUser.mobileNumber.replace('+91', '').trim();
      console.log('Original mobile:', currentUser.mobileNumber);
      console.log('Clean mobile:', cleanMobileNumber);
      
      this.dealerService.getDealerByMobileNumber(cleanMobileNumber).subscribe({
        next: (dealer: Dealer) => {
          this.dealer = dealer;
          console.log('Dealer data loaded:', dealer);
          // Force immediate UI update
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('Failed to load specific dealer, using first dealer from list as fallback');
          // If specific dealer lookup fails, use the first active dealer from the dealers array
          if (this.activeDealers && this.activeDealers.length > 0) {
            this.dealer = this.activeDealers[0];
            this.selectedDealer = this.activeDealers[0];
            this.selectedDealerIndex = 0;
            console.log('Using fallback active dealer:', this.dealer);
            // Force immediate UI update
            this.cdr.detectChanges();
          } else {
            this.error = 'No dealer information available';
            console.error('Error loading dealer data:', err);
            // Force immediate UI update
            this.cdr.detectChanges();
          }
        }
      });
    } else {
      // If no current user, use first active dealer from list
      if (this.activeDealers && this.activeDealers.length > 0) {
        this.dealer = this.activeDealers[0];
        this.selectedDealer = this.activeDealers[0];
        this.selectedDealerIndex = 0;
        console.log('No current user, using first active dealer:', this.dealer);
        // Force immediate UI update
        this.cdr.detectChanges();
      } else {
        this.error = 'No dealer information available';
        // Force immediate UI update
        this.cdr.detectChanges();
      }
    }
  }

  public selectDealer(dealer: Dealer, index: number): void {
    this.selectedDealer = dealer;
    this.selectedDealerIndex = index;
    this.dealer = dealer; // Also update the dealer property for display
    console.log('Selected dealer:', dealer);
    // Force immediate UI update
    this.cdr.detectChanges();
  }

  public handleImageError(event: any, imageName: string): void {
    console.error('Image failed to load:', imageName);
    console.error('Attempted URL:', event.target.src);
    
    // Try to load fallback image
    event.target.src = '/assets/garage1.png';
    event.target.alt = 'Fallback Image';
  }

  public handleImageLoad(event: any, imageName: string): void {
    console.log('Image loaded successfully:', imageName);
    console.log('Loaded URL:', event.target.src);
  }

  // Notification methods
  public toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  private loadNotifications(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.mobileNumber) {
      console.log('No current user found for notifications');
      return;
    }

    const cleanMobileNumber = currentUser.mobileNumber.replace('+91', '').trim();
    console.log('Loading notifications for user:', cleanMobileNumber);

    this.notificationService.getUserNotifications(cleanMobileNumber).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.updateNotificationCount();
        console.log('Notifications loaded:', notifications.length);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.notifications = [];
        this.notificationCount = 0;
      }
    });
  }

  private updateNotificationCount(): void {
    this.notificationCount = this.notifications.filter(n => !n.read).length;
  }

  public deleteNotification(notificationId: number): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationCount();
        console.log('Notification deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }

  public clearAllNotifications(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.mobileNumber) return;

    const cleanMobileNumber = currentUser.mobileNumber.replace('+91', '').trim();
    
    this.notificationService.clearUserNotifications(cleanMobileNumber).subscribe({
      next: () => {
        this.notifications = [];
        this.notificationCount = 0;
        console.log('All notifications cleared');
      },
      error: (error) => {
        console.error('Error clearing notifications:', error);
      }
    });
  }

  public markNotificationAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: (updatedNotification) => {
        const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex !== -1) {
          this.notifications[notificationIndex] = updatedNotification;
          this.updateNotificationCount();
        }
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  public goToExecutiveCars(): void {
    // Navigate to executive cars component
    console.log('Navigating to Executive Cars');
    // Since we don't have routing set up, let's create a simple navigation approach
    this.router.navigate(['/dealer-executive-cars']);
  }
}
