import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { DealerService, Dealer } from '../../services/dealer.service';
import { ServiceService, ServiceData } from '../../services/service.service';
import { OrderService, BookServiceBooking, VehicleDetails, CreateBookingRequest, CreateBookingResponse } from '../../services/order.service';
import { PaymentService, PaymentRequest, PaymentDetails } from '../../services/payment.service';
import { PopupService } from '../../services/popup.service';
import { PopupComponent } from '../popup/popup.component';

interface CartItem {
  id: string;
  service: ServiceItem;
  vehicle: any;
  dealer: Dealer;
  totalPrice: number;
  addedAt: Date;
  vehicleDetails?: VehicleDetails;
  booking?: BookServiceBooking;
}

interface ServiceItem {
  id: number;
  name: string;
  estimatedTime: string;
  icon: string;
  category: string;
  dealerServiceVehicles?: any[];
}

@Component({
  selector: 'app-book-service',
  imports: [CommonModule, FormsModule, PopupComponent],
  templateUrl: './book-service.html',
  styleUrl: './book-service.scss',
})
export class BookService implements OnInit {
  
  activeTab: string = 'car';
  selectedService: ServiceItem | null = null;
  selectedBrand: string | null = null;
  searchTerm: string = '';
  
  public userName: string = '';
  public userInitials: string = '';
  
  // Dealer selection
  public selectedDealer: Dealer | null = null;
  public availableDealers: Dealer[] = [];
  public loading: boolean = false;
  public error: string = '';
  
  services: ServiceItem[] = [];
  
  // Dynamic brands data - will be loaded from backend
  allBrands: string[] = [];
  filteredBrands: string[] = [];
  
  // Model search functionality
  modelSearchTerm: string = '';
  filteredServiceVehicles: any[] = [];
  
  filteredServices: ServiceItem[] = [];
  serviceVehicles: any[] = [];
  selectedVehicle: any = null;
  
  // Cart functionality
  cartItems: CartItem[] = [];
  canAddToCart: boolean = false;
  showAddToCartSection: boolean = false;
  
  // Checkout functionality
  showCheckoutForm: boolean = false;
  currentCheckoutItem: CartItem | null = null;
  vehicleForm: VehicleDetails = {
    carNumber: '',
    carModel: '',
    carBrand: '',
    year: new Date().getFullYear(),
    color: '',
    additionalNotes: ''
  };
  
  // Payment functionality
  showPaymentForm: boolean = false;
  paymentProcessing: boolean = false;
  paymentForm: PaymentDetails = {
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    paymentMethod: 'card',
    upiId: '',
    bankName: ''
  };
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private dealerService: DealerService,
    private serviceService: ServiceService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private popupService: PopupService,
    public cdr: ChangeDetectorRef
  ) {
    console.log('Book Service component loaded!');
    this.loadUserData();
  }
  
  private loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Use actual user name from login response
      this.userName = currentUser.name;
      this.userInitials = this.getInitials(currentUser.name);
    }
  }

  private getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadAvailableDealers();
    this.filterServices();
    this.filterBrands();
  }
  
  private loadAvailableDealers(): void {
    this.loading = true;
    this.error = '';
    
    this.dealerService.getDealers().subscribe({
      next: (dealers: Dealer[]) => {
        this.availableDealers = dealers.filter(dealer => dealer.status === 'Active');
        this.loading = false;
        console.log('Available dealers loaded:', this.availableDealers);
        
        // Auto-select first dealer if none is selected
        if (this.availableDealers.length > 0 && !this.selectedDealer) {
          this.selectDealer(this.availableDealers[0]);
          // Force immediate UI update
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.error = 'Failed to load dealers';
        this.loading = false;
        console.error('Error loading dealers:', err);
      }
    });
  }

  selectDealer(dealer: Dealer): void {
    this.selectedDealer = dealer;
    console.log('Selected dealer:', dealer);
    // Load services specific to this dealer
    this.loadDealerServices(dealer.id);
  }

  changeDealer(): void {
    this.selectedDealer = null;
    this.selectedService = null;
    this.selectedBrand = null;
    this.services = [];
    this.filteredServices = [];
    // Force immediate UI update
    this.cdr.detectChanges();
  }

  loadDealerServices(dealerId: number): void {
    console.log('Loading services for dealer:', dealerId);
    
    // Call backend API to get dealer-specific services
    this.serviceService.getServicesByDealer(dealerId).subscribe({
      next: (services: ServiceData[]) => {
        console.log('=== DEBUG: Backend Services ===');
        console.log('Total services from backend:', services.length);
        console.log('Backend services:', services);
        
        // Convert ServiceData to ServiceItem format and filter by status
        const activeServices = services.filter(service => service.status === 'Active');
        console.log('Active services after filtering:', activeServices.length);
        
        this.services = activeServices.map(service => this.convertServiceDataToServiceItem(service));
        
        console.log('=== DEBUG: Converted Services ===');
        console.log('Total converted services:', this.services.length);
        console.log('Converted services:', this.services);
        
        // Reset selected items and filter services
        this.selectedService = null;
        this.selectedBrand = null;
        this.filterServices();
        
        console.log('=== DEBUG: Filtered Services ===');
        console.log('Active tab:', this.activeTab);
        console.log('Total filtered services:', this.filteredServices.length);
        console.log('Filtered services:', this.filteredServices);
        
        // Force immediate UI update
        this.cdr.detectChanges();
        
        console.log('=== DEBUG: Final UI State ===');
        console.log('Selected dealer ID:', this.selectedDealer?.id);
        console.log('Total services available:', this.services.length);
        console.log('Filtered services for display:', this.filteredServices.length);
      },
      error: (err) => {
        console.error('Error loading services for dealer:', err);
        // Fallback to empty services array
        this.services = [];
        this.filteredServices = [];
        this.cdr.detectChanges();
      }
    });
  }

  private convertServiceDataToServiceItem(service: ServiceData): ServiceItem {
    // Map service categories to icons and determine category
    const category = this.getServiceCategory(service.name);
    const icon = this.getServiceIcon(service.name);
    
    console.log(`=== DEBUG: Converting Service ID ${service.id} ===`);
    console.log('Service name:', service.name);
    console.log('Service status:', service.status);
    console.log('Estimated time:', service.estimatedTime);
    console.log('Dealer ID:', service.dealerId);
    console.log('Assigned category:', category);
    console.log('Assigned icon:', icon);
    
    return {
      id: service.id,
      name: service.name,
      estimatedTime: service.estimatedTime,
      icon: icon,
      category: category
    };
  }

  private getServiceCategory(serviceName: string): string {
    const name = serviceName.toLowerCase();
    if (name.includes('oil') || name.includes('service') || name.includes('brake') || name.includes('wheel')) {
      return 'car';
    } else if (name.includes('ac') || name.includes('air')) {
      return 'ac';
    } else if (name.includes('battery')) {
      return 'batteries';
    } else if (name.includes('tyre') || name.includes('tire')) {
      return 'tyres';
    } else if (name.includes('dent') || name.includes('paint')) {
      return 'dent';
    }
    return 'car'; // Default category
  }

  private getServiceIcon(serviceName: string): string {
    const name = serviceName.toLowerCase();
    if (name.includes('oil') || name.includes('service')) return '⚙️';
    if (name.includes('brake')) return '🔧';
    if (name.includes('wheel')) return '⭕';
    if (name.includes('ac') || name.includes('air')) return '❄️';
    if (name.includes('filter')) return '🌬️';
    if (name.includes('compressor')) return '⚡';
    if (name.includes('battery')) return '🔋';
    if (name.includes('tyre') || name.includes('tire')) return '🛞';
    if (name.includes('rotation')) return '🔄';
    if (name.includes('dent')) return '🎨';
    if (name.includes('paint')) return '🖌️';
    return '⚙️'; // Default icon
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
    this.selectedService = null;
    this.selectedBrand = null;
    this.filterServices();
  }

  selectService(service: ServiceItem): void {
    console.log('=== DEBUG: selectService called ===');
    console.log('Selected service:', service);
    console.log('Service ID:', service.id);
    
    // Don't auto-select, just set the selected service
    this.selectedService = service;
    this.selectedBrand = null;
    this.selectedVehicle = null;
    this.canAddToCart = false; // Reset Add to Cart button
    this.filterBrands();
    
    // Load vehicles for this specific service
    console.log('=== DEBUG: About to load vehicles ===');
    this.loadServiceVehicles(service.id);
    this.cdr.detectChanges(); // Force UI update
    
    console.log('=== DEBUG: selectService completed ===');
    console.log('Current state - Service:', this.selectedService?.name);
    console.log('Current state - Brands available:', this.allBrands.length);
  }

  selectBrand(brand: string): void {
    this.selectedBrand = brand;
    this.canAddToCart = false; // Reset Add to Cart button when brand changes
    // Load vehicles for this brand from the selected service
    this.loadBrandVehicles(brand);
    this.cdr.detectChanges(); // Force UI update
  }

  selectVehicle(vehicle: any): void {
    this.selectedVehicle = vehicle;
    this.canAddToCart = true; // Enable Add to Cart button
    console.log('Selected vehicle:', vehicle);
    this.cdr.detectChanges(); // Force UI update
    // Here you can proceed to booking confirmation
  }

  backToBrands(): void {
    this.selectedBrand = null;
    this.selectedVehicle = null;
    this.canAddToCart = false; // Reset Add to Cart button
    this.modelSearchTerm = '';
    this.filteredServiceVehicles = [];
    this.cdr.detectChanges(); // Force UI update
  }

  filterModels(): void {
    if (this.modelSearchTerm) {
      this.filteredServiceVehicles = this.serviceVehicles.filter(vehicle => 
        vehicle.type.toLowerCase().includes(this.modelSearchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(this.modelSearchTerm.toLowerCase())
      );
    } else {
      this.filteredServiceVehicles = [...this.serviceVehicles];
    }
    this.cdr.detectChanges(); // Force UI update
  }

  addToCart(): void {
    if (this.selectedVehicle && this.selectedService && this.selectedDealer) {
      const cartItem: CartItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID for each cart item
        service: this.selectedService,
        vehicle: this.selectedVehicle,
        dealer: this.selectedDealer,
        totalPrice: this.selectedVehicle.price,
        addedAt: new Date()
      };
      
      this.cartItems.push(cartItem);
      console.log('Added to cart:', cartItem);
      
      // Clear selections after adding to cart
      this.selectedService = null;
      this.selectedBrand = null;
      this.selectedVehicle = null;
      this.canAddToCart = false; // Reset Add to Cart button
      this.cdr.detectChanges();
    }
  }

  removeFromCart(itemId: any): void {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
    this.cdr.detectChanges();
  }

  clearCart(): void {
    this.cartItems = [];
    this.cdr.detectChanges();
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  checkout(): void {
    console.log('=== CHECKOUT BUTTON CLICKED ===');
    console.log('Cart items:', this.cartItems);
    console.log('Cart length:', this.cartItems.length);
    
    if (this.cartItems.length === 0) {
      this.popupService.showWarning('Cart Empty', 'Your cart is empty!');
      return;
    }
    
    // Start checkout process with first item
    this.currentCheckoutItem = this.cartItems[0];
    console.log('Current checkout item set to:', this.currentCheckoutItem);
    
    // Set dialog visibility IMMEDIATELY
    this.showCheckoutForm = true;
    console.log('showCheckoutForm set to:', this.showCheckoutForm);
    
    // Pre-fill vehicle form with selected vehicle details
    if (this.currentCheckoutItem) {
      this.vehicleForm.carModel = this.currentCheckoutItem.vehicle.type;
      this.vehicleForm.carBrand = this.currentCheckoutItem.vehicle.brand;
      console.log('Vehicle form pre-filled:', this.vehicleForm);
    }
    
    console.log('About to trigger change detection...');
    
    // Force immediate change detection
    this.cdr.detectChanges();
    
    // Additional immediate check
    setTimeout(() => {
      console.log('Immediate check - showCheckoutForm:', this.showCheckoutForm);
      console.log('Dialog should be visible now!');
    }, 0);
  }

  // Vehicle form methods
  submitVehicleDetails(): void {
    if (!this.vehicleForm.carNumber || !this.vehicleForm.carModel) {
      this.popupService.showError('Missing Information', 'Please fill in all required vehicle details');
      return;
    }
    
    if (this.currentCheckoutItem) {
      this.currentCheckoutItem.vehicleDetails = { ...this.vehicleForm };
      console.log('Vehicle details saved:', this.vehicleForm);
      
      // Proceed to payment
      this.showCheckoutForm = false;
      this.showPaymentForm = true;
      this.cdr.detectChanges();
    }
  }

  cancelCheckout(): void {
    this.showCheckoutForm = false;
    this.currentCheckoutItem = null;
    this.resetVehicleForm();
    this.cdr.detectChanges();
  }

  private resetVehicleForm(): void {
    this.vehicleForm = {
      carNumber: '',
      carModel: '',
      carBrand: '',
      year: new Date().getFullYear(),
      color: '',
      additionalNotes: ''
    };
  }

  // Payment methods
  processPayment(): void {
    if (!this.currentCheckoutItem) {
      this.popupService.showError('Checkout Error', 'Checkout item is missing');
      return;
    }

    // Validate based on payment method
    const paymentMethod = this.paymentForm.paymentMethod;
    let isValid = true;
    let errorMessage = '';

    switch (paymentMethod) {
      case 'card':
        if (!this.paymentForm.cardName || !this.paymentForm.cardNumber || 
            !this.paymentForm.cardExpiry || !this.paymentForm.cardCvv) {
          errorMessage = 'Please fill in all card payment details';
          isValid = false;
        }
        break;
      case 'upi':
        if (!this.paymentForm.upiId) {
          errorMessage = 'Please enter your UPI ID';
          isValid = false;
        }
        break;
      case 'netbanking':
        if (!this.paymentForm.bankName) {
          errorMessage = 'Please select a bank';
          isValid = false;
        }
        break;
      default:
        errorMessage = 'Please select a payment method';
        isValid = false;
        break;
    }

    if (!isValid) {
      this.popupService.showError('Validation Error', errorMessage);
      return;
    }
    
    this.paymentProcessing = true;
    
    // Create order first
    this.createOrder();
  }

  private createOrder(): void {
    if (!this.currentCheckoutItem || !this.currentCheckoutItem.vehicleDetails) {
      this.popupService.showError('Missing Information', 'Vehicle details are missing');
      return;
    }
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.mobileNumber) {
      this.popupService.showError('User Error', 'User information is missing');
      return;
    }
    
    // Force payment method detection based on filled fields
    let actualPaymentMethod = 'card'; // default
    
    // Check if bank name is filled (Net Banking selected) - HIGHEST PRIORITY
    if (this.paymentForm.bankName && this.paymentForm.bankName.trim() !== '') {
      actualPaymentMethod = 'netbanking';
      console.log('Detected Net Banking from bankName:', this.paymentForm.bankName);
    }
    // Check if UPI ID is filled (UPI selected) - MEDIUM PRIORITY
    else if (this.paymentForm.upiId && this.paymentForm.upiId.trim() !== '') {
      actualPaymentMethod = 'upi';
      console.log('Detected UPI from upiId:', this.paymentForm.upiId);
    }
    // Check if card details are filled (Card selected) - LOWEST PRIORITY
    else if (this.paymentForm.cardName && this.paymentForm.cardName.trim() !== '') {
      actualPaymentMethod = 'card';
      console.log('Detected Card from cardName:', this.paymentForm.cardName);
    }
    
    // ALSO update the paymentForm to match detected method
    this.paymentForm.paymentMethod = actualPaymentMethod as 'card' | 'upi' | 'netbanking';
    
    console.log('Final detected payment method:', actualPaymentMethod);

    const bookingRequest: CreateBookingRequest = {
      userMobile: currentUser.mobileNumber,
      dealerId: this.currentCheckoutItem.dealer.id,
      serviceId: this.currentCheckoutItem.service.id,
      brandId: this.currentCheckoutItem.vehicle.id, // Using vehicle ID as brand ID for now
      vehicleId: this.currentCheckoutItem.vehicle.id,
      carNumber: this.currentCheckoutItem.vehicleDetails.carNumber,
      carModel: this.currentCheckoutItem.vehicleDetails.carModel,
      carBrand: this.currentCheckoutItem.vehicleDetails.carBrand,
      carYear: this.currentCheckoutItem.vehicleDetails.year,
      carColor: this.currentCheckoutItem.vehicleDetails.color,
      additionalNotes: this.currentCheckoutItem.vehicleDetails.additionalNotes,
      price: this.currentCheckoutItem.totalPrice,
      // Add payment method details with CORRECT payment method
      PaymentMethod: actualPaymentMethod,
      PaymentMethodType: actualPaymentMethod,
      // Card details if card payment
      CardName: actualPaymentMethod === 'card' ? this.paymentForm.cardName : undefined,
      CardNumber: actualPaymentMethod === 'card' ? this.paymentForm.cardNumber : undefined,
      CardExpiry: actualPaymentMethod === 'card' ? this.paymentForm.cardExpiry : undefined,
      CardCvv: actualPaymentMethod === 'card' ? this.paymentForm.cardCvv : undefined,
      // UPI details if UPI payment
      UpiId: actualPaymentMethod === 'upi' ? this.paymentForm.upiId : undefined,
      // Net Banking details if Net Banking
      BankName: actualPaymentMethod === 'netbanking' ? this.paymentForm.bankName : undefined
    };
    
    console.log('Payment form state:', this.paymentForm);
    console.log('Creating booking:', bookingRequest);
    
    this.orderService.createOrder(bookingRequest).subscribe({
      next: (response: CreateBookingResponse) => {
        console.log('Booking created successfully:', response);
        
        // Extract booking from response structure
        const booking = response.booking;
        
        if (this.currentCheckoutItem) {
          this.currentCheckoutItem.booking = booking;
        }
        
        // Process payment
        if (booking && booking.id) {
          this.processPaymentForOrder(booking.id);
        } else {
          console.error('Booking ID is missing');
          this.paymentProcessing = false;
          this.popupService.showError('Booking Error', 'Booking created but ID is missing. Please contact support.');
        }
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.paymentProcessing = false;
        this.popupService.showError('Order Error', 'Failed to create order. Please try again.');
      }
    });
  }

  private processPaymentForOrder(orderId: number): void {
    const paymentRequest: PaymentRequest = {
      orderId: orderId,
      amount: this.currentCheckoutItem!.totalPrice,
      paymentMethod: this.paymentForm.paymentMethod || 'card',
      paymentDetails: this.paymentForm
    };
    
    console.log('Processing payment:', paymentRequest);
    
    // For now, use simulated payment
    this.paymentService.simulatePayment(orderId, this.currentCheckoutItem!.totalPrice).subscribe({
      next: (paymentResponse) => {
        console.log('Payment successful:', paymentResponse);
        
        // Update order status to paid
        this.updateOrderStatusToPaid(orderId, paymentResponse.paymentId);
      },
      error: (error) => {
        console.error('Payment failed:', error);
        this.paymentProcessing = false;
        this.popupService.showError('Payment Error', 'Payment failed. Please try again.');
      }
    });
  }

  private updateOrderStatusToPaid(orderId: number, paymentId: string): void {
    this.orderService.updateOrderStatus(orderId, 'paid', paymentId).subscribe({
      next: (updatedOrder) => {
        console.log('Order status updated to paid:', updatedOrder);
        this.paymentProcessing = false;
        
        // Show success message and complete checkout
        this.popupService.showSuccess('Payment Successful', 'Payment successful! Your booking has been confirmed and is now pending dealer approval.');
        
        // Remove item from cart and continue with next item or finish
        this.completeCurrentItemCheckout();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.paymentProcessing = false;
        this.popupService.showError('Order Update Error', 'Payment processed but there was an issue updating your order. Please contact support.');
      }
    });
  }

  private completeCurrentItemCheckout(): void {
    if (this.currentCheckoutItem) {
      // Remove the processed item from cart
      this.cartItems = this.cartItems.filter(item => item.id !== this.currentCheckoutItem!.id);
      
      // Reset forms
      this.showPaymentForm = false;
      this.currentCheckoutItem = null;
      this.resetVehicleForm();
      this.resetPaymentForm();
      
      // If there are more items in cart, start next checkout
      if (this.cartItems.length > 0) {
        setTimeout(() => {
          this.checkout(); // Start next checkout
        }, 1000);
      }
      
      this.cdr.detectChanges();
    }
  }

  private resetPaymentForm(): void {
    this.paymentForm = {
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      paymentMethod: 'card',
      upiId: '',
      bankName: ''
    };
  }

  // Handle payment method changes
  onPaymentMethodChange(): void {
    console.log('Payment method changed to:', this.paymentForm.paymentMethod);
    // Clear other payment method fields when switching
    switch (this.paymentForm.paymentMethod) {
      case 'card':
        this.paymentForm.upiId = '';
        this.paymentForm.bankName = '';
        break;
      case 'upi':
        this.paymentForm.cardName = '';
        this.paymentForm.cardNumber = '';
        this.paymentForm.cardExpiry = '';
        this.paymentForm.cardCvv = '';
        this.paymentForm.bankName = '';
        break;
      case 'netbanking':
        this.paymentForm.cardName = '';
        this.paymentForm.cardNumber = '';
        this.paymentForm.cardExpiry = '';
        this.paymentForm.cardCvv = '';
        this.paymentForm.upiId = '';
        break;
    }
  }

  cancelPayment(): void {
    this.showPaymentForm = false;
    this.paymentProcessing = false;
    this.currentCheckoutItem = null;
    this.resetPaymentForm();
    this.cdr.detectChanges();
  }

  private loadBrandVehicles(brand: string): void {
    console.log('Loading vehicles for brand:', brand);
    
    // Filter vehicles by the selected brand from the service vehicles
    if (this.serviceVehicles.length > 0) {
      const brandVehicles = this.serviceVehicles.filter(vehicle => vehicle.brand === brand);
      this.filteredServiceVehicles = brandVehicles;
      console.log('Filtered vehicles for brand:', this.filteredServiceVehicles);
    } else {
      // If no vehicles loaded yet, load them from backend
      this.loadServiceVehicles(this.selectedService?.id || 0);
    }
    
    this.cdr.detectChanges();
  }

  private loadServiceVehicles(serviceId: number): void {
    console.log('=== DEBUG: Loading vehicles for service ===');
    console.log('Service ID:', serviceId);
    console.log('Selected Dealer ID:', this.selectedDealer?.id);
    
    // Load vehicles directly from the backend API for this service
    this.serviceService.getServicesByDealer(this.selectedDealer?.id || 0).subscribe({
      next: (services: ServiceData[]) => {
        console.log('=== DEBUG: Services received from API ===');
        console.log('Total services:', services.length);
        console.log('Services data:', services);
        
        const selectedServiceData = services.find(s => s.id === serviceId);
        console.log('=== DEBUG: Selected service data ===');
        console.log('Found service:', selectedServiceData);
        
        if (selectedServiceData) {
          console.log('Service dealerServiceVehicles:', selectedServiceData.dealerServiceVehicles);
          
          if (selectedServiceData.dealerServiceVehicles && selectedServiceData.dealerServiceVehicles.length > 0) {
            this.serviceVehicles = selectedServiceData.dealerServiceVehicles.map((dsv: any) => ({
              id: dsv.vehicle.id,
              brand: dsv.vehicle.brand,
              type: dsv.vehicle.type,
              price: dsv.price
            }));
            
            // Extract unique brands from vehicles
            this.allBrands = [...new Set(this.serviceVehicles.map(vehicle => vehicle.brand))];
            this.filteredBrands = [...this.allBrands];
            
            console.log('=== DEBUG: Successfully loaded vehicles ===');
            console.log('Service vehicles:', this.serviceVehicles);
            console.log('Available brands:', this.allBrands);
            console.log('Filtered brands:', this.filteredBrands);
          } else {
            console.log('=== DEBUG: No dealerServiceVehicles found ===');
            this.serviceVehicles = [];
            this.allBrands = [];
            this.filteredBrands = [];
          }
        } else {
          console.log('=== DEBUG: Service not found in API response ===');
          this.serviceVehicles = [];
          this.allBrands = [];
          this.filteredBrands = [];
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('=== DEBUG: Error loading vehicles for service ===');
        console.error('Error details:', err);
        this.serviceVehicles = [];
        this.allBrands = [];
        this.filteredBrands = [];
        this.cdr.detectChanges();
      }
    });
  }
  
  filterServices(): void {
    console.log(`=== DEBUG: Displaying All Services for Dealer ===`);
    console.log('Total services from backend:', this.services.length);
    
    // Display ALL services without category filtering
    this.filteredServices = [...this.services];
    
    console.log('All services for display:', this.filteredServices.length);
    console.log('Services being displayed:', this.filteredServices);
  }
  
  filterBrands(): void {
    if (this.searchTerm) {
      this.filteredBrands = this.allBrands.filter(brand => 
        brand.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredBrands = [...this.allBrands];
    }
    
    if (this.selectedService) {
      // Here you would typically navigate to car selection or booking confirmation
      console.log('Service and brand selected:', this.selectedService.name);
      // this.proceedToBooking();
    }
  }
  
  // Navigation methods
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  
  goToDealer(): void {
    this.router.navigate(['/dealer']);
  }
  
  goToBookRental(): void {
    this.router.navigate(['/book-rental']);
  }
  
  goToMyBookings(): void {
    this.router.navigate(['/my-bookings']);
  }
  
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  public logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
