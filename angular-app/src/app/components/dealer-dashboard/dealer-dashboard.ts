import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { OrderService, BookServiceBooking } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { LocalNotificationService } from '../../services/local-notification.service';

interface BookingData {
  id?: number;
  customerId: string;
  customerName: string;
  service: string;
  duration: string;
  price: number;
  carNumber: string;
  serviceStatus: string;
  rentCar: string;
  rentApply: string;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dealer-dashboard.html',
  styleUrls: ['./dealer-dashboard.scss']
})
export class DealerDashboardComponent implements OnInit {
  public userName: string = '';
  public userInitials: string = '';
  public gridData: BookingData[] = [];
  public showDialog: boolean = false;
  public selectedBookings: BookingData[] = [];
  
  // Rental booking properties
  public activeTab: 'services' | 'rentals' = 'services';
  public selectedRentalBookings: any[] = [];
  public loadingRentals: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private localNotificationService: LocalNotificationService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('Dealer dashboard component loaded!');
    this.loadUserData();
  }

  ngOnInit(): void {
    this.loadBookingData();
  }

  private loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.name;
      this.userInitials = this.getInitials(currentUser.name);
    }
  }

  private getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  private loadBookingData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.dealerId) {
      console.error('No dealer ID found for current user');
      return;
    }

    console.log('Current dealer user:', currentUser);
    console.log('Loading bookings for dealer ID:', currentUser.dealerId);
    
    this.orderService.getBookingsByDealer(currentUser.dealerId).subscribe({
      next: (bookings: BookServiceBooking[]) => {
        console.log('Raw bookings loaded for dealer:', bookings);
        console.log('Number of bookings:', bookings.length);
        
        // Log each booking details
        bookings.forEach((booking, index) => {
          console.log(`Booking ${index + 1}:`, {
            id: booking.id,
            userMobile: booking.userMobile,
            dealerId: booking.dealerId,
            serviceStatus: booking.serviceStatus,
            bookingStatus: booking.bookingStatus,
            service: booking.service?.name,
            carNumber: booking.carNumber
          });
        });
        
        this.gridData = this.transformBookingData(bookings);
        console.log('Transformed grid data:', this.gridData);
        console.log('Final grid data length:', this.gridData.length);
        
        // Force change detection to update UI
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading dealer bookings:', error);
        console.error('Error details:', error.status, error.message);
        this.gridData = [];
        
        // Force change detection on error
        this.cdr.detectChanges();
      }
    });
  }

  private transformBookingData(bookings: BookServiceBooking[]): BookingData[] {
    console.log('Transforming bookings - input count:', bookings.length);
    
    // Filter out cancelled bookings
    const activeBookings = bookings.filter(booking => 
      booking.serviceStatus?.toLowerCase() !== 'cancelled'
    );
    
    console.log('After filtering cancelled bookings:', activeBookings.length);
    
    const transformedData = activeBookings.map(booking => ({
      id: booking.id,
      customerId: booking.userMobile || 'Unknown',
      customerName: 'Customer', // We don't have customer name in booking data
      service: booking.service?.name || 'Unknown Service',
      duration: booking.service?.estimatedTime ? `${booking.service.estimatedTime} mins` : 'N/A',
      price: booking.price || 0,
      carNumber: booking.carNumber || 'N/A',
      serviceStatus: booking.serviceStatus || 'Unknown',
      rentCar: '0', // Set to 0 initially
      rentApply: '0'  // Set to 0 initially
    }));
    
    console.log('Final transformed data:', transformedData);
    return transformedData;
  }

  public goToServices(): void {
    this.router.navigate(['/dealer/services']);
  }

  public goToExecutiveCars(): void {
    this.router.navigate(['/dealer-executive-cars']);
  }

  public getServiceStatusClass(status: string): string {
    if (!status) return 'status-unknown';
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'status-pending';
      case 'in progress':
      case 'in-progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'rejected':
        return 'status-rejected';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  public openBookingDialog(booking: BookingData): void {
    // Find all bookings for this customer ID
    this.selectedBookings = this.gridData.filter(item => item.customerId === booking.customerId);
    
    // Reset rental bookings and active tab
    this.selectedRentalBookings = [];
    this.activeTab = 'services';
    this.loadingRentals = false;
    
    this.showDialog = true;
    console.log('Opening dialog for customer:', booking.customerId, 'Bookings found:', this.selectedBookings.length);
  }

  public closeDialog(): void {
    this.showDialog = false;
    this.selectedBookings = [];
  }

  public updateBookingStatus(booking: BookingData, newStatus: string): void {
    if (!booking.id) {
      console.error('Booking ID is required to update status');
      return;
    }

    console.log('Updating booking status:', booking.customerId, 'to', newStatus, 'Booking ID:', booking.id);
    
    // Call the API to update the service status
    this.orderService.updateServiceStatus(booking.id, newStatus).subscribe({
      next: (updatedBooking) => {
        console.log('Booking status updated successfully in backend:', updatedBooking);
        
        // Update the booking in the grid data
        const bookingIndex = this.gridData.findIndex(item => 
          item.id === booking.id
        );
        
        if (bookingIndex !== -1) {
          this.gridData[bookingIndex].serviceStatus = newStatus;
        }
        
        // Update the booking in selected bookings
        const selectedBookingIndex = this.selectedBookings.findIndex(item => 
          item.id === booking.id
        );
        
        if (selectedBookingIndex !== -1) {
          this.selectedBookings[selectedBookingIndex].serviceStatus = newStatus;
        }
        
        // Create immediate local notification for the customer
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.dealerId && booking.id) {
          console.log('Creating immediate local notification for customer:', booking.customerId, 'Status:', newStatus);
          
          // Create local notification immediately (frontend only)
          const localNotification = this.localNotificationService.createBookingStatusNotification(
            booking.customerId,
            booking.id,
            currentUser.dealerId,
            newStatus,
            booking.service
          );
          
          console.log('Local notification created immediately:', localNotification);
          
          // Also try to create backend notification (will use mock if backend not available)
          this.notificationService.createBookingStatusNotification(
            booking.customerId,
            booking.id,
            currentUser.dealerId,
            newStatus,
            booking.service
          ).subscribe({
            next: (notification) => {
              console.log('Backend notification also created:', notification);
            },
            error: (error) => {
              console.log('Backend notification failed, but local notification was created:', error);
            }
          });
        }
        
        // Force change detection
        this.cdr.detectChanges();
        
        console.log('Local data updated successfully');
      },
      error: (error) => {
        console.error('Error updating booking status:', error);
        // Optionally show error message to user
        alert('Failed to update booking status. Please try again.');
      }
    });
  }

  // Tab switching methods
  public switchTab(tab: 'services' | 'rentals'): void {
    this.activeTab = tab;
    if (tab === 'rentals' && this.selectedRentalBookings.length === 0) {
      this.loadRentalBookings();
    }
  }

  // Load rental bookings for the selected customer
  private loadRentalBookings(): void {
    if (this.selectedBookings.length === 0) return;
    
    const customerId = this.selectedBookings[0].customerId;
    this.loadingRentals = true;
    console.log('Loading rental bookings for customer:', customerId);

    this.orderService.getRentalBookingsByCustomer(customerId).subscribe({
      next: (rentalBookings) => {
        console.log('Rental bookings received:', rentalBookings);
        this.selectedRentalBookings = rentalBookings;
        this.loadingRentals = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading rental bookings:', error);
        this.selectedRentalBookings = [];
        this.loadingRentals = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Update rental booking status
  public updateRentalBookingStatus(rental: any, newStatus: string): void {
    if (!rental.id) {
      console.error('Rental booking ID is required to update status');
      return;
    }

    console.log('Updating rental booking status:', rental.id, 'to', newStatus);
    
    this.orderService.updateRentalBookingStatus(rental.id, newStatus).subscribe({
      next: (updatedRental) => {
        console.log('Rental booking status updated successfully:', updatedRental);
        
        // Update the rental booking in the selected rentals
        const rentalIndex = this.selectedRentalBookings.findIndex(item => 
          item.id === rental.id
        );
        
        if (rentalIndex !== -1) {
          this.selectedRentalBookings[rentalIndex].rentalStatus = newStatus;
          this.selectedRentalBookings[rentalIndex].updatedAt = new Date().toISOString();
        }
        
        // Create immediate local notification for the customer
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.dealerId && rental.id) {
          console.log('Creating immediate local notification for rental customer:', rental.customerMobile, 'Status:', newStatus);
          
          // Create local notification immediately (frontend only)
          const localNotification = this.localNotificationService.createBookingStatusNotification(
            rental.customerMobile,
            rental.id,
            currentUser.dealerId,
            newStatus,
            `Rental - ${rental.carCategory} (${rental.carNumber})`
          );
          
          console.log('Local rental notification created immediately:', localNotification);
          
          // Also try to create backend notification (will use mock if backend not available)
          this.notificationService.createBookingStatusNotification(
            rental.customerMobile,
            rental.id,
            currentUser.dealerId,
            newStatus,
            `Rental - ${rental.carCategory} (${rental.carNumber})`
          ).subscribe({
            next: (notification) => {
              console.log('Backend rental notification also created:', notification);
            },
            error: (error) => {
              console.log('Backend rental notification failed, but local notification was created:', error);
            }
          });
        }
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating rental booking status:', error);
        alert('Failed to update rental booking status. Please try again.');
      }
    });
  }

  // Get rental status class for styling
  public getRentalStatusClass(status: string): string {
    if (!status) return 'status-unknown';
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'status-pending';
      case 'active':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  public logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
