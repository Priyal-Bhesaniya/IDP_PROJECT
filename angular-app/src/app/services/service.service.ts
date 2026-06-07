import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceData {
  id: number;
  name: string;
  estimatedTime: string;
  rentalAllowed: boolean;
  status: string;
  dealerId: number;
  createdAt: string;
  updatedAt?: string;
  dealerServiceVehicles?: DealerServiceVehicle[];
}

export interface DealerServiceVehicle {
  id: number;
  price: number;
  dealerId: number;
  serviceId: number;
  vehicleId: number;
  vehicle: Vehicle;
}

export interface Vehicle {
  id: number;
  brand: string;
  type: string;
  createdAt: string;
}

export interface CreateServiceRequest {
  name: string;
  estimatedTime: string;
  rentalAllowed: boolean;
  dealerId: number;
  vehiclePrices?: VehiclePriceRequest[];
}

export interface UpdateServiceRequest {
  name?: string;
  estimatedTime?: string;
  rentalAllowed?: boolean;
  status?: string;
  vehiclePrices?: VehiclePriceRequest[];
}

export interface VehiclePriceRequest {
  vehicleId: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      })
    };
  }

  // Get all services
  getServices(): Observable<ServiceData[]> {
    return this.http.get<ServiceData[]>(`${this.apiUrl}/services`, this.getHttpOptions());
  }

  // Get services by dealer
  getServicesByDealer(dealerId: number): Observable<ServiceData[]> {
    return this.http.get<ServiceData[]>(`${this.apiUrl}/services/dealer/${dealerId}`, this.getHttpOptions());
  }

  // Get service by ID
  getService(id: number): Observable<ServiceData> {
    return this.http.get<ServiceData>(`${this.apiUrl}/services/${id}`, this.getHttpOptions());
  }

  // Create new service
  createService(service: CreateServiceRequest): Observable<ServiceData> {
    return this.http.post<ServiceData>(`${this.apiUrl}/services`, service, this.getHttpOptions());
  }

  // Update service
  updateService(id: number, service: UpdateServiceRequest): Observable<ServiceData> {
    return this.http.put<ServiceData>(`${this.apiUrl}/services/${id}`, service, this.getHttpOptions());
  }

  // Update service status
  updateServiceStatus(id: number, status: string): Observable<ServiceData> {
    return this.http.patch<ServiceData>(`${this.apiUrl}/services/${id}/status`, { status }, this.getHttpOptions());
  }

  // Delete service
  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/services/${id}`, this.getHttpOptions());
  }

  // Get all vehicles
  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles`, this.getHttpOptions());
  }
}
