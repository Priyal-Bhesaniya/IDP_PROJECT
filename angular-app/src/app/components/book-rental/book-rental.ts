import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DealerService, Dealer } from '../../services/dealer.service';
import { ExecutiveCarService } from '../../services/executive-car.service';
import { OrderService, BookServiceBooking } from '../../services/order.service';

export interface CarData {
  id: number;
  dealerId: number;
  category: string;
  carNumber: string;
  minKm: number;
  extraKm: number;
  maxKm: number;
  gearType: string;
  fuelType: string;
  seats: number;
  pricePerDay: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

@Component({
  selector: 'app-book-rental',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-rental.html',
  styleUrls: ['./book-rental.scss']
})
export class BookRentalComponent implements OnInit {
  viewType: 'grid' | 'list' = 'grid';
  carList: CarData[] = [];
  userName: string = '';
  userInitials: string = '';
  
  // Dealer selection
  public selectedDealer: Dealer | null = null;
  public availableDealers: Dealer[] = [];
  public loading: boolean = false;
  public error: string = '';
  public serviceStatusMessage: string = '';
  public noCarsMessage: string = '';
  public dataLoaded: boolean = false; // Track if initial data is loaded
  public refreshing: boolean = false; // Track if data is being refreshed
  private refreshInterval: any = null; // Store interval reference
  
  // Rental booking dialog properties
  public showRentalDialog: boolean = false;
  public selectedCar: any = null;
  public rentalDays: number = 1;
  public totalAmount: number = 0;
  public paymentMethod: string = '';
  public bankName: string = '';
  public fuelPolicy: string = 'Full Tank to Full Tank';
  public insurancePolicy: string = 'Basic Insurance';
  public agreementAccepted: boolean = false;
  public digitalSignature: string = '';
  public processingPayment: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dealerService: DealerService,
    private executiveCarService: ExecutiveCarService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadUserData();
  }

  ngOnInit(): void {
    this.loadAvailableDealers();
  }

  ngAfterViewInit(): void {
    // Auto-refresh data after component view is initialized
    setTimeout(() => {
      console.log('BookRental - Auto-refreshing data on component load');
      this.loadAvailableDealers();
    }, 500);

    // Set up periodic refresh every 10 seconds to check for status changes
    this.refreshInterval = setInterval(() => {
      console.log('BookRental - Periodic refresh check');
      this.loadAvailableDealers();
    }, 10000);
  }

  ngOnDestroy(): void {
    // Clean up interval when component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.name;
      this.userInitials = this.getInitials(currentUser.name);
    }
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private loadAvailableDealers(): void {
    this.loading = true;
    this.error = '';
    
    // Get current user
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      this.loading = false;
      return;
    }

    // Use the actual customer mobile number - handle both property names
    const userMobile = (currentUser as any).mobileNumber || currentUser.mobile;
    
    // Debug: Show the current user object
    console.log('Current user object:', currentUser);
    console.log('Mobile number from user object:', userMobile);
    
    // If no mobile number, user is new or incomplete - show no dealers
    if (!userMobile) {
      console.log('No mobile number found for current user - showing no dealers');
      this.availableDealers = [];
      this.loading = false;
      this.dataLoaded = true;
      this.cdr.detectChanges();
      return;
    }
    
    console.log('Current user for dealer loading:', currentUser);
    console.log('Using mobile number for dealer loading:', userMobile);
    console.log('API endpoint will be:', `http://localhost:5000/api/booking/user/${userMobile}`);

    // First, get all active dealers
    this.dealerService.getDealers().subscribe({
      next: (allDealers: Dealer[]) => {
        console.log('All dealers loaded:', allDealers);
        
        // Then get customer bookings to find dealers with in-progress services
        this.orderService.getBookingsByUser(userMobile).subscribe({
          next: (bookings: BookServiceBooking[]) => {
            console.log('BookRental - Customer bookings count:', bookings.length);
            console.log('BookRental - Customer bookings:', bookings);
            
            // Debug: Log each booking in detail
            bookings.forEach((booking, index) => {
              console.log(`BookRental - Booking ${index + 1}:`, {
                id: booking.id,
                userMobile: booking.userMobile,
                dealerId: booking.dealerId,
                serviceStatus: booking.serviceStatus,
                bookingStatus: booking.bookingStatus,
                dealer: booking.dealer?.name
              });
            });
            
            // Debug: Log all booking statuses
            console.log('BookRental - All bookings with statuses:', bookings.map(b => ({
              id: b.id,
              dealerId: b.dealerId,
              serviceStatus: b.serviceStatus,
              bookingStatus: b.bookingStatus
            })));
            
            // Find unique dealer IDs with in-progress services
            const inProgressDealerIds = [...new Set(
              bookings
                .filter(booking => {
                  const status = booking.serviceStatus?.toLowerCase();
                  console.log(`Booking ${booking.id} - Dealer ${booking.dealerId} - Status: ${status}`);
                  return status === 'in-progress' || status === 'in progress';
                })
                .map(booking => booking.dealerId)
            )];
            
            console.log('Dealer IDs with in-progress services:', inProgressDealerIds);
            
            // Filter dealers: only show dealers with in-progress services
            this.availableDealers = allDealers.filter(dealer => 
              inProgressDealerIds.includes(dealer.id) && dealer.status === 'Active'
            );
            
            this.loading = false;
            this.refreshing = false; // Reset refreshing flag
            this.dataLoaded = true; // Mark that initial data is loaded
            console.log('Filtered available dealers:', this.availableDealers);
            
            // Auto-select first available dealer if none is selected
            if (this.availableDealers.length > 0 && !this.selectedDealer) {
              this.selectDealer(this.availableDealers[0]);
              // Force immediate UI update
              this.cdr.detectChanges();
            } else if (this.availableDealers.length === 0) {
              // Only set service status message after data is loaded
              this.serviceStatusMessage = 'No service in progress';
              this.cdr.detectChanges();
            }
          },
          error: (err) => {
            console.error('Error loading customer bookings:', err);
            // No fallback - show no dealers when error occurs
            this.availableDealers = [];
            this.loading = false;
            this.refreshing = false; // Reset refreshing flag
            this.dataLoaded = true; // Mark that data loading attempt is complete
            this.serviceStatusMessage = 'Error loading services. Please try again.';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load dealers';
        this.loading = false;
        console.error('Error loading dealers:', err);
      }
    });
  }

  refreshAvailableDealers(): void {
    console.log('Refreshing available dealers...');
    this.refreshing = true;
    this.selectedDealer = null;
    this.serviceStatusMessage = '';
    this.noCarsMessage = '';
    this.carList = [];
    this.loadAvailableDealers();
  }

  selectDealer(dealer: Dealer): void {
    this.selectedDealer = dealer;
    this.noCarsMessage = ''; // Clear no cars message when switching dealers
    console.log('Selected dealer:', dealer);
    // Check customer service status for this dealer
    this.checkCustomerServiceStatus(dealer.id);
  }

  changeDealer(): void {
    this.selectedDealer = null;
    this.carList = [];
    this.serviceStatusMessage = '';
    this.noCarsMessage = ''; // Clear no cars message when changing dealer
    this.cdr.detectChanges();
  }

  checkCustomerServiceStatus(dealerId: number): void {
    console.log('Checking service status for dealer:', dealerId);
    
    // Get current user
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      return;
    }

    // Use the actual customer mobile number - handle both property names
    const userMobile = (currentUser as any).mobileNumber || currentUser.mobile;
    
    // Debug: Show the current user object
    console.log('Current user object:', currentUser);
    console.log('Mobile number from user object:', userMobile);
    
    // If no mobile number, user is new or incomplete - show no dealers
    if (!userMobile) {
      console.log('No mobile number found for current user - showing no dealers');
      this.availableDealers = [];
      this.loading = false;
      this.dataLoaded = true;
      this.cdr.detectChanges();
      return;
    }
    
    console.log('Current user:', currentUser);
    console.log('Using mobile number for bookings:', userMobile);
    console.log('API endpoint will be:', `http://localhost:5000/api/booking/user/${userMobile}`);

    // Check if customer has any approved (in-progress) services with this dealer
    this.orderService.getBookingsByUser(userMobile).subscribe({
      next: (bookings: BookServiceBooking[]) => {
        console.log(`BookRental - Checking service status for dealer ${dealerId}`);
        console.log(`BookRental - Customer bookings count:`, bookings.length);
        console.log(`BookRental - Customer bookings:`, bookings);
        
        // Debug: Log each booking in detail for this dealer check
        bookings.forEach((booking, index) => {
          console.log(`BookRental - Service Check Booking ${index + 1}:`, {
            id: booking.id,
            userMobile: booking.userMobile,
            dealerId: booking.dealerId,
            serviceStatus: booking.serviceStatus,
            bookingStatus: booking.bookingStatus,
            dealer: booking.dealer?.name
          });
        });
        
        // Debug: Log all booking statuses for this dealer
        console.log(`BookRental - Bookings for dealer ${dealerId}:`, bookings.map(b => ({
          id: b.id,
          dealerId: b.dealerId,
          serviceStatus: b.serviceStatus,
          bookingStatus: b.bookingStatus
        })));
        
        // Filter bookings for the selected dealer with in-progress service status
        const inProgressBookings = bookings.filter(booking => {
          const isMatchingDealer = booking.dealerId === dealerId;
          const status = booking.serviceStatus?.toLowerCase();
          const isInProgress = status === 'in-progress' || status === 'in progress';
          console.log(`Booking ${booking.id} - Dealer ${booking.dealerId} - Status: ${status} - Matching: ${isMatchingDealer && isInProgress}`);
          return isMatchingDealer && isInProgress;
        });
        
        console.log('Dealer bookings with in-progress (approved) status:', inProgressBookings);
        
        if (inProgressBookings.length > 0) {
          // Customer has approved (in-progress) service with this dealer - allow rental
          this.serviceStatusMessage = '';
          // Load executive cars for this dealer
          this.loadDealerExecutiveCars(dealerId);
        } else {
          // No approved service with this dealer - block rental
          this.serviceStatusMessage = 'No service in progress';
          this.carList = []; // Clear car list
          this.noCarsMessage = ''; // Clear no cars message when service not in progress
        }
        
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error checking service status:', error);
        // Show error message when service status check fails
        this.serviceStatusMessage = 'Error checking service status. Please try again.';
        this.carList = [];
        this.noCarsMessage = ''; // Clear no cars message when error occurs
        this.cdr.detectChanges();
      }
    });
  }

  loadDealerExecutiveCars(dealerId: number): void {
    console.log('Loading executive cars for dealer:', dealerId);
    
    this.executiveCarService.getExecutiveCarsByDealer(dealerId).subscribe({
      next: (cars) => {
        this.carList = cars;
        
        // Check if dealer has no cars
        if (cars.length === 0) {
          this.noCarsMessage = 'No car provided by them';
          console.log('No cars found for dealer, showing message:', this.noCarsMessage);
          this.cdr.detectChanges(); // Immediate UI update for no cars message
        } else {
          this.noCarsMessage = '';
          console.log('Cars found for dealer, clearing no cars message');
        }
        
        this.cdr.detectChanges();
        console.log('Executive cars loaded:', this.carList);
      },
      error: (error) => {
        console.error('Error loading executive cars:', error);
        this.carList = [];
        this.noCarsMessage = '';
        this.cdr.detectChanges();
      }
    });
  }

  private loadMockCars(): void {
    // Mock car data for demonstration
    this.carList = [
      {
        id: 1,
        dealerId: 1,
        category: 'Sedan',
        carNumber: 'MH-01-AB-1234',
        minKm: 100,
        extraKm: 10,
        maxKm: 500,
        gearType: 'Manual',
        fuelType: 'Petrol',
        seats: 5,
        pricePerDay: 1500,
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        dealerId: 1,
        category: 'SUV',
        carNumber: 'MH-02-CD-5678',
        minKm: 150,
        extraKm: 15,
        maxKm: 600,
        gearType: 'Automatic',
        fuelType: 'Diesel',
        seats: 7,
        pricePerDay: 2500,
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        dealerId: 1,
        category: 'Hatchback',
        carNumber: 'MH-03-EF-9012',
        minKm: 80,
        extraKm: 8,
        maxKm: 400,
        gearType: 'Manual',
        fuelType: 'Petrol',
        seats: 4,
        pricePerDay: 1200,
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        dealerId: 1,
        category: 'Luxury',
        carNumber: 'MH-04-GH-3456',
        minKm: 200,
        extraKm: 20,
        maxKm: 800,
        gearType: 'Automatic',
        fuelType: 'Petrol',
        seats: 5,
        pricePerDay: 5000,
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 5,
        dealerId: 1,
        category: 'Compact',
        carNumber: 'MH-05-IJ-7890',
        minKm: 50,
        extraKm: 5,
        maxKm: 300,
        gearType: 'Manual',
        fuelType: 'CNG',
        seats: 4,
        pricePerDay: 800,
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  public goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  public goToBookService(): void {
    this.router.navigate(['/book-service']);
  }

  public goToDealer(): void {
    this.router.navigate(['/dealer']);
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public bookCar(car: CarData): void {
    console.log('Booking car:', car);
    this.openRentalDialog(car);
  }

  // Rental booking dialog methods
  openRentalDialog(car: any): void {
    this.selectedCar = car;
    this.rentalDays = 1;
    this.calculateTotalAmount();
    this.paymentMethod = '';
    this.bankName = '';
    this.fuelPolicy = 'Full Tank to Full Tank';
    this.insurancePolicy = 'Basic Insurance';
    this.agreementAccepted = false;
    this.digitalSignature = '';
    this.showRentalDialog = true;
  }

  closeRentalDialog(): void {
    this.showRentalDialog = false;
    this.selectedCar = null;
  }

  calculateTotalAmount(): void {
    if (this.selectedCar) {
      this.totalAmount = this.selectedCar.pricePerDay * this.rentalDays;
    }
  }

  onRentalDaysChange(): void {
    this.calculateTotalAmount();
  }

  async processRentalBooking(): Promise<void> {
    if (!this.agreementAccepted || !this.digitalSignature || !this.paymentMethod) {
      alert('Please accept the agreement and provide signature and payment details');
      return;
    }

    this.processingPayment = true;

    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not logged in');
      }

      const rentalBooking = {
        customerMobile: (currentUser as any).mobileNumber || currentUser.mobile,
        customerId: currentUser.id,
        customerName: currentUser.name,
        dealerId: this.selectedDealer?.id,
        dealerName: this.selectedDealer?.name,
        executiveCarId: this.selectedCar.id,
        carCategory: this.selectedCar.category,
        carNumber: this.selectedCar.carNumber,
        minKm: this.selectedCar.minKm,
        extraKm: this.selectedCar.extraKm,
        maxKm: this.selectedCar.maxKm,
        gearType: this.selectedCar.gearType,
        fuelType: this.selectedCar.fuelType,
        seats: this.selectedCar.seats,
        pricePerDay: this.selectedCar.pricePerDay,
        rentalDays: this.rentalDays,
        totalAmount: this.totalAmount,
        paymentMethod: this.paymentMethod,
        paymentMethodType: this.paymentMethod === 'netbanking' ? 'netbanking' : 'upi',
        bankName: this.bankName,
        paymentStatus: 'Completed',
        rentalStatus: 'Pending',
        fuelPolicy: this.fuelPolicy,
        insurancePolicy: this.insurancePolicy,
        agreementAccepted: this.agreementAccepted,
        digitalSignature: this.digitalSignature,
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
      };

      // Call backend API to create rental booking
      const response = await fetch('http://localhost:5000/api/rentalbooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rentalBooking)
      });

      if (!response.ok) {
        throw new Error('Failed to create rental booking');
      }

      const result = await response.json();
      console.log('Rental booking created:', result);

      alert('Rental booking successful! Your booking ID: ' + result.id);
      this.closeRentalDialog();
      
      // Refresh the car list
      this.loadDealerExecutiveCars(this.selectedDealer!.id);

    } catch (error) {
      console.error('Error processing rental booking:', error);
      alert('Failed to process rental booking. Please try again.');
    } finally {
      this.processingPayment = false;
    }
  }
}
