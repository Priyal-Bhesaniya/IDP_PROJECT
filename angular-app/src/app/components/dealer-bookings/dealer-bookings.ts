import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService, BookServiceBooking } from '../../services/order.service';

@Component({
  selector: 'app-dealer-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dealer-bookings.html',
  styleUrls: ['./dealer-bookings.scss']
})
export class DealerBookingsComponent implements OnInit {
  public userName: string = '';
  public userInitials: string = '';
  public bookings: BookServiceBooking[] = [];
  public paidBookings: BookServiceBooking[] = [];
  public loading: boolean = false;
  public error: string = '';
  
  // Filter options
  public statusFilter: string = 'paid'; // Default to paid bookings
  public searchTerm: string = '';
  
  // Dialog properties
  public showViewDialog: boolean = false;
  public selectedBooking: BookServiceBooking | null = null;
  public showApproveDialog: boolean = false;
  public showRejectDialog: boolean = false;
  public rejectionReason: string = '';
  
  // Status options
  public statusOptions = [
    { value: 'paid', label: 'Paid (Pending Approval)', color: '#f59e0b' },
    { value: 'approved', label: 'Approved', color: '#10b981' },
    { value: 'rejected', label: 'Rejected', color: '#ef4444' },
    { value: 'completed', label: 'Completed', color: '#6b7280' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private orderService: OrderService
  ) {
    this.loadUserData();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadBookings();
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

  private loadBookings(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.dealerId) {
      this.error = 'Dealer information not found';
      return;
    }

    this.loading = true;
    this.error = '';

    // Load bookings for this dealer
    this.orderService.getBookingsByDealer(currentUser.dealerId).subscribe({
      next: (bookings) => {
        this.bookings = bookings.sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        
        // Filter paid bookings for approval
        this.paidBookings = this.bookings.filter(booking => booking.status === 'paid');
        
        console.log('Dealer bookings loaded:', this.bookings);
        console.log('Paid bookings for approval:', this.paidBookings);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.error = 'Failed to load bookings';
        this.loading = false;
      }
    });
  }

  public getFilteredBookings(): BookServiceBooking[] {
    let filtered = this.bookings;

    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === this.statusFilter);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.userMobile.toLowerCase().includes(term) ||
        booking.carNumber.toLowerCase().includes(term) ||
        booking.carBrand.toLowerCase().includes(term) ||
        booking.carModel.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  public getStatusColor(status: string): string {
    const statusOption = this.statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : '#6b7280';
  }

  public getStatusLabel(status: string): string {
    const statusOption = this.statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  }

  public viewBooking(booking: BookServiceBooking): void {
    this.selectedBooking = booking;
    this.showViewDialog = true;
  }

  public approveBooking(booking: BookServiceBooking): void {
    this.selectedBooking = booking;
    this.showApproveDialog = true;
  }

  public rejectBooking(booking: BookServiceBooking): void {
    this.selectedBooking = booking;
    this.showRejectDialog = true;
    this.rejectionReason = '';
  }

  public confirmApprove(): void {
    if (!this.selectedBooking) return;

    this.orderService.updateBookingStatus(this.selectedBooking.id!, 'approved').subscribe({
      next: (updatedBooking) => {
        console.log('Booking approved:', updatedBooking);
        
        // Update local array
        const index = this.bookings.findIndex(b => b.id === this.selectedBooking!.id);
        if (index !== -1) {
          this.bookings[index] = updatedBooking;
        }
        
        // Update paid bookings array
        this.paidBookings = this.bookings.filter(booking => booking.status === 'paid');
        
        this.closeApproveDialog();
        alert('Booking approved successfully!');
      },
      error: (error) => {
        console.error('Error approving booking:', error);
        alert('Failed to approve booking. Please try again.');
      }
    });
  }

  public confirmReject(): void {
    if (!this.selectedBooking) return;
    
    if (!this.rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    this.orderService.updateBookingStatus(this.selectedBooking.id!, 'rejected').subscribe({
      next: (updatedBooking) => {
        console.log('Booking rejected:', updatedBooking);
        
        // Update local array
        const index = this.bookings.findIndex(b => b.id === this.selectedBooking!.id);
        if (index !== -1) {
          this.bookings[index] = updatedBooking;
        }
        
        // Update paid bookings array
        this.paidBookings = this.bookings.filter(booking => booking.status === 'paid');
        
        this.closeRejectDialog();
        alert('Booking rejected successfully!');
      },
      error: (error) => {
        console.error('Error rejecting booking:', error);
        alert('Failed to reject booking. Please try again.');
      }
    });
  }

  public markAsCompleted(booking: BookServiceBooking): void {
    if (confirm('Are you sure you want to mark this booking as completed?')) {
      this.orderService.updateBookingStatus(booking.id!, 'completed').subscribe({
        next: (updatedBooking) => {
          console.log('Booking marked as completed:', updatedBooking);
          
          // Update local array
          const index = this.bookings.findIndex(b => b.id === booking.id);
          if (index !== -1) {
            this.bookings[index] = updatedBooking;
          }
          
          alert('Booking marked as completed successfully!');
        },
        error: (error) => {
          console.error('Error updating booking:', error);
          alert('Failed to update booking. Please try again.');
        }
      });
    }
  }

  public closeViewDialog(): void {
    this.showViewDialog = false;
    this.selectedBooking = null;
  }

  public closeApproveDialog(): void {
    this.showApproveDialog = false;
    this.selectedBooking = null;
  }

  public closeRejectDialog(): void {
    this.showRejectDialog = false;
    this.selectedBooking = null;
    this.rejectionReason = '';
  }

  public refreshBookings(): void {
    this.loadBookings();
  }

  public goToDashboard(): void {
    this.router.navigate(['/dealer-dashboard']);
  }

  public goToServices(): void {
    this.router.navigate(['/dealer-all-services']);
  }

  public goToBookRental(): void {
    this.router.navigate(['/dealer-rental']);
  }

  public logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  public getPendingApprovalCount(): number {
    return this.paidBookings.length;
  }
}
