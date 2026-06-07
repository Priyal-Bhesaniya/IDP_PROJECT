import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ExecutiveCar {
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

export interface CreateExecutiveCar {
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
}

export interface UpdateExecutiveCar {
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
}

@Injectable({
  providedIn: 'root'
})
export class ExecutiveCarService {
  private readonly apiUrl = 'http://localhost:5000/api/ExecutiveCar';

  constructor(private http: HttpClient) {}

  // Get all executive cars for a specific dealer
  getExecutiveCarsByDealer(dealerId: number): Observable<ExecutiveCar[]> {
    return this.http.get<ExecutiveCar[]>(`${this.apiUrl}/dealer/${dealerId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get a specific executive car by ID
  getExecutiveCarById(id: number): Observable<ExecutiveCar> {
    return this.http.get<ExecutiveCar>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Create a new executive car
  createExecutiveCar(car: CreateExecutiveCar): Observable<ExecutiveCar> {
    return this.http.post<ExecutiveCar>(this.apiUrl, car).pipe(
      catchError(this.handleError)
    );
  }

  // Update an existing executive car
  updateExecutiveCar(id: number, car: UpdateExecutiveCar): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, car).pipe(
      catchError(this.handleError)
    );
  }

  // Delete an executive car
  deleteExecutiveCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Update executive car status
  updateExecutiveCarStatus(id: number, status: 'active' | 'inactive'): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, status, {
      headers: { 'Content-Type': 'text/plain' }
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('ExecutiveCarService Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // Handle specific error cases
      if (error.status === 400) {
        errorMessage = 'Bad request: Please check your input data';
      } else if (error.status === 404) {
        errorMessage = 'Executive car not found';
      } else if (error.status === 500) {
        errorMessage = 'Server error: Please try again later';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
