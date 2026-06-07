import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { OrderService, BookServiceBooking } from '../../services/order.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { LocalNotificationService, LocalNotification } from '../../services/local-notification.service';

export interface ServiceData {
  bookingId: string;
  service: string;
  date: string;
  carNumber: string;
  model: string;
  dealerName: string;
  status: string;
  serviceStatus: string;
  formattedDate?: string;
  createdAt?: string;
}

export interface RentalData {
  bookingId: string;
  carNumber: string;
  carModel: string;
  days: number;
  dealerName: string;
  status: string;
  pricePerDay: number;
  rentalStatus: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  public serviceData: ServiceData[] = [];
  public loading: boolean = false;
  public latestBooking: ServiceData | null = null;
  public cancelling: boolean = false;

  public userName: string = '';
  public userInitials: string = '';
  
  // Notification properties
  public notifications: LocalNotification[] = [];
  public showNotifications: boolean = false;
  public notificationCount: number = 0;

  // Rental booking properties
  public rentalData: RentalData[] = [];
  public loadingRentals: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private localNotificationService: LocalNotificationService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('Dashboard component loaded!');
    this.loadUserData();
  }

  ngOnInit(): void {
    this.loadUserBookings();
    this.loadUserRentals();
    this.detectNotificationsOnLoad();
  }

  private loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Use actual user name from login response
      this.userName = currentUser.name;
      this.userInitials = this.getInitials(currentUser.name);
    }
  }
   goToBookRental(): void {
    this.router.navigate(['/book-rental']);
  }

  private getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  private loadUserBookings(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user from auth service:', currentUser);
    
    if (!currentUser) {
      console.error('User not found - no current user');
      return;
    }
    
    if (!currentUser.mobileNumber) {
      console.error('Mobile number missing from user data:', currentUser);
      return;
    }

    this.loading = true;
    console.log('Loading bookings for user mobile:', currentUser.mobileNumber);
    console.log('API endpoint will be:', `http://localhost:5000/api/booking/user/${currentUser.mobileNumber}`);

    this.orderService.getOrdersByUser(currentUser.mobileNumber).subscribe({
      next: (bookings: BookServiceBooking[]) => {
        console.log('Bookings loaded successfully:', bookings);
        console.log('Number of bookings:', bookings.length);
        
        // Log each booking to check all available fields
        bookings.forEach((booking, index) => {
          console.log(`Booking ${index + 1} - Full Object:`, booking);
          console.log(`Booking ${index + 1} - Key Fields:`, {
            id: booking.id,
            status: booking.status,
            bookingStatus: booking.bookingStatus,
            serviceStatus: booking.serviceStatus,
            paymentStatus: booking.paymentStatus,
            service: booking.service?.name,
            dealer: booking.dealer?.name
          });
        });
        
        this.serviceData = this.transformBookingData(bookings);
        console.log('Transformed service data:', this.serviceData);
        console.log('ServiceData array length:', this.serviceData.length);
        console.log('Loading state set to false');
        this.loading = false;
        
        // Trigger immediate change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error URL:', error.url);
        this.loading = false;
        
        // Trigger change detection on error
        this.cdr.detectChanges();
      }
    });
  }

  private transformBookingData(bookings: BookServiceBooking[]): ServiceData[] {
    const transformedBookings = bookings.map(booking => {
      // Try different status fields to find the correct one
      const mainStatus = booking.status || 'pending';
      const bookingStatusField = booking.bookingStatus || 'Unknown';
      const serviceStatusField = booking.serviceStatus || 'Unknown';
      
      console.log(`Transforming booking ${booking.id} - Status Check:`, {
        mainStatus,
        bookingStatusField,
        serviceStatusField,
        paymentStatus: booking.paymentStatus
      });
      
      return {
        bookingId: `BK${booking.id || '000'}`,
        service: booking.service?.name || 'Unknown Service',
        date: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A',
        carNumber: booking.carNumber || 'N/A',
        model: booking.carModel || 'N/A',
        dealerName: booking.dealer?.name || 'Unknown Dealer',
        status: bookingStatusField, // This is payment status ('paid')
        serviceStatus: this.getServiceStatus(serviceStatusField), // This is service status ('in-progress')
        formattedDate: this.formatDate(booking.createdAt),
        createdAt: booking.createdAt
      };
    });

    // Set latest booking (first one since bookings are ordered by CreatedAt descending)
    this.latestBooking = transformedBookings.length > 0 ? transformedBookings[0] : null;
    
    return transformedBookings;
  }

  private formatDate(dateString?: string): string {
    if (!dateString) return 'Today';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to compare dates only
    const resetTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const resetDate = resetTime(date);
    const resetToday = resetTime(today);
    const resetYesterday = resetTime(yesterday);
    
    if (resetDate.getTime() === resetToday.getTime()) {
      return 'Today';
    } else if (resetDate.getTime() === resetYesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  private getServiceStatus(bookingStatus: string): string {
    switch (bookingStatus.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'In Progress';
      case 'in-progress':
      case 'in progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  }

  public getServiceStatusClass(serviceStatus: string): string {
    switch (serviceStatus.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'in progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'rejected':
        return 'status-rejected';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  public getPaymentStatusClass(paymentStatus: string): string {
    switch (paymentStatus.toLowerCase()) {
      case 'paid':
        return 'payment-paid';
      case 'pending':
        return 'payment-pending';
      case 'failed':
        return 'payment-failed';
      default:
        return 'payment-pending';
    }
  }

  public getRentalStatusClass(rentalStatus: string): string {
    switch (rentalStatus.toLowerCase()) {
      case 'pending':
        return 'rental-pending';
      case 'active':
        return 'rental-active';
      case 'completed':
        return 'rental-completed';
      case 'cancelled':
        return 'rental-cancelled';
      default:
        return 'rental-pending';
    }
  }

  public logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public goToDealer(): void {
    this.router.navigate(['/dealer']);
  }

  public goToBookService(): void {
    this.router.navigate(['/book-service']);
  }

  public cancelService(bookingId: string): void {
    if (!bookingId) {
      console.error('Booking ID is required for cancellation');
      return;
    }

    // Find the booking to check its current status
    const booking = this.serviceData.find(b => b.bookingId === bookingId);
    if (!booking) {
      console.error('Booking not found:', bookingId);
      return;
    }

    // Check if service is still in pending status (can only cancel before dealer approval)
    if (booking.serviceStatus?.toLowerCase() !== 'pending') {
      console.log('Cannot cancel service - not in pending status:', booking.serviceStatus);
      alert('Service can only be cancelled while in pending status. Once approved by dealer, cancellation is not allowed.');
      return;
    }

    // Extract numeric ID from bookingId (e.g., "BK1" -> 1)
    const numericId = bookingId.replace('BK', '');
    
    if (!numericId || isNaN(Number(numericId))) {
      console.error('Invalid booking ID format:', bookingId);
      return;
    }

    this.cancelling = true;
    console.log('Cancelling service for booking:', bookingId);

    this.orderService.updateServiceStatus(Number(numericId), 'cancelled', 'Service cancelled by user').subscribe({
      next: (response) => {
        console.log('Service cancelled successfully:', response);
        this.cancelling = false;
        
        // Trigger change detection before reload
        this.cdr.detectChanges();
        
        // Reload bookings to reflect the change
        this.loadUserBookings();
      },
      error: (error) => {
        console.error('Error cancelling service:', error);
        this.cancelling = false;
        
        // Trigger change detection on error
        this.cdr.detectChanges();
        
        // You could show an error message here using a popup service
        alert('Failed to cancel service. Please try again.');
      }
    });
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

    // Load from local notification service (immediate)
    this.notifications = this.localNotificationService.getUserNotifications(cleanMobileNumber);
    this.updateNotificationCount();
    console.log('Local notifications loaded:', this.notifications.length);

    // Also try to load from backend (will use mock if not available)
    this.notificationService.getUserNotifications(cleanMobileNumber).subscribe({
      next: (backendNotifications) => {
        console.log('Backend notifications also loaded:', backendNotifications.length);
        // You could merge with local notifications if needed
      },
      error: (error) => {
        console.log('Backend notifications not available, using local only:', error);
      }
    });
  }

  private updateNotificationCount(): void {
    this.notificationCount = this.notifications.filter(n => !n.read).length;
  }

  public deleteNotification(notificationId: number): void {
    // Delete from local notification service (immediate)
    const success = this.localNotificationService.deleteNotification(notificationId);
    if (success) {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      this.updateNotificationCount();
      console.log('Local notification deleted successfully');
    }

    // Also try to delete from backend
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        console.log('Backend notification also deleted');
      },
      error: (error) => {
        console.log('Backend notification deletion failed, but local was deleted:', error);
      }
    });
  }

  public clearAllNotifications(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.mobileNumber) return;

    const cleanMobileNumber = currentUser.mobileNumber.replace('+91', '').trim();
    
    // Clear from local notification service (immediate)
    this.localNotificationService.clearUserNotifications(cleanMobileNumber);
    this.notifications = [];
    this.notificationCount = 0;
    console.log('All local notifications cleared');

    // Also try to clear from backend
    this.notificationService.clearUserNotifications(cleanMobileNumber).subscribe({
      next: () => {
        console.log('Backend notifications also cleared');
      },
      error: (error) => {
        console.log('Backend notification clearing failed, but local was cleared:', error);
      }
    });
  }

  public markNotificationAsRead(notificationId: number): void {
    // Mark as read in local notification service (immediate)
    const success = this.localNotificationService.markAsRead(notificationId);
    if (success) {
      const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
      if (notificationIndex !== -1) {
        this.notifications[notificationIndex].read = true;
        this.updateNotificationCount();
      }
      console.log('Local notification marked as read successfully');
    }

    // Also try to mark as read in backend
    this.notificationService.markAsRead(notificationId).subscribe({
      next: (updatedNotification) => {
        console.log('Backend notification also marked as read');
      },
      error: (error) => {
        console.log('Backend notification marking failed, but local was marked:', error);
      }
    });
  }

  // Load user rental bookings
  private loadUserRentals(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.log('No current user found for rental bookings');
      return;
    }

    const userMobile = (currentUser as any).mobileNumber || (currentUser as any).mobile;
    if (!userMobile) {
      console.log('No mobile number found for rental bookings');
      return;
    }

    this.loadingRentals = true;
    console.log('Loading rental bookings for user:', userMobile);

    this.orderService.getRentalBookingsByCustomer(userMobile).subscribe({
      next: (rentalBookings) => {
        console.log('Rental bookings received:', rentalBookings);
        
        // Transform rental bookings to RentalData format
        this.rentalData = rentalBookings.map(booking => ({
          bookingId: `RT${booking.id || '000'}`,
          carNumber: booking.carNumber || 'N/A',
          carModel: booking.carCategory || 'Unknown',
          days: booking.rentalDays || 0,
          dealerName: booking.dealerName || 'Unknown Dealer',
          status: 'Active', // All rentals are considered active for display
          pricePerDay: booking.pricePerDay || 0,
          rentalStatus: booking.rentalStatus || 'Pending'
        }));

        this.loadingRentals = false;
        console.log('Transformed rental data:', this.rentalData);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading rental bookings:', error);
        this.rentalData = [];
        this.loadingRentals = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Detect notifications immediately when page loads
  private detectNotificationsOnLoad(): void {
    console.log('Detecting notifications on page load...');
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.mobileNumber) {
      console.log('No current user found for notification detection');
      return;
    }

    const cleanMobileNumber = currentUser.mobileNumber.replace('+91', '').trim();
    console.log('Detecting notifications for user:', cleanMobileNumber);

    // Load notifications immediately from local storage
    this.notifications = this.localNotificationService.getUserNotifications(cleanMobileNumber);
    this.notificationCount = this.localNotificationService.getUnreadCount(cleanMobileNumber);
    
    console.log('Notifications detected on load:', {
      total: this.notifications.length,
      unread: this.notificationCount,
      notifications: this.notifications
    });

    // Force immediate UI update with ChangeDetectorRef
    this.cdr.detectChanges();
    
    // Subscribe to local notification service for real-time updates
    this.localNotificationService.notifications$.subscribe(notifications => {
      const userNotifications = notifications.filter(n => n.userMobile === cleanMobileNumber);
      this.notifications = userNotifications;
      this.notificationCount = userNotifications.filter(n => !n.read).length;
      
      console.log('Real-time notification update:', {
        total: this.notifications.length,
        unread: this.notificationCount
      });
      
      // Force UI update for real-time changes
      this.cdr.detectChanges();
    });

    console.log('Notification detection setup completed');
  }
}
