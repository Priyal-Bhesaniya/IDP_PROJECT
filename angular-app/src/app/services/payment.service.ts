import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentRequest {
  orderId: number;
  amount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking';
  paymentDetails: PaymentDetails;
}

export interface PaymentDetails {
  paymentMethod?: 'card' | 'upi' | 'netbanking';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardName?: string;
  upiId?: string;
  bankName?: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'api/payments'; // Adjust this URL based on your backend

  constructor(private http: HttpClient) {}

  // Process payment for an order
  processPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.baseUrl, paymentRequest);
  }

  // Get payment status
  getPaymentStatus(paymentId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.baseUrl}/${paymentId}/status`);
  }

  // Simulate payment processing (for development)
  simulatePayment(orderId: number, amount: number): Observable<PaymentResponse> {
    // This would connect to a real payment gateway in production
    const mockResponse: PaymentResponse = {
      paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'success',
      transactionId: `TXN_${Date.now()}`,
      message: 'Payment processed successfully'
    };
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockResponse);
        observer.complete();
      }, 2000); // Simulate 2 second processing time
    });
  }
}
