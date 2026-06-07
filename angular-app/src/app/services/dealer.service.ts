import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dealer {
  id: number;
  name: string;
  ownerName: string;
  registrationNumber: string;
  gstNumber: string;
  address: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  services: number;
  cars: number;
  serviceCapacity: string;
  openingTime: string;
  closingTime: string;
  rentalEnabled: string;
  maxRentalCars: string;
  joinedDate: string;
  role: string;
  garageLogo?: string;
  serviceImages?: string[];
  rentalImages?: string[];
}

export interface NewDealer {
  name: string;
  ownerName: string;
  registrationNumber: string;
  gstNumber: string;
  address: string;
  phone: string;
  serviceCapacity: string;
  openingTime: string;
  closingTime: string;
  rentalEnabled: string;
  maxRentalCars: string;
  role: string;
  garageLogo?: string;
  serviceImages?: string[];
  rentalImages?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DealerService {
  private apiUrl = 'http://localhost:5000/api/dealers'; // Update with your API URL

  constructor(private http: HttpClient) {}

  getDealers(): Observable<Dealer[]> {
    return this.http.get<Dealer[]>(this.apiUrl);
  }

  getDealer(id: number): Observable<Dealer> {
    return this.http.get<Dealer>(`${this.apiUrl}/${id}`);
  }

  getDealerByMobileNumber(mobileNumber: string): Observable<Dealer> {
    return this.http.get<Dealer>(`${this.apiUrl}/by-mobile/${mobileNumber}`);
  }

  createDealer(dealer: NewDealer): Observable<Dealer> {
    return this.http.post<Dealer>(this.apiUrl, dealer);
  }

  updateDealer(id: number, dealer: NewDealer): Observable<Dealer> {
    return this.http.put<Dealer>(`${this.apiUrl}/${id}`, dealer);
  }

  deleteDealer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleDealerStatus(id: number, status: string): Observable<Dealer> {
    return this.http.patch<Dealer>(`${this.apiUrl}/${id}/status`, { status });
  }

  uploadImage(file: File): Observable<{ filename: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ filename: string; url: string }>(`${this.apiUrl}/upload-image`, formData);
  }

  getDealerStats(): Observable<{ total: number; active: number; inactive: number }> {
    return this.http.get<{ total: number; active: number; inactive: number }>(`${this.apiUrl}/stats`);
  }
}
