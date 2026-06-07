import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookServiceBooking {
  id?: number;
  userMobile: string;
  dealerId: number;
  serviceId: number;
  brandId: number;
  vehicleId: number;
  carNumber: string;
  carModel: string;
  carBrand: string;
  carYear?: number;
  carColor?: string;
  additionalNotes?: string;
  price: number;
  status: 'pending' | 'paid' | 'approved' | 'rejected' | 'completed';
  bookingStatus?: string;
  serviceStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  bankName?: string;
  transactionId?: string;
  paymentId?: string;
  createdAt?: string;
  updatedAt?: string;
  dealer?: {
    id: number;
    name: string;
    ownerName: string;
    registrationNumber: string;
    gstNumber: string;
    address: string;
    mobile: string;
    email: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  service?: {
    id: number;
    name: string;
    estimatedTime: string;
    rentalAllowed: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  vehicle?: {
    id: number;
    brand: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RentalBooking {
  id?: number;
  customerMobile: string;
  customerId: number;
  customerName: string;
  dealerId: number;
  dealerName: string;
  executiveCarId: number;
  carCategory: string;
  carNumber: string;
  minKm: number;
  extraKm: number;
  maxKm: number;
  gearType: string;
  fuelType: string;
  seats: number;
  pricePerDay: number;
  rentalDays: number;
  totalAmount: number;
  paymentMethod: string;
  paymentMethodType: string;
  bankName?: string;
  paymentStatus: string;
  rentalStatus: string;
  fuelPolicy: string;
  insurancePolicy: string;
  agreementAccepted: boolean;
  digitalSignature: string;
  transactionId: string;
  createdAt?: string;
  updatedAt?: string;
  executiveCar?: {
    id: number;
    category: string;
    carNumber: string;
    minKm: number;
    extraKm: number;
    maxKm: number;
    gearType: string;
    fuelType: string;
    seats: number;
    pricePerDay: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  dealer?: {
    id: number;
    name: string;
    ownerName: string;
    registrationNumber: string;
    gstNumber: string;
    address: string;
    mobile: string;
    email: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface VehicleDetails {
  carNumber: string;
  carModel: string;
  carBrand: string;
  year?: number;
  color?: string;
  additionalNotes?: string;
}

export interface CreateBookingRequest {
  userMobile: string;
  dealerId: number;
  serviceId: number;
  brandId: number;
  vehicleId: number;
  carNumber: string;
  carModel: string;
  carBrand: string;
  carYear?: number;
  carColor?: string;
  additionalNotes?: string;
  price: number;
  // Payment method details
  PaymentMethod?: string;
  PaymentMethodType?: string;
  // Card payment details
  CardName?: string;
  CardNumber?: string;
  CardExpiry?: string;
  CardCvv?: string;
  // UPI details
  UpiId?: string;
  // Net Banking details
  BankName?: string;
}

export interface CreateBookingResponse {
  message: string;
  booking: BookServiceBooking;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = 'http://localhost:5000/api/booking'; // Direct API URL to avoid proxy issues

  constructor(private http: HttpClient) {}

  // Create a new booking with pending status
  createBooking(bookingRequest: CreateBookingRequest): Observable<CreateBookingResponse> {
    // Map the request to match our new BookingController endpoint
    const createBookingRequest = {
      ...bookingRequest,
      PaymentMethod: bookingRequest.PaymentMethod || 'online',
      PaymentMethodType: bookingRequest.PaymentMethodType || 'card'
    };
    return this.http.post<CreateBookingResponse>(`${this.baseUrl}/create`, createBookingRequest);
  }

  // Get bookings by user mobile number
  getBookingsByUser(userMobile: string): Observable<BookServiceBooking[]> {
    return this.http.get<BookServiceBooking[]>(`${this.baseUrl}/user/${userMobile}`);
  }

  // Get bookings by dealer ID
  getBookingsByDealer(dealerId: number): Observable<BookServiceBooking[]> {
    return this.http.get<BookServiceBooking[]>(`${this.baseUrl}/dealer/${dealerId}`);
  }

  // Get bookings by status (for dealer approval)
  getBookingsByStatus(status: string): Observable<BookServiceBooking[]> {
    return this.http.get<BookServiceBooking[]>(`${this.baseUrl}/status/${status}`);
  }

  // Update booking status (for payment, approval, and cancellation)
  updateBookingStatus(bookingId: number, status: string, dealerNotes?: string): Observable<BookServiceBooking> {
    const body = { 
      Status: status, // Match our BookingController parameter name
      DealerNotes: dealerNotes || null
    };
    return this.http.put<BookServiceBooking>(`${this.baseUrl}/${bookingId}/status`, body);
  }

  // Update service status specifically (for service status changes like cancellation)
  updateServiceStatus(bookingId: number, serviceStatus: string, dealerNotes?: string): Observable<BookServiceBooking> {
    const body = { 
      ServiceStatus: serviceStatus,
      DealerNotes: dealerNotes || null
    };
    return this.http.put<BookServiceBooking>(`${this.baseUrl}/${bookingId}/servicestatus`, body);
  }

  // Get booking by ID
  getBookingById(bookingId: number): Observable<BookServiceBooking> {
    return this.http.get<BookServiceBooking>(`${this.baseUrl}/${bookingId}`);
  }

  // Get all bookings (admin)
  getAllBookings(): Observable<BookServiceBooking[]> {
    return this.http.get<BookServiceBooking[]>(this.baseUrl);
  }

  // Legacy methods for backward compatibility
  createOrder(orderRequest: CreateBookingRequest): Observable<CreateBookingResponse> {
    return this.createBooking(orderRequest);
  }

  getOrdersByUser(userMobile: string): Observable<BookServiceBooking[]> {
    return this.getBookingsByUser(userMobile);
  }

  getOrdersByDealer(dealerId: number): Observable<BookServiceBooking[]> {
    return this.getBookingsByDealer(dealerId);
  }

  updateOrderStatus(orderId: number, status: string, paymentId?: string): Observable<BookServiceBooking> {
    return this.updateBookingStatus(orderId, status, paymentId);
  }

  // Rental Booking Methods
  private rentalBaseUrl = 'http://localhost:5000/api/rentalbooking';

  getRentalBookingsByCustomer(mobileNumber: string): Observable<RentalBooking[]> {
    return this.http.get<RentalBooking[]>(`${this.rentalBaseUrl}/customer/${mobileNumber}`);
  }

  getRentalBookingsByDealer(dealerId: number): Observable<RentalBooking[]> {
    return this.http.get<RentalBooking[]>(`${this.rentalBaseUrl}/dealer/${dealerId}`);
  }

  getRentalBookingById(id: number): Observable<RentalBooking> {
    return this.http.get<RentalBooking>(`${this.rentalBaseUrl}/${id}`);
  }

  updateRentalBookingStatus(id: number, status: string): Observable<RentalBooking> {
    return this.http.put<RentalBooking>(`${this.rentalBaseUrl}/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
